from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.core.files.base import ContentFile
from django.conf import settings

from faker import Faker
import random
import os
from datetime import timedelta

# Import your models and utility class
from oaexample_app.models import Users, Resources
from .utils import BaseUtilityCommand, CommandUtils


class Command(BaseUtilityCommand):
    help = 'Creates fake users for testing purposes'

    def add_arguments(self, parser):
        # Add common arguments from the parent class
        super().add_arguments(parser)

        # Add command-specific arguments
        parser.add_argument('count', type=int, help='Number of fake users to create')
        parser.add_argument('--resources', action='store_true', help='Assign random resources to users')
        parser.add_argument('--admin', action='store_true', help='Create admin users')
        parser.add_argument('--password', type=str, default='password123', help='Password for created users')

    def handle_command(self, *args, **options):
        fake = Faker()
        count = options['count']
        assign_resources = options['resources']
        create_admin = options['admin']
        password = options['password']
        start = options['start']

        # Get available resources if we're going to assign them
        resources = list(Resources.objects.all()) if assign_resources else []

        self.stdout.write(self.style.SUCCESS(f'Creating {count} fake users (starting at index {start})...'))

        created_users = 0

        for i in range(start, start + count):
            try:
                # Generate a random profile
                first_name = fake.first_name()
                last_name = fake.last_name()
                username = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}"
                email = f"{username}@{fake.domain_name()}"

                # Generate a valid phone number in the format +1XXXXXXXXXX
                phone = f"+1{fake.numerify('##########')}"

                # Create the user
                user = Users(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    is_staff=create_admin,
                    is_superuser=create_admin,
                    is_active=True,
                    date_joined=fake.date_time_between(start_date='-1y', end_date='now',
                                                       tzinfo=timezone.get_current_timezone()),
                    last_login=fake.date_time_between(start_date='-1m', end_date='now',
                                                      tzinfo=timezone.get_current_timezone()),
                    password=make_password(password),
                    phone=phone,
                    website=f"https://{fake.domain_name()}/{username}",
                    bio=fake.paragraph(nb_sentences=5),
                )

                # Save the user first so we can attach images
                user.save()

                # Get and save profile picture using the utility class
                try:
                    img_name = f"{username}_profile"
                    user.picture = CommandUtils.get_random_image(img_name)
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Could not save profile picture for {username}: {e}"))

                # Get and save cover photo using the utility class
                try:
                    cover_name = f"{username}_cover"
                    user.cover_photo = CommandUtils.get_random_image(cover_name)
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Could not save cover photo for {username}: {e}"))

                # Assign random resources if available
                if resources and assign_resources:
                    # Assign between 1 and 5 random resources
                    num_resources = min(len(resources), random.randint(1, 5))
                    random_resources = random.sample(resources, num_resources)
                    user.resources.add(*random_resources)

                self.stdout.write(f"Created user {created_users + 1}/{count}: {username}")
                created_users += 1

                # Save again to ensure all related objects are properly linked
                user.save()

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating user: {e}"))

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_users} fake users'))
