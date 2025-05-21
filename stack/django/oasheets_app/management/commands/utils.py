import json
import datetime
import json
import os
import random
from io import BytesIO

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management.base import BaseCommand


class CommandUtils:
    """
    Utility class for Django management commands to share common functionality.
    Handles image downloads, geo-lookups, and provides common command arguments.
    """

    # Load the geo-lookups once for efficient reuse
    PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BASE_DIR = os.path.dirname(PROJECT_DIR)
    GEO_LOOKUPS_PATH = os.path.join(BASE_DIR, 'management/commands', 'geo-lookups.json')
    try:
        with open(GEO_LOOKUPS_PATH, 'r') as f:
            GEO_LOOKUPS = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Warning: Could not load geo-lookups.json: {e}")
        GEO_LOOKUPS = {}

    @classmethod
    def add_common_arguments(cls, parser):
        """
        Add common arguments used across multiple commands.

        Args:
            parser: The ArgumentParser instance from the command
        """
        parser.add_argument(
            '--batch_size',
            type=int,
            default=500,
            help='Number of records to process in a batch before committing'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Maximum number of records to process'
        )
        parser.add_argument(
            '--start',
            type=int,
            default=0,
            help='Line number in the CSV to start processing from'
        )
        parser.add_argument(
            '--file',
            type=str,
            help='Path to the input file'
        )

    @classmethod
    def download_image(cls, icon_url, filename=False):
        response = requests.get(icon_url, timeout=5)
        image_file = None
        if not filename:
            filename = os.path.basename(icon_url)
        if response.status_code == 200:
            image_file = SimpleUploadedFile(
                name=filename,
                content=response.content,
                content_type='image/jpeg'
            )
        return image_file

    @classmethod
    def save_svg(cls, svg_string, title):
        """
        Convert SVG string to a file and return the file path

        Args:
            svg_string (str): The SVG content as a string

        Returns:
            ContentFile: A Django ContentFile containing the SVG
        """
        try:
            safe_title = title.lower().replace(' ', '_').replace('-', '_')
            # Remove any special characters
            safe_title = ''.join(c for c in safe_title if c.isalnum() or c == '_')
            filename = f"{safe_title}.svg"

            # Create a ContentFile from the SVG string
            svg_file = ContentFile(svg_string.encode('utf-8'), name=filename)

            return svg_file
        except Exception as e:
            print(f"Error saving SVG: {str(e)}")
            return None


    @classmethod
    def get_random_image(cls, seed, overwrite=False):
        """
        Generate and return a random image file for a given seed.
        Uses fixed dimensions of 800x600 and generates a random fallback color.

        Args:
            seed (str): Seed string to generate consistent images
            overwrite (bool): Whether to overwrite existing files with the same name

        Returns:
            SimpleUploadedFile or None: The image file or None if generation failed
        """
        # Hardcoded dimensions
        width = 800
        height = 600

        try:
            # Create a unique filename
            filename = f"{seed.lower().replace(' ', '-')}.jpg"

            # If overwrite is enabled, check if file exists and delete it
            if overwrite:

                # Get current year and month for date-based paths
                current_date = datetime.datetime.now()
                year_month = current_date.strftime('%Y-%m')

                # Construct path based on your MEDIA_ROOT and expected upload path
                potential_paths = [
                    os.path.join(settings.MEDIA_ROOT, 'pictures', filename),
                    os.path.join(settings.MEDIA_ROOT, 'covers', filename),
                    os.path.join(settings.MEDIA_ROOT, 'images', filename),
                    # Add date-based paths
                    os.path.join(settings.MEDIA_ROOT, 'uploads', year_month, filename),
                    os.path.join(settings.MEDIA_ROOT, 'media', 'uploads', year_month, filename)
                ]

                # Also check for previous months (up to 3 months back)
                for i in range(1, 4):
                    previous_date = current_date - datetime.timedelta(days=30 * i)
                    prev_year_month = previous_date.strftime('%Y-%m')
                    potential_paths.append(os.path.join(settings.MEDIA_ROOT, 'uploads', prev_year_month, filename))
                    potential_paths.append(
                        os.path.join(settings.MEDIA_ROOT, 'media', 'uploads', prev_year_month, filename))

                # Delete any existing files with this name
                for path in potential_paths:
                    if os.path.exists(path):
                        try:
                            os.remove(path)
                            print(f"Deleted existing file: {path}")
                        except Exception as e:
                            print(f"Could not delete file {path}: {e}")

            # Create a placeholder image URL
            image_url = f"https://picsum.photos/seed/{seed}/{width}/{height}"

            # Download the image with timeout
            response = requests.get(image_url, timeout=5)
            if response.status_code == 200:
                # Create a SimpleUploadedFile from the image data
                image_file = SimpleUploadedFile(
                    name=filename,
                    content=response.content,
                    content_type='image/jpeg'
                )
                return image_file
            else:
                print(f"Warning: Failed to download image for {seed}")
                # Generate random fallback color
                fallback_color = f"#{random.randint(0, 0xFFFFFF):06x}"
                return cls.create_fallback_image(filename, width, height, fallback_color)
        except Exception as e:
            print(f"Warning: Error getting image for {seed}: {str(e)}")
            # Generate random fallback color
            fallback_color = f"#{random.randint(0, 0xFFFFFF):06x}"
            return cls.create_fallback_image(filename, width, height, fallback_color)

    @classmethod
    def create_fallback_image(cls, filename, width=800, height=600, color=None):
        """
        Create a fallback solid color image when fetching from external source fails.
        Requires Pillow to be installed.

        Args:
            filename (str): Desired filename
            width (int): Image width (defaults to 800)
            height (int): Image height (defaults to 600)
            color (str): Hex color code or None for random color

        Returns:
            SimpleUploadedFile or None: The image file or None if creation failed
        """
        try:
            from PIL import Image

            # Generate random color if none provided
            if not color:
                r = random.randint(100, 240)
                g = random.randint(100, 240)
                b = random.randint(100, 240)
            else:
                # Parse hex color
                color = color.lstrip('#')
                r, g, b = tuple(int(color[i:i + 2], 16) for i in (0, 2, 4))

            # Create a new image with the specified color
            image = Image.new('RGB', (width, height), (r, g, b))

            # Save to BytesIO
            output = BytesIO()
            image.save(output, format='JPEG')
            output.seek(0)

            # Create a SimpleUploadedFile
            image_file = SimpleUploadedFile(
                name=filename,
                content=output.read(),
                content_type='image/jpeg'
            )
            return image_file
        except Exception as e:
            print(f"Warning: Failed to create fallback image: {str(e)}")
            return None

    @classmethod
    def get_sumlev_description(cls, sumlev):
        """
        Maps SUMLEV codes to human-readable descriptions.

        Args:
            sumlev (str): The summary level code

        Returns:
            str: Human-readable description
        """
        try:
            return cls.GEO_LOOKUPS['sumlevCodes'].get(sumlev, f"Unknown Geographic Entity ({sumlev})")
        except (KeyError, TypeError):
            return f"Unknown Geographic Entity ({sumlev})"

    @classmethod
    def get_funcstat_description(cls, funcstat):
        """
        Maps FUNCSTAT codes to human-readable descriptions.

        Args:
            funcstat (str): The functional status code

        Returns:
            str: Human-readable description
        """
        try:
            return cls.GEO_LOOKUPS['funcstatCodes'].get(funcstat, f"Entity of Unknown Status ({funcstat})")
        except (KeyError, TypeError):
            return f"Entity of Unknown Status ({funcstat})"

    @classmethod
    def get_state_name_from_code(cls, state_code):
        """
        Get full state name from state code.

        Args:
            state_code (str): Two-letter state abbreviation

        Returns:
            str: Full state name or original state_code if not found
        """
        try:
            return cls.GEO_LOOKUPS['stateAbbreviations'].get(state_code, state_code)
        except (KeyError, TypeError):
            return state_code

    @classmethod
    def get_state_code_from_name(cls, state_name):
        """
        Get full state name from state code.

        Args:
            state_name (str): Full state name or original state_code if not found

        Returns:
            str:
        """
        reversed_dict = {v: k for k, v in cls.GEO_LOOKUPS['stateAbbreviations'].items()}

        # Handle case sensitivity by converting input to title case
        state_name = state_name.strip().title()

        # Look up the state code
        return reversed_dict.get(state_name)

    @classmethod
    def get_timezone_for_state(cls, state_name):
        """
        Gets the appropriate timezone for a state based on its region.

        Args:
            state_name (str): The full state name

        Returns:
            str: Timezone string (e.g., 'America/New_York')
        """
        try:
            # Check special cases first (Alaska and Hawaii)
            if state_name in cls.GEO_LOOKUPS['timeZonesByRegion']['other']:
                return cls.GEO_LOOKUPS['timeZonesByRegion']['other'][state_name]

            # Check regional groups
            if state_name in cls.GEO_LOOKUPS['timeZonesByRegion']['eastCoast']:
                return cls.GEO_LOOKUPS['timeZonesByRegion']['defaultZones']['eastCoast']

            if state_name in cls.GEO_LOOKUPS['timeZonesByRegion']['central']:
                return cls.GEO_LOOKUPS['timeZonesByRegion']['defaultZones']['central']

            if state_name in cls.GEO_LOOKUPS['timeZonesByRegion']['mountain']:
                return cls.GEO_LOOKUPS['timeZonesByRegion']['defaultZones']['mountain']

            if state_name in cls.GEO_LOOKUPS['timeZonesByRegion']['pacific']:
                return cls.GEO_LOOKUPS['timeZonesByRegion']['defaultZones']['pacific']

            # Default fallback
            return cls.GEO_LOOKUPS['timeZonesByRegion']['defaultZones']['default']
        except (KeyError, TypeError):
            # If anything goes wrong, return a default timezone
            return "America/New_York"

    @classmethod
    def try_parse_int(cls, value):
        """
        Safely parse integer values from string.

        Args:
            value: Value to parse

        Returns:
            int or None: Parsed integer or None if parsing fails
        """
        if not value or not isinstance(value, str):
            return None

        value = value.strip()
        if not value:
            return None

        try:
            return int(value)
        except (ValueError, TypeError):
            return None

    @classmethod
    def get_tax_exempt_description(cls, tax_code):
        """
        Get description for IRS tax exempt code.

        Args:
            tax_code (str): The tax code

        Returns:
            str: Description of the tax exempt code
        """
        try:
            return cls.GEO_LOOKUPS['irsTaxExemptCodes'].get(tax_code, f"Tax Code {tax_code}")
        except (KeyError, TypeError):
            return f"Tax Code {tax_code}"


class BaseUtilityCommand(BaseCommand):
    """
    Base command class that includes utility methods and default arguments.
    Extend this class instead of BaseCommand for consistency.
    """

    def add_arguments(self, parser):
        """Add common arguments to all commands that extend this class"""
        CommandUtils.add_common_arguments(parser)

        # Additional arguments specific to this command should be added
        # in the subclass by calling super().add_arguments(parser) first

    def handle(self, *args, **options):
        """Common setup handling"""
        self.options = options
        self.batch_size = options.get('batch_size', 500)
        self.limit = options.get('limit')
        self.start = options.get('start', 0)

        # Call the actual implementation
        self.handle_command(*args, **options)

    def handle_command(self, *args, **options):
        """
        Implement this method in subclasses instead of handle
        """
        raise NotImplementedError("Subclasses must implement handle_command()")
