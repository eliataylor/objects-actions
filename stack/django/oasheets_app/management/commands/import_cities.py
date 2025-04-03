import os
import csv
from collections import defaultdict
from typing import Dict, List, Optional, Tuple
from django.conf import settings
from django.db import transaction

# Import your models and the new utility class
from oaexample_app.models import Cities, States
from .utils import BaseUtilityCommand, CommandUtils


class Command(BaseUtilityCommand):
    help = 'Import cities from a CSV file and update state aggregations'

    def add_arguments(self, parser):
        # Add common arguments from the parent class
        super().add_arguments(parser)

    def handle_command(self, *args, **options):
        file_path = options['file']
        batch_size = options['batch_size']
        limit = options['limit']
        start = options['start']

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Starting city import from {file_path} (starting at line {start}, limit {limit} batching {batch_size}) '))

        # First, collect all state data and create states
        self.stdout.write('Collecting state data...')
        state_data = self.collect_state_data(file_path, limit, start)

        # Create/update states
        state_map = self.upsert_states(state_data)

        # Now process cities one by one in batches
        self.stdout.write(f'Importing cities')
        self.import_cities_in_batches(file_path, state_map, batch_size, limit, start)

        # Update state aggregations
        self.stdout.write('Updating state aggregations...')
        self.update_state_aggregations(state_map.values())

        self.stdout.write(self.style.SUCCESS('City import completed successfully'))

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
                        'state_code': row.get('STATE', ''),  # Get state code from CSV
                    }

                if row_count % 1000 == 0:
                    self.stdout.write(f'Processed {row_count} rows for state data...')

        self.stdout.write(f'State data collection complete. Found {len(state_data)} states.')
        return state_data

    def process_city_batch(self, batch_rows, state_map):
        """
        Process a batch of city rows inside a single transaction
        Returns counts of created, updated, and error cities
        """
        created_count = 0
        updated_count = 0
        error_count = 0

        with transaction.atomic():
            for row in batch_rows:
                try:
                    state_name = row.get('STNAME', '').strip()
                    city_name = row.get('NAME', '').strip()

                    # Skip if state or city name is missing
                    if not state_name or not city_name:
                        continue

                    # Skip if state not found in our state_map
                    if state_name not in state_map:
                        self.stdout.write(self.style.WARNING(f"State '{state_name}' not found for city '{city_name}'"))
                        error_count += 1
                        continue

                    # Extract city data
                    city_data = self.extract_city_data(row, state_name)

                    # Get state object
                    state = state_map[state_name]

                    # Create or update city
                    result = self.upsert_city(city_data, state)
                    if result == 'created':
                        created_count += 1
                    elif result == 'updated':
                        updated_count += 1
                    else:
                        error_count += 1

                    self.stdout.write(f'CITY: {result}: {city_name}')

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing city from row: {str(e)}"))
                    error_count += 1

        return created_count, updated_count, error_count

    def import_cities_in_batches(self, file_path: str, state_map: Dict[str, States], batch_size: int,
                                 limit: Optional[int] = None, start: int = 0):
        """
        Import cities one by one in batches to respect transaction boundaries
        """
        total_cities = 0
        created_count = 0
        updated_count = 0
        error_count = 0
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

            # Start a transaction for the first batch
            with transaction.atomic():
                for row in reader:
                    try:
                        total_cities += 1

                        if limit and total_cities > limit:
                            break

                        # Add this row to the current batch
                        batch_cities.append(row)

                        # Process batch if we've reached the batch size
                        if len(batch_cities) >= batch_size:
                            created, updated, errors = self.process_city_batch(batch_cities, state_map)
                            created_count += created
                            updated_count += updated
                            error_count += errors

                            # Reset for next batch
                            batch_cities = []
                            current_batch = 0

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error processing city from row: {str(e)}"))
                        error_count += 1

        # Process any remaining cities in the last batch
        if len(batch_cities) > 0:
            created, updated, errors = self.process_city_batch(batch_cities, state_map)
            created_count += created
            updated_count += updated
            error_count += errors
            self.stdout.write(f'Final batch: Created: {created}, Updated: {updated}, Errors: {errors}')

        self.stdout.write(
            f'City import complete. Total processed: {total_cities}, Created: {created_count}, Updated: {updated_count}, Errors: {error_count}')

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
                        # We'll update the aggregation fields later
                    }
                )

                state_map[state_name] = state
                action = 'Created' if created else 'Updated'
                self.stdout.write(f'{action} state: {state_name}')

        return state_map

    def upsert_city(self, city_data, state):
        """
        Create or update a single city
        """
        try:
            # Generate descriptions for SUMLEV and FUNCSTAT codes
            sumlev_description = CommandUtils.get_sumlev_description(city_data['sumlev'])
            funcstat_description = CommandUtils.get_funcstat_description(city_data['funcstat'])

            # Generate timezone for the state
            timezone = CommandUtils.get_timezone_for_state(state.name)

            # Download images for the city (with error handling)
            picture = CommandUtils.get_random_image(f"{city_data['name'].replace(' ', '')}")
            cover_photo = CommandUtils.get_random_image(f"{city_data['name'].replace(' ', '')}-cover")

            # Create description
            description = f"{city_data['name']} is a {sumlev_description} located in {city_data['county']} County, {state.name}. It is currently an {funcstat_description} (SUMLEV: {city_data['sumlev']}, FUNCSTAT: {city_data['funcstat']})."

            # Create or update the city
            city, created = Cities.objects.update_or_create(
                name=city_data['name'],
                state_id=state,
                defaults={
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
                    'picture': picture,
                    'cover_photo': cover_photo
                }
            )

            if created:
                print(f'Created city: {city_data["name"]}')
            else:
                print(f'Updated city: {city_data["name"]}')

            return 'created' if created else 'updated'

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating/updating city {city_data['name']}: {str(e)}"))
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
