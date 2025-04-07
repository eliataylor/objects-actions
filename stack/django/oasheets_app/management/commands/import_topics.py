# Import your models and utility class
import json
import os

from oaexample_app.models import Topics
from .utils import BaseUtilityCommand, CommandUtils


class Command(BaseUtilityCommand):
    help = 'Creates fake users for testing purposes'

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
                topics_data = json.load(f)

            # Validate JSON structure
            if not isinstance(topics_data, list):
                self.stderr.write(self.style.ERROR('JSON file must contain a list of topic objects'))
                return

            created_count = 0
            existing_count = 0

            for topic_item in topics_data:
                # Validate required fields
                if 'name' not in topic_item:
                    self.stderr.write(self.style.WARNING(f'Skipping item without name: {topic_item}'))
                    continue

                name = topic_item['name']
                icon = CommandUtils.download_image(topic_item['icon'])

                # Create or get the topic
                topic, created = Topics.objects.get_or_create(
                    name=name,
                    defaults={'icon': icon}
                )

                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f'Created new topic: {name}'))
                else:
                    existing_count += 1
                    topic.icon = icon
                    topic.save()
                    self.stdout.write(f'Found existing topic: {name}')

            self.stdout.write(self.style.SUCCESS(
                f'Import completed: {created_count} topics created, {existing_count} existing topics found'
            ))

        except json.JSONDecodeError:
            self.stderr.write(self.style.ERROR('Invalid JSON format in file'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error importing topics: {str(e)}'))
