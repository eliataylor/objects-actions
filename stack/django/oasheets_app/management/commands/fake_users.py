from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.core.files.base import ContentFile
from django.conf import settings

from faker import Faker
import random
import requests
import os
from io import BytesIO
from datetime import timedelta

# Import your Users model and Resources model (adjust the import path as needed)
from oaexample_app.models import Users, Resources


class Command(BaseCommand):
    help = 'Creates fake users for testing purposes'

    def add_arguments(self, parser):
        parser.add_argument('count', type=int, help='Number of fake users to create')
        parser.add_argument('--resources', action='store_true', help='Assign random resources to users')
        parser.add_argument('--admin', action='store_true', help='Create admin users')
        parser.add_argument('--password', type=str, default='password123', help='Password for created users')

    def handle(self, *args, **options):
        fake = Faker()
        count = options['count']
        assign_resources = options['resources']
        create_admin = options['admin']
        password = options['password']

        # Get available resources if we're going to assign them
        resources = list(Resources.objects.all()) if assign_resources else []

        self.stdout.write(self.style.SUCCESS(f'Creating {count} fake users...'))

        created_users = 0

        for i in range(count):
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

                # Get and save profile picture
                try:
                    img_width = random.choice([300, 400, 500])
                    img_height = random.choice([300, 400, 500])
                    img_url = f"https://picsum.photos/{img_width}/{img_height}"
                    img_response = requests.get(img_url, timeout=5)
                    if img_response.status_code == 200:
                        img_name = f"{username}_profile.jpg"
                        user.picture.save(img_name, ContentFile(img_response.content))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Could not save profile picture for {username}: {e}"))

                # Get and save cover photo
                try:
                    cover_width = random.choice([800, 1000, 1200])
                    cover_height = random.choice([300, 400, 500])
                    cover_url = f"https://picsum.photos/{cover_width}/{cover_height}"
                    cover_response = requests.get(cover_url, timeout=5)
                    if cover_response.status_code == 200:
                        cover_name = f"{username}_cover.jpg"
                        user.cover_photo.save(cover_name, ContentFile(cover_response.content))
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
