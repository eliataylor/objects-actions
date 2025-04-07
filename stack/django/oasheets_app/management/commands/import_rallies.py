# Import your models and utility class
import json
import os

from oaexample_app.models import Rallies, Topics
from .utils import BaseUtilityCommand, CommandUtils


class Command(BaseUtilityCommand):
    help = 'Imports rallies from a JSON file'

    def add_arguments(self, parser):
        # Add common arguments from the parent class
        super().add_arguments(parser)

    def handle_command(self, *args, **options):
        file_path = options['file']

        # Check if file exists
        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        try:
            # Open and read the JSON file
            with open(file_path, 'r', encoding='utf-8') as f:
                rallies_data = json.load(f)

            # Validate JSON structure
            if not isinstance(rallies_data, list):
                self.stderr.write(self.style.ERROR('JSON file must contain a list of rally objects'))
                return

            created_count = 0
            existing_count = 0

            for rally_data in rallies_data:
                title = rally_data['title']

                # Save SVG to file
                icon_file = None
                if 'icon' in rally_data and rally_data['icon']:
                    icon_file = CommandUtils.save_svg(rally_data['icon'], title)

                # Get Topic objects for the related topics
                topic_objects = []
                if 'relatedTopics' in rally_data and isinstance(rally_data['relatedTopics'], list):
                    topic_objects = list(Topics.objects.filter(name__in=rally_data['relatedTopics']))

                # Create or get the rally
                rally, created = Rallies.objects.get_or_create(
                    title=title,
                    defaults={
                        'media': icon_file,
                        'description': rally_data.get('description', '')
                    }
                )

                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f'Created new rally: {title}'))
                else:
                    existing_count += 1
                    rally.media = icon_file or rally.media
                    rally.description = rally_data.get('description', rally.description)
                    rally.save()
                    self.stdout.write(f'Updated existing rally: {title}')

                # Set topics (Many-to-Many relationship)
                if topic_objects:
                    rally.topics.set(topic_objects)

            self.stdout.write(self.style.SUCCESS(
                f'Import completed: {created_count} rallies created, {existing_count} existing rallies updated'
            ))

        except json.JSONDecodeError:
            self.stderr.write(self.style.ERROR('Invalid JSON format in file'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error importing rallies: {str(e)}'))
