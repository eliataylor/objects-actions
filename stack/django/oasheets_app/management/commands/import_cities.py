import os
import csv
import requests
from io import BytesIO
from collections import defaultdict
from typing import Dict, List, Optional, Tuple
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from django.core.files.base import ContentFile
import json

# Import your models
from oaexample_app.models import Cities, States

# Load geo lookups file
GEO_LOOKUPS_PATH = os.path.join(settings.BASE_DIR, 'oasheets_app/management/commands', 'geo-lookups.json')
with open(GEO_LOOKUPS_PATH, 'r') as f:
    GEO_LOOKUPS = json.load(f)


class Command(BaseCommand):
    help = 'Import cities from a CSV file and update state aggregations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            default=os.path.join(settings.BASE_DIR, 'data', 'sub-est2019_all.csv'),
            help='Path to the CSV file'
        )
        parser.add_argument(
            '--batch_size',
            type=int,
            default=500,
            help='Number of cities to process in a batch before committing'
        )

    def handle(self, *args, **options):
        file_path = options['file']
        batch_size = options['batch_size']

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Starting city import from {file_path}'))

        # Process the CSV file
        state_data, cities_data = self.process_csv(file_path)

        # Create/update states
        state_map = self.upsert_states(state_data)

        # Create/update cities in batches
        self.upsert_cities(cities_data, state_map, batch_size)

        # Update state aggregations
        self.update_state_aggregations(state_map.values())

        self.stdout.write(self.style.SUCCESS('City import completed successfully'))

    def try_parse_int(self, value):
        """Safely parse integer values from string."""
        if not value or not isinstance(value, str):
            return None

        value = value.strip()
        if not value:
            return None

        try:
            return int(value)
        except (ValueError, TypeError):
            return None

    def process_csv(self, file_path: str) -> Tuple[Dict, List[Dict]]:
        """
        Process the CSV file and extract state and city data
        """
        self.stdout.write('Processing CSV file...')

        state_data = {}  # Dictionary to store state data
        cities_data = []  # List to store city data

        with open(file_path, 'r', encoding='latin-1') as csv_file:
            reader = csv.DictReader(csv_file)
            row_count = 0

            # Process each record
            for row in reader:
                row_count += 1

                state_name = row.get('STNAME', '').strip()
                if not state_name:
                    continue

                # Process state data
                if state_name not in state_data:
                    state_data[state_name] = {
                        'name': state_name,
                        'state_code': row.get('STATE', ''),  # Get state code from CSV
                        'cities': []
                    }

                # Process city data
                city_name = row.get('NAME', '').strip()
                if not city_name:
                    continue

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
                    'state_name': state_name,
                    'population': population,
                    'county': row.get('COUNTY', '').strip(),
                    'sumlev': row.get('SUMLEV', '').strip(),
                    'funcstat': row.get('FUNCSTAT', '').strip(),
                    'place_code': row.get('PLACE', '').strip(),
                    'census2010_pop': self.try_parse_int(row.get('CENSUS2010POP', 0)) if row.get('CENSUS2010POP',
                                                                                                 '').strip() else None
                }

                cities_data.append(city_data)
                state_data[state_name]['cities'].append(city_data)

                if row_count % 500 == 0:
                    self.stdout.write(f'Processed {row_count} rows...')

        self.stdout.write(f'CSV processing complete. Found {len(cities_data)} cities in {len(state_data)} states.')
        return state_data, cities_data

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

    def get_sumlev_description(self, sumlev: str) -> str:
        """
        Maps SUMLEV codes to human-readable descriptions.

        Args:
            sumlev: The SUMLEV code from the CSV

        Returns:
            A human-readable description of the SUMLEV code
        """
        try:
            return GEO_LOOKUPS['sumlevCodes'].get(sumlev, f"Unknown Geographic Entity ({sumlev})")
        except (KeyError, TypeError):
            return f"Unknown Geographic Entity ({sumlev})"

    def get_funcstat_description(self, funcstat: str) -> str:
        """
        Maps FUNCSTAT codes to human-readable descriptions.

        Args:
            funcstat: The FUNCSTAT code from the CSV

        Returns:
            A human-readable description of the FUNCSTAT code
        """
        try:
            return GEO_LOOKUPS['funcstatCodes'].get(funcstat, f"Entity of Unknown Status ({funcstat})")
        except (KeyError, TypeError):
            return f"Entity of Unknown Status ({funcstat})"

    def get_timezone_for_state(self, state_name: str) -> str:
        """
        Gets the appropriate timezone for a state based on its region.

        Args:
            state_name: The name of the state

        Returns:
            The timezone string for the state
        """
        try:
            # Check special cases first (Alaska and Hawaii)
            if state_name in GEO_LOOKUPS['timeZonesByRegion']['other']:
                return GEO_LOOKUPS['timeZonesByRegion']['other'][state_name]

            # Check regional groups
            if state_name in GEO_LOOKUPS['timeZonesByRegion']['eastCoast']:
                return GEO_LOOKUPS['timeZonesByRegion']['defaultZones']['eastCoast']

            if state_name in GEO_LOOKUPS['timeZonesByRegion']['central']:
                return GEO_LOOKUPS['timeZonesByRegion']['defaultZones']['central']

            if state_name in GEO_LOOKUPS['timeZonesByRegion']['mountain']:
                return GEO_LOOKUPS['timeZonesByRegion']['defaultZones']['mountain']

            if state_name in GEO_LOOKUPS['timeZonesByRegion']['pacific']:
                return GEO_LOOKUPS['timeZonesByRegion']['defaultZones']['pacific']

            # Default fallback
            return GEO_LOOKUPS['timeZonesByRegion']['defaultZones']['default']
        except (KeyError, TypeError):
            # If anything goes wrong, return a default timezone
            return "America/New_York"

    def get_irs_tax_exempt_description(self, tax_code: str) -> str:
        """
        Maps IRS tax exemption codes to human-readable descriptions.

        Args:
            tax_code: The IRS tax exemption code

        Returns:
            A human-readable description of the tax exemption status
        """
        try:
            return GEO_LOOKUPS['irsTaxExemptCodes'].get(tax_code, f"Organization with Tax Code {tax_code}")
        except (KeyError, TypeError):
            return f"Organization with Tax Code {tax_code}"

    def upsert_cities(self, cities_data: List[Dict], state_map: Dict[str, States], batch_size: int):
        """
        Create or update cities in batches
        """
        self.stdout.write('Upserting cities...')

        total_cities = len(cities_data)
        created_count = 0
        updated_count = 0
        error_count = 0

        # Process cities in batches
        for i in range(0, total_cities, batch_size):
            batch = cities_data[i:i + batch_size]

            with transaction.atomic():
                for city_data in batch:
                    try:
                        state_name = city_data['state_name']
                        if state_name not in state_map:
                            self.stdout.write(
                                self.style.WARNING(f"State '{state_name}' not found for city '{city_data['name']}'"))
                            error_count += 1
                            continue

                        state = state_map[state_name]

                        # Generate descriptions for SUMLEV and FUNCSTAT codes
                        sumlev_description = self.get_sumlev_description(city_data['sumlev'])
                        funcstat_description = self.get_funcstat_description(city_data['funcstat'])

                        # Generate timezone for the state
                        timezone = self.get_timezone_for_state(state_name)

                        # Download images for the city
                        picture = None
                        cover_photo = None
                        try:
                            # Download a picture for the city
                            pic_url = f"https://picsum.photos/seed/{city_data['name'].replace(' ', '')}/800/600"
                            pic_response = requests.get(pic_url, timeout=10)
                            if pic_response.status_code == 200:
                                picture_filename = f"{city_data['name'].lower().replace(' ', '-')}.jpg"
                                picture = ContentFile(pic_response.content, name=picture_filename)

                            # Download a cover photo for the city
                            cover_url = f"https://picsum.photos/seed/{city_data['name'].replace(' ', '')}-cover/1200/400"
                            cover_response = requests.get(cover_url, timeout=10)
                            if cover_response.status_code == 200:
                                cover_filename = f"{city_data['name'].lower().replace(' ', '-')}-cover.jpg"
                                cover_photo = ContentFile(cover_response.content, name=cover_filename)
                        except Exception as e:
                            self.stdout.write(
                                self.style.WARNING(f"Error downloading images for {city_data['name']}: {str(e)}"))

                        city, created = Cities.objects.update_or_create(
                            name=city_data['name'],
                            state_id=state,
                            defaults={
                                'author_id': 1,
                                'description': f"{city_data['name']} is a {sumlev_description} located in {city_data['county']} County, {state_name}. It is currently an {funcstat_description} (SUMLEV: {city_data['sumlev']}, FUNCSTAT: {city_data['funcstat']}).",
                                'postal_address': f"{city_data['name']}, {state_name}",
                                'population': city_data['population'],
                                'census2010_pop': city_data['census2010_pop'],
                                'county': city_data['county'],
                                'sumlev': city_data['sumlev'],
                                'funcstat': city_data['funcstat'],
                                'place_code': city_data['place_code'],
                                'timezone': timezone,
                                'picture': picture,
                                'cover_photo': cover_photo,
                            }
                        )

                        if created:
                            created_count += 1
                        else:
                            updated_count += 1

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error processing city {city_data['name']}: {str(e)}"))
                        error_count += 1

            self.stdout.write(f'Processed {min(i + batch_size, total_cities)}/{total_cities} cities...')

        self.stdout.write(
            f'City upsert complete. Created: {created_count}, Updated: {updated_count}, Errors: {error_count}')

    def update_state_aggregations(self, states):
        """
        Update aggregation fields for all states based on their cities
        """
        self.stdout.write('Updating state aggregations...')

        with transaction.atomic():
            for state in states:
                # Get all cities for this state
                cities = Cities.objects.filter(state_id=state)

                # Calculate aggregations
                city_count = cities.count()
                total_pop = sum(city.population or 0 for city in cities)
                avg_pop = total_pop // city_count if city_count > 0 else 0

                # Find largest and smallest cities
                largest_city = None
                smallest_city = None

                if city_count > 0:
                    cities_with_pop = [city for city in cities if city.population]
                    if cities_with_pop:
                        largest_city = max(cities_with_pop, key=lambda x: x.population or 0)
                        smallest_city = min(cities_with_pop, key=lambda x: x.population or 0)

                # Update state object
                state.city_count = city_count
                state.total_city_population = total_pop
                state.avg_city_population = avg_pop
                state.largest_city = largest_city
                state.smallest_city = smallest_city

                # Calculate density if applicable
                if state.state_area and state.population:
                    state.population_density = state.population / state.state_area

                state.save(update_fields=[
                    'city_count', 'total_city_population', 'avg_city_population',
                    'largest_city', 'smallest_city', 'population_density'
                ])

                self.stdout.write(
                    f'Updated aggregations for {state.name}: {city_count} cities, {total_pop} total population')
