import os

import requests
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management.base import BaseCommand
from django.db import transaction

# Import models
from oaexample_app.models import ResourceTypes, Resources, Cities, States
from oasheets_app.management.commands.import_cities import GEO_LOOKUPS


class Command(BaseCommand):
    help = 'Import charitable organizations from IRS data-download-pub78.txt file'

    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, help='Path to the data-download-pub78.txt file')
        parser.add_argument('--limit', type=int, help='Limit the number of records to import')

    def handle(self, *args, **options):
        file_path = options.get('file')
        limit = options.get('limit')

        if not file_path:
            file_path = os.path.join(settings.BASE_DIR, 'data', 'data-download-pub78.txt')

        self.stdout.write(self.style.SUCCESS(f'Starting charity import from {file_path}'))

        # Load geo-lookups.json for tax codes
        self.geo_lookups = {
            "PC": "Public Charity",
            "PF": "Private Foundation",
            "POF": "Private Operating Foundation",
            "SOUNK": "Supporting Organization, Type Unknown",
            "SO1": "Supporting Organization, Type I",
            "SO2": "Supporting Organization, Type II",
            "SO3F": "Supporting Organization, Type III Functionally Integrated",
            "SO3NF": "Supporting Organization, Type III Non-Functionally Integrated",
            "EO": "Exempt Organization",
            "GROUP": "Group Exemption",
            "LODGE": "Fraternal Organization or Lodge",
            "FORGN": "Foreign Organization",
            "CHURCH": "Church or Religious Organization",
            "SCHOOL": "Educational Institution or School",
            "HOSPITAL": "Hospital or Medical Research Organization",
            "GOVT": "Governmental Unit",
            "CHAR": "Charitable Organization",
            "DP": "Domestic Private Foundation",
            "FP": "Foreign Private Foundation"
        }

        # Cache to minimize database queries
        self.resource_type_cache = {}
        self.city_cache = {}
        self.state_cache = {}

        # Count variables
        count = 0
        success_count = 0
        error_count = 0

        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                for line in file:
                    count += 1

                    if limit and count > limit:
                        break

                    if count % 100 == 0:
                        self.stdout.write(
                            f'Processed {count} entries (success: {success_count}, errors: {error_count})')

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
                            'type': parts[5].strip()
                        }

                        # Skip if missing crucial data
                        if not resource_data['name'] or not resource_data['type']:
                            self.stdout.write(self.style.WARNING(f'Skipping entry with insufficient data: {line}'))
                            continue

                        # Create or update the resource
                        with transaction.atomic():
                            # Get or create resource type
                            resource_type = self.get_or_create_resource_type(resource_data['type'])

                            # Get or create city and state if provided
                            city = None
                            if resource_data['city'] and resource_data['state']:
                                city = self.get_or_create_city(resource_data['city'], resource_data['state_code'])

                            # Generate description based on tax code meaning
                            tax_code_meaning = self.geo_lookups.get('irsTaxExemptCodes', {}).get(resource_data['type'],
                                                                                                 resource_data['type'])
                            description = f"{resource_data['name']} is a {tax_code_meaning} organization"
                            if resource_data['city'] and resource_data['state_code']:
                                description += f" located in {resource_data['city']}, {resource_data['state_code']}"
                            description += f". EIN: {resource_data['ein']}"

                            # Create postal address
                            postal_address = ', '.join(filter(None, [
                                resource_data['city'],
                                resource_data['state_code'],
                                resource_data['country'] or 'USA'
                            ]))

                            # Check if resource already exists by EIN
                            resource = Resources.objects.filter(
                                description_html__contains=f"EIN: {resource_data['ein']}").first()

                            # Create or update the resource
                            if not resource:
                                # Get image for organization
                                image = self.get_random_image(f"{resource_data['ein']}")

                                resource = Resources.objects.create(
                                    title=resource_data['name'],
                                    description_html=description,
                                    postal_address=postal_address,
                                    price_ccoin=resource_data['price_ccoin'],
                                    image=image
                                )

                                # Add the resource type and city
                                if resource_type:
                                    resource.resource_type.add(resource_type)

                                if city:
                                    resource.cities.add(city)

                                success_count += 1
                                self.stdout.write(f"Created resource: {resource_data['name']}")
                            else:
                                # Update existing resource
                                resource.title = resource_data['name']
                                resource.description_html = description
                                resource.postal_address = postal_address
                                resource.price_ccoin = resource_data['price_ccoin']
                                resource.save()

                                # Update resource type and city
                                if resource_type:
                                    resource.resource_type.clear()
                                    resource.resource_type.add(resource_type)

                                if city:
                                    resource.cities.clear()
                                    resource.cities.add(city)

                                success_count += 1
                                self.stdout.write(f"Updated resource: {resource_data['name']}")

                    except Exception as e:
                        error_count += 1
                        self.stderr.write(self.style.ERROR(f'Error processing line: {str(e)}'))

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f'File not found: {file_path}'))

        self.stdout.write(self.style.SUCCESS(
            f'Charity import completed. Total: {count}, Success: {success_count}, Errors: {error_count}'
        ))

    def get_or_create_resource_type(self, tax_code):
        """Gets or creates a resource type for a specific tax code"""
        if tax_code in self.resource_type_cache:
            return self.resource_type_cache[tax_code]

        # Get the description for the tax code from the lookups
        irs_tax_exempt_codes = self.geo_lookups.get('irsTaxExemptCodes', {})
        tax_code_description = irs_tax_exempt_codes.get(tax_code, f'Tax Code {tax_code}')

        # Format the resource type name with "IRS: " prefix
        resource_type_name = f'IRS: {tax_code_description}'

        # Check if this resource type already exists
        resource_type = ResourceTypes.objects.filter(name=resource_type_name).first()

        if not resource_type:
            # Create a new resource type
            resource_type = ResourceTypes.objects.create(name=resource_type_name)
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

        if city:
            self.city_cache[cache_key] = city
            return city

        # City doesn't exist, find or create the state first
        state = self.get_or_create_state(state_code)

        # Generate city data
        city_data = {
            'name': city_name,
            'description': f'{city_name} is a city located in {state_code}.',
            'postal_address': f'{city_name}, {state_code}, USA',
            'state_id': state
        }

        # Add image fields with random images
        city_data['picture'] = self.get_random_image(f"{city_name.replace(' ', '')}")
        city_data['cover_photo'] = self.get_random_image(f"{city_name.replace(' ', '')}-cover")

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

        # Find the state by name
        state = States.objects.filter(state_code=state_code).first()
        if state_code not in GEO_LOOKUPS['stateAbbreviations']:
            self.stdout.write(f'Invalid State state: {state_code}')
            state_name = state_code
        else:
            state_name = GEO_LOOKUPS['stateAbbreviations'][state_code]

        if not state:
            # Create the state with basic info
            state = States.objects.create(
                state_code=state_code,
                name=state_name
            )
            self.stdout.write(f'Created state: {state_code} with ID: {state.id}')

        # Cache the result
        self.state_cache[state_code] = state
        return state

    def get_random_image(self, seed):
        """Generate and return a random image file for a given seed"""
        try:
            # Create a unique filename
            filename = f"{seed.lower().replace(' ', '-')}.jpg"

            # Create a placeholder image URL
            image_url = f"https://picsum.photos/seed/{seed}/800/600"

            # Download the image
            response = requests.get(image_url)
            if response.status_code == 200:
                # Create a SimpleUploadedFile from the image data
                image_file = SimpleUploadedFile(
                    name=filename,
                    content=response.content,
                    content_type='image/jpeg'
                )
                return image_file
            else:
                # If the image can't be downloaded, return None
                self.stderr.write(self.style.WARNING(f"Failed to download image for {seed}"))
                return None
        except Exception as e:
            self.stderr.write(self.style.WARNING(f"Error getting image for {seed}: {str(e)}"))
            return None
