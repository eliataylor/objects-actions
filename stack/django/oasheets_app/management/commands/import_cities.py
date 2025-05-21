import csv
import os
from typing import Dict, Optional

from django.db import transaction

# Import your models and the new utility class
from oaexample_app.models import Cities, States
from .utils import BaseUtilityCommand, CommandUtils


class Command(BaseUtilityCommand):
    help = 'Import cities from a CSV file and update state aggregations'

    def add_arguments(self, parser):
        # Add common arguments from the parent class
        super().add_arguments(parser)

        parser.add_argument('--reuse-images', type=bool, default=True,
                            help='Reuse images from existing cities instead of download')

    def handle_command(self, *args, **options):
        file_path = options['file']
        batch_size = options['batch_size']
        limit = options['limit']
        start = options['start']
        reuse_images = options.get('reuse_images', True)

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(
            f'Starting city import from {file_path} (starting at line {start}, limit {limit} batching {batch_size}, reuse images: {reuse_images}) '))

        # First, collect all state data and create states
        self.stdout.write('Collecting state data...')
        state_data = self.collect_state_data(file_path, limit, start)

        # Create/update states
        state_map = self.upsert_states(state_data)

        # Now process cities one by one in batches
        self.stdout.write(f'Importing cities')
        self.import_cities_in_batches(file_path, state_map, batch_size, limit, start, reuse_images)

        # Update state aggregations
        # self.stdout.write('Updating state aggregations...')
        # self.update_state_aggregations(state_map.values())
        # self.stdout.write(self.style.SUCCESS('City import completed successfully'))

    def collect_state_data(self, file_path: str, limit: Optional[int] = None, start: int = 0) -> Dict:
        """
        Process the CSV file to collect state data
        """
        state_data = {}  # Dictionary to store state data

        with open(file_path, 'r', encoding='latin-1') as csv_file:
            reader = csv.DictReader(csv_file)
            row_count = 0

            # Skip rows up to the start line
            for _ in range(start):
                try:
                    next(reader)
                    row_count += 1
                except StopIteration:
                    self.stdout.write(self.style.WARNING(f'Start line {start} exceeds file length'))
                    return state_data

            # Process each record to extract state data
            for row in reader:
                row_count += 1

                if limit and row_count > (start + limit):
                    break

                state_name = row.get('STNAME', '').strip()
                if not state_name:
                    continue

                # Process state data
                if state_name not in state_data:
                    state_data[state_name] = {
                        'name': state_name,
                        'state_code':  CommandUtils.get_state_code_from_name(state_name)
                    }

                if row_count % 1000 == 0:
                    self.stdout.write(f'Processed {row_count} rows for state data...')

        self.stdout.write(f'State data collection complete. Found {len(state_data)} states.')
        return state_data

    def process_city_batch(self, batch_rows, state_map, reuse_images=False):
        """
        Process a batch of city rows using Django's bulk operations
        Returns counts of created, updated, and error cities
        """
        error_count = 0

        # Prepare lists for bulk operations
        cities_to_create = []
        existing_cities = {}
        cities_to_update = []

        try:
            with transaction.atomic():
                # First pass: Identify cities to create or update
                for row in batch_rows:
                    try:
                        state_name = row.get('STNAME', '').strip()
                        city_name = row.get('NAME', '').strip()

                        # Skip if state or city name is missing
                        if not state_name or not city_name:
                            continue

                        # Skip if state not found in our state_map
                        if state_name not in state_map:
                            self.stdout.write(
                                self.style.WARNING(f"State '{state_name}' not found for city '{city_name}'"))
                            error_count += 1
                            continue

                        # Extract city data
                        city_data = self.extract_city_data(row, state_name)

                        # Get state object
                        state = state_map[state_name]

                        # Check if city already exists
                        existing_city = Cities.objects.filter(
                            name=city_name,
                            state_id=state
                        ).first()

                        if existing_city:
                            # Prepare for update
                            existing_cities[f"{city_name}_{state.id}"] = {
                                'instance': existing_city,
                                'data': city_data
                            }
                        else:
                            # Prepare data for creation
                            # Generate descriptions for SUMLEV and FUNCSTAT codes
                            sumlev_description = CommandUtils.get_sumlev_description(city_data['sumlev'])
                            funcstat_description = CommandUtils.get_funcstat_description(city_data['funcstat'])

                            # Generate timezone for the state
                            timezone = CommandUtils.get_timezone_for_state(state.name)

                            # Create description
                            description = f"{city_data['name']} is a {sumlev_description} located in {city_data['county']} County, {state.name}. It is currently an {funcstat_description} (SUMLEV: {city_data['sumlev']}, FUNCSTAT: {city_data['funcstat']})."

                            if reuse_images:
                                picture, cover_photo = self.get_random_existing_images()

                            # If not reusing images or no existing images were found, download new ones
                            if not reuse_images or (picture is None and cover_photo is None):
                                self.stdout.write(f"Downloading new images for city: {city_data['name']}")
                                picture = CommandUtils.get_random_image(f"{city_data['name'].replace(' ', '')}")
                                cover_photo = CommandUtils.get_random_image(f"{city_data['name'].replace(' ', '')}-cover")

                            # Create new city object
                            new_city = Cities(
                                name=city_data['name'],
                                state_id=state,
                                author_id=1,
                                description=description,
                                postal_address=f"{city_data['name']}, {state.name}",
                                population=city_data['population'],
                                census2010_pop=city_data['census2010_pop'],
                                county=city_data['county'],
                                sumlev=city_data['sumlev'],
                                funcstat=city_data['funcstat'],
                                place_code=city_data['place_code'],
                                timezone=timezone,
                                picture=picture,
                                cover_photo=cover_photo
                            )
                            cities_to_create.append(new_city)

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error processing city row: {str(e)}"))
                        error_count += 1

                # Bulk create new cities
                if cities_to_create:
                    Cities.objects.bulk_create(cities_to_create)

                # Process updates individually (bulk_update has limitations with complex fields)
                for key, city_info in existing_cities.items():
                    try:
                        existing_city = city_info['instance']
                        city_data = city_info['data']

                        # Update fields
                        existing_city.population = city_data['population']
                        existing_city.census2010_pop = city_data['census2010_pop']
                        existing_city.county = city_data['county']
                        existing_city.sumlev = city_data['sumlev']
                        existing_city.funcstat = city_data['funcstat']
                        existing_city.place_code = city_data['place_code']

                        # Add to update list
                        cities_to_update.append(existing_city)

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error updating city {key}: {str(e)}"))
                        error_count += 1

                # Bulk update
                if cities_to_update:
                    # Specify which fields to update
                    fields_to_update = ['population', 'census2010_pop', 'county', 'sumlev', 'funcstat', 'place_code']
                    Cities.objects.bulk_update(cities_to_update, fields_to_update)

        except Exception as e:
            # If any error occurs in the batch, the entire transaction is rolled back
            self.stdout.write(self.style.ERROR(f"Batch processing error, rolling back: {str(e)}"))
            error_count = len(batch_rows)

        # Log all created cities with their IDs and names
        if cities_to_create:
            self.stdout.write(self.style.SUCCESS(f"Created {len(cities_to_create)} cities:"))
            for city in cities_to_create:
                self.stdout.write(
                    f"  - ID: {city.id}, Name: {city.name}, State: {city.state_id.name if city.state_id else 'N/A'}")

        # Log all updated cities with their IDs and names
        if cities_to_update:
            self.stdout.write(self.style.SUCCESS(f"Updated {len(cities_to_update)} cities:"))
            for city in cities_to_update:
                self.stdout.write(
                    f"  - ID: {city.id}, Name: {city.name}, State: {city.state_id.name if city.state_id else 'N/A'}")

        return len(cities_to_create), len(cities_to_update), error_count

    # Modify import_cities_in_batches method to include reuse_images parameter
    def import_cities_in_batches(self, file_path: str, state_map: Dict[str, States], batch_size: int,
                                 limit: Optional[int] = None, start: int = 0, reuse_images=True):
        """
        Import cities one by one in batches to respect transaction boundaries
        """
        total_cities = 0
        batch_cities = []

        with open(file_path, 'r', encoding='latin-1') as csv_file:
            reader = csv.DictReader(csv_file)
            row_count = 0

            # Skip rows up to the start line
            for _ in range(start):
                try:
                    next(reader)
                    row_count += 1
                except StopIteration:
                    self.stdout.write(self.style.WARNING(f'Start line {start} exceeds file length'))
                    return

            for row in reader:
                try:
                    total_cities += 1
                    row_count += 1
                    if limit and total_cities > limit:
                        break

                    # Add this row to the current batch
                    batch_cities.append(row)

                    # Process batch if we've reached the batch size
                    if len(batch_cities) >= batch_size:
                        created, updated, errors = self.process_city_batch(batch_cities, state_map, reuse_images)

                        # Show progress
                        if batch_size > 1:
                            self.stdout.write(
                                f'Imported batch end index {row_count}: created: {created}, updated: {updated}, errors: {errors}')

                        # Reset for next batch
                        batch_cities = []

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing city from row: {str(e)}"))

        # Process any remaining cities in the last batch
        if batch_cities:
            created, updated, errors = self.process_city_batch(batch_cities, state_map, reuse_images)
            self.stdout.write(f'Final batch: Created: {created}, Updated: {updated}, Errors: {errors}')

        self.stdout.write(f'City import complete!')

    def extract_city_data(self, row, state_name):
        """
        Extract city data from a CSV row
        """
        city_name = row.get('NAME', '').strip()

        # Extract the most recent population estimate
        population = None
        for year in reversed(range(2010, 2020)):  # Try from most recent year backwards
            pop_field = f'POPESTIMATE{year}'
            if pop_field in row and row[pop_field].strip():
                try:
                    population = int(row[pop_field])
                    break
                except (ValueError, TypeError):
                    pass

        if population is None:
            # Try Census 2010 data if no estimates are available
            try:
                population = int(row.get('CENSUS2010POP', 0))
            except (ValueError, TypeError):
                population = 0

        # Create city data dictionary
        city_data = {
            'name': city_name,
            'population': population,
            'county': row.get('COUNTY', '').strip(),
            'sumlev': row.get('SUMLEV', '').strip(),
            'funcstat': row.get('FUNCSTAT', '').strip(),
            'place_code': row.get('PLACE', '').strip(),
            'census2010_pop': CommandUtils.try_parse_int(row.get('CENSUS2010POP', 0))
        }

        return city_data

    def upsert_states(self, state_data: Dict) -> Dict[str, States]:
        """
        Create or update states and return a mapping of state names to State objects
        """
        self.stdout.write('Upserting states...')
        state_map = {}

        with transaction.atomic():
            for state_name, data in state_data.items():
                state, created = States.objects.update_or_create(
                    name=state_name,
                    defaults={
                        'author_id': 1,
                        'state_code': data['state_code'],
                    }
                )

                state_map[state_name] = state
                action = 'Created' if created else 'Updated'
                self.stdout.write(f'{action} state: {state_name}')

        return state_map

    def get_random_existing_images(self):
        """
        Get random profile and cover images from existing cities with non-null funcstat
        Returns tuple of (picture, cover_photo)
        """
        # Check if any cities exist with non-null funcstat
        random_city = Cities.objects.filter(
            funcstat__isnull=False,
            picture__isnull=False,
            cover_photo__isnull=False,
        ).order_by('?')[:1]  # Limit to 1 random users

        if not random_city.exists():
            self.stdout.write("No existing cities with images found for reuse")
            return None, None

        random_city = random_city.first()

        return random_city.picture, random_city.cover_photo

    # Update upsert_city to handle image reuse
    def upsert_city(self, city_data, state, reuse_images=True):
        """
        Create or update a single city
        """
        try:
            # Generate descriptions for SUMLEV and FUNCSTAT codes
            sumlev_description = CommandUtils.get_sumlev_description(city_data['sumlev'])
            funcstat_description = CommandUtils.get_funcstat_description(city_data['funcstat'])

            # Generate timezone for the state
            timezone = CommandUtils.get_timezone_for_state(state.name)

            # Create description
            description = f"{city_data['name']} is a {sumlev_description} located in {city_data['county']} County, {state.name}. It is currently an {funcstat_description} (SUMLEV: {city_data['sumlev']}, FUNCSTAT: {city_data['funcstat']})."

            # Handle image acquisition based on reuse_images flag
            picture = None
            cover_photo = None

            if reuse_images:
                picture, cover_photo = self.get_random_existing_images()

            # If not reusing images or no existing images were found, download new ones
            if not reuse_images or (picture is None and cover_photo is None):
                self.stdout.write(f"Downloading new images for city: {city_data['name']}")
                picture = CommandUtils.get_random_image(f"{city_data['name'].replace(' ', '')}")
                cover_photo = CommandUtils.get_random_image(f"{city_data['name'].replace(' ', '')}-cover")

            # Build the defaults dict
            defaults = {
                'author_id': 1,
                'description': description,
                'postal_address': f"{city_data['name']}, {state.name}",
                'population': city_data['population'],
                'census2010_pop': city_data['census2010_pop'],
                'county': city_data['county'],
                'sumlev': city_data['sumlev'],
                'funcstat': city_data['funcstat'],
                'place_code': city_data['place_code'],
                'timezone': timezone,
            }

            # Only add images to defaults if they exist
            if picture:
                defaults['picture'] = picture
            if cover_photo:
                defaults['cover_photo'] = cover_photo

            # Create or update the city
            city, created = Cities.objects.update_or_create(
                name=city_data['name'],
                state_id=state,
                defaults=defaults
            )

            self.stdout.write(f"City {'created' if created else 'updated'}: {city.name} ({city.id})")

            return 'created' if created else 'updated'

        except Exception as e:
            import traceback
            self.stdout.write(self.style.ERROR(f"Error creating/updating city {city_data['name']}:"))
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
            return 'error'

    def update_state_aggregations(self, states):
        """
        Update aggregation fields for all states based on their cities
        """
        self.stdout.write('Updating state aggregations...')

        for state in states:
            # Update each state's aggregations using the model method
            state.update_aggregations()
            self.stdout.write(f'Updated aggregations for {state.name}')
