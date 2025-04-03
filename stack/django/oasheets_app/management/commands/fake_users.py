from django.utils import timezone
import random

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils import timezone
from faker import Faker
from allauth.account.models import EmailAddress
from oaexample_app.models import Users

# Import your models and utility class
from oaexample_app.models import Resources
from .utils import BaseUtilityCommand, CommandUtils


OA_TESTER_GROUP = 'oa-tester'


class Command(BaseUtilityCommand):
    help = 'Creates fake users for testing purposes'

    def add_arguments(self, parser):
        # Add common arguments from the parent class
        super().add_arguments(parser)

        # Add command-specific arguments
        parser.add_argument('--count', type=int, help='Number of fake users to create')
        parser.add_argument('--resources', default=False, action='store_true', help='Assign random resources to users')
        parser.add_argument('--password', type=str, default='APasswordYouShouldChange', help='Password for created users')

    def handle_command(self, *args, **options):
        fake = Faker()
        count = options['count']
        assign_resources = options['resources']
        password = options['password']
        # Users = get_user_model()

        group = Group.objects.filter(name=OA_TESTER_GROUP).first()
        if not group:
            print('Group not found')
            return

        # Get available resources if we're going to assign them
        resources = list(Resources.objects.all()) if assign_resources else []

        self.stdout.write(self.style.SUCCESS(f'Creating {count} fake users'))

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

                picture = CommandUtils.get_random_image(f"{username}_profile")
                cover_photo = CommandUtils.get_random_image(f"{username}_cover")

                user, created = Users.objects.get_or_create(
                    username=username,
                    email=email,
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'is_staff': False,
                        'is_superuser': False,
                        'is_active': True,
                        'date_joined': fake.date_time_between(start_date='-1y', end_date='now',tzinfo=timezone.get_current_timezone()),
                        'last_login': fake.date_time_between(start_date='-1m', end_date='now',tzinfo=timezone.get_current_timezone()),
                        'password': password,
                        'phone': phone,
                        'website': f"https://{fake.domain_name()}/{username}",
                        'bio': fake.paragraph(nb_sentences=5),
                        'cover_photo': cover_photo,
                        'picture': picture,
                    }
                )

                if created:
                    # add to tester group
                    user.groups.add(group)
                    # Mark the email as verified
                    EmailAddress.objects.create(
                        user=user,
                        email=email,
                        verified=True,
                        primary=True,
                    )
                    print(f"Created and verified user: {email}")
                else:
                    user.set_password("APasswordYouShouldChange")
                    user.groups.add(group)
                    user.save()
                    print(f"User already exists.")

                # Assign random resources if available
                if resources and assign_resources:
                    # Assign between 1 and 5 random resources
                    num_resources = min(len(resources), random.randint(1, 5))
                    random_resources = random.sample(resources, num_resources)
                    user.resources.add(*random_resources)
                    user.save()

                created_users += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating user: {e}"))

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_users} fake users'))
