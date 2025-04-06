import os
from django.conf import settings
from django.db import transaction
import time
# Import models and utility class
from oaexample_app.models import ResourceTypes, Resources, Cities, States
from .utils import BaseUtilityCommand, CommandUtils
import json


class Command(BaseUtilityCommand):
    help = 'Import charitable organizations from IRS data-download-pub78.txt file'

    def add_arguments(self, parser):
        # Add common arguments from the parent class
        super().add_arguments(parser)

        parser.add_argument('--reuse-images', type=bool, default=True,
                            help='Reuse images from existing cities instead of download')

        # Add command-specific arguments
        parser.add_argument(
            '--price_ccoin',
            type=int,
            default=0,
            help='Default price in community coins for imported resources'
        )

    def handle_command(self, *args, **options):
        file_path = options['file']
        limit = options['limit']
        start = options['start']
        batch_size = options['batch_size']
        price_ccoin = options['price_ccoin']
        reuse_images = options.get('reuse_images', True)

        self.stdout.write(self.style.SUCCESS(f'Starting charity import from {file_path} (starting at line {start})'))

        # Cache to minimize database queries
        self.resource_type_cache = {}
        self.city_cache = {}
        self.state_cache = {}

        # Count variables
        count = 0
        success_count = 0
        error_count = 0
        batch_count = 0
        batch_items = []

        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                # Skip to the starting line
                for _ in range(start):
                    try:
                        next(file)
                    except StopIteration:
                        self.stdout.write(self.style.WARNING(f'Start line {start} exceeds file length'))
                        return

                # Process the file from the start line
                for line in file:
                    count += 1

                    if limit and (count > limit):
                        break

                    if count % 100 == 0:
                        self.stdout.write(
                            f'Processed {count + start} entries (success: {success_count}, errors: {error_count})')

                    try:
                        # Parse the line
                        parts = line.strip().split('|')
                        if len(parts) < 6:
                            self.stdout.write(self.style.WARNING(f'Skipping invalid line: {line}'))
                            continue

                        resource_data = {
                            'ein': parts[0].strip(),
                            'name': parts[1].strip(),
                            'city': parts[2].strip(),
                            'state_code': parts[3].strip(),
                            'country': parts[4].strip(),
                            'type': parts[5].strip(),
                            'price_ccoin': price_ccoin
                        }

                        # Skip if missing crucial data
                        if not resource_data['name'] or not resource_data['type']:
                            self.stdout.write(self.style.WARNING(f'Skipping entry with insufficient data: {line}'))
                            continue

                        # Add to batch
                        batch_items.append(resource_data)
                        batch_count += 1

                        # Process batch if reached batch size
                        if batch_count >= batch_size:
                            processed_count = self.process_batch(batch_items, reuse_images)
                            success_count += processed_count
                            error_count += (batch_count - processed_count)

                            # Reset batch
                            batch_items = []
                            batch_count = 0

                    except Exception as e:
                        error_count += 1
                        self.stderr.write(self.style.ERROR(f'Error processing line: {str(e)}'))

                # Process remaining items in the last batch
                if batch_items:
                    processed_count = self.process_batch(batch_items, reuse_images)
                    success_count += processed_count
                    error_count += (batch_count - processed_count)

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f'File not found: {file_path}'))

        self.stdout.write(self.style.SUCCESS(
            f'Charity import completed. Total: {count}, Success: {success_count}, Errors: {error_count}'
        ))

    def process_batch(self, batch_items, reuse_images=True):
        """Process a batch of items in a single transaction"""
        success_count = 0

        for resource_data in batch_items:
            try:
                times = {'operation_total': time.time()}

                start_time = time.time()
                resource_type = self.get_or_create_resource_type(resource_data['type'])
                times['resource_type'] = round(time.time() - start_time, 4)

                # Get or create city and state if provided
                start_time = time.time()
                city = None
                if resource_data['city'] and resource_data['state_code']:
                    city = self.get_or_create_city(resource_data['city'], resource_data['state_code'])
                times['city'] = round(time.time() - start_time, 4)

                # Generate description based on tax code meaning
                start_time = time.time()
                tax_code_meaning = CommandUtils.get_tax_exempt_description(resource_data['type'])
                description = f"{resource_data['name']} is a {tax_code_meaning} organization"
                if resource_data['city'] and resource_data['state_code']:
                    description += f" located in {resource_data['city']}, {resource_data['state_code']}"
                description += f". EIN: {resource_data['ein']}"
                times['description'] = round(time.time() - start_time, 4)

                # Create postal address
                start_time = time.time()
                postal_address = ', '.join(filter(None, [
                    resource_data['city'],
                    resource_data['state_code'],
                    resource_data['country'] or 'USA'
                ]))
                times['address'] = round(time.time() - start_time, 4)

                # Check if resource already exists by EIN
                start_time = time.time()
                resource = Resources.objects.filter(
                    title=resource_data['name']
                ).first()
                times['query'] = round(time.time() - start_time, 4)

                # Create or update the resource
                if not resource:
                    # Get image for organization
                    start_time = time.time()
                    image = None

                    # Either reuse existing images or download new ones
                    if reuse_images:
                        resource_images = Resources.objects.filter(image__isnull=False).order_by('?')[:1]

                        if resource_images.exists():
                            image = resource_images.first().image

                    if not image:
                        image = CommandUtils.get_random_image(f"{resource_data['ein']}")

                    times['image'] = round(time.time() - start_time, 4)

                    # Create resource
                    start_time = time.time()
                    resource = Resources.objects.create(
                        title=resource_data['name'],
                        description_html=description,
                        postal_address=postal_address,
                        price_ccoin=resource_data['price_ccoin'],
                        image=image,
                        author_id=1  # Default author ID
                    )
                    times['create'] = round(time.time() - start_time, 4)

                    # Add the resource type and city
                    start_time = time.time()
                    if resource_type:
                        resource.resource_type.add(resource_type)

                    if city:
                        resource.cities.add(city)
                    times['m2m'] = round(time.time() - start_time, 4)

                else:
                    # Update existing resource
                    start_time = time.time()
                    resource.title = resource_data['name']
                    resource.description_html = description
                    resource.postal_address = postal_address
                    resource.price_ccoin = resource_data['price_ccoin']
                    resource.save()
                    times['update'] = round(time.time() - start_time, 4)

                    # Update resource type and city
                    start_time = time.time()
                    if resource_type:
                        resource.resource_type.clear()
                        resource.resource_type.add(resource_type)

                    if city:
                        resource.cities.clear()
                        resource.cities.add(city)
                    times['m2m'] = round(time.time() - start_time, 4)

                # Calculate total operation time
                times['operation_total'] = round(time.time() - times['operation_total'], 4)

                # Print timing as JSON
                self.stdout.write(self.style.SUCCESS(f"Processed Resource {resource_data['name']}:"))
                self.stdout.write(json.dumps(times))

                success_count += 1

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error processing resource {resource_data['name']}: {str(e)}"))

        return success_count

    def get_or_create_resource_type(self, tax_code):
        """Gets or creates a resource type for a specific tax code"""
        if tax_code in self.resource_type_cache:
            return self.resource_type_cache[tax_code]

        # Get the description for the tax code from the lookup
        tax_code_description = CommandUtils.get_tax_exempt_description(tax_code)

        # Format the resource type name with "IRS: " prefix
        resource_type_name = f'IRS: {tax_code_description}'

        # Check if this resource type already exists
        resource_type = ResourceTypes.objects.filter(name=resource_type_name).first()

        print(f'searching resource type ${resource_type_name}')

        if not resource_type:
            # Create a new resource type
            resource_type = ResourceTypes.objects.create(
                name=resource_type_name,
                author_id=1  # Default author ID
            )
            self.stdout.write(f'Created resource type: {resource_type_name} with ID: {resource_type.id}')

        # Cache the result
        self.resource_type_cache[tax_code] = resource_type
        return resource_type

    def get_or_create_city(self, city_name, state_code):
        """Gets or creates a city and its related state"""
        cache_key = f'{city_name}|{state_code}'

        if cache_key in self.city_cache:
            return self.city_cache[cache_key]

        # Try to find the city and state
        city = Cities.objects.filter(
            name=city_name,
            state_id__state_code=state_code
        ).first()

        if not city:
            print(f'searching {city_name} with city')
            city = Cities.objects.filter(
                name=f"{city_name} city",
                state_id__state_code=state_code
            ).first()

        if not city:
            print(f'searching {city_name} with town')
            city = Cities.objects.filter(
                name=f"{city_name} town",
                state_id__state_code=state_code
            ).first()

        if not city:
            print(f'searching {city_name} with township')
            city = Cities.objects.filter(
                name=f"{city_name} township",
                state_id__state_code=state_code
            ).first()

        if city:
            self.city_cache[cache_key] = city
            return city

        # City doesn't exist, find or create the state first
        state = self.get_or_create_state(state_code)

        # Generate city data
        city_data = {
            'name': city_name,
            'description': f'{city_name} is a city located in {state.name}.',
            'postal_address': f'{city_name}, {state.name}, USA',
            'state_id': state,
            'author_id': 1  # Default author ID
        }

        # Add image fields with random images
        city_data['picture'] = CommandUtils.get_random_image(f"{city_name.replace(' ', '')}")
        city_data['cover_photo'] = CommandUtils.get_random_image(f"{city_name.replace(' ', '')}-cover")

        # Create the city
        city = Cities.objects.create(**city_data)
        self.stdout.write(f'Created city: {city_name}, {state_code} with ID: {city.id}')

        # Cache the result
        self.city_cache[cache_key] = city
        return city

    def get_or_create_state(self, state_code):
        """Gets or creates a state"""
        if state_code in self.state_cache:
            return self.state_cache[state_code]

        print(f'searching state ${state_code}')

        # Find the state by state code
        state = States.objects.filter(state_code=state_code).first()

        # Get full state name from abbreviation
        state_name = CommandUtils.get_state_name_from_code(state_code)

        if not state:
            # Create the state with basic info
            state = States.objects.create(
                state_code=state_code,
                name=state_name,
                author_id=1  # Default author ID
            )
            self.stdout.write(f'Created state: {state_name} ({state_code}) with ID: {state.id}')

        # Cache the result
        self.state_cache[state_code] = state
        return state
