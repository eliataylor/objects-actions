from email.policy import default

from django.utils import timezone
import random

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils import timezone
from faker import Faker
from allauth.account.models import EmailAddress
# from oaexample_app.models import Users

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
        parser.add_argument('--count', type=int, default=1, help='Number of fake users to create')
        parser.add_argument('--resources', default=False, action='store_true', help='Assign random resources to users')
        parser.add_argument('--password', type=str, default='APasswordYouShouldChange',help='Password for created users')
        parser.add_argument('--reuse-images', type=bool, default=False, help='Reuse images from existing oa-tester users')

    def handle_command(self, *args, **options):
        fake = Faker()
        count = options['count']
        password = options['password']
        reuse_images = options['reuse_images']
        Users = get_user_model()

        test_users = list(Users.objects.filter(
            groups__name=OA_TESTER_GROUP,
        )[:100])  # Limit to first 20 matching users

        group = Group.objects.filter(name=OA_TESTER_GROUP).first()
        if not group:
            print('Group not found')
            return

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

                picture = None
                cover_photo = None
                if reuse_images and test_users:
                    picture = random.choice(test_users).picture
                    cover_photo = random.choice(test_users).cover_photo
                else:
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
                        'date_joined': fake.date_time_between(start_date='-1y', end_date='now',
                                                              tzinfo=timezone.get_current_timezone()),
                        'last_login': fake.date_time_between(start_date='-1m', end_date='now',
                                                             tzinfo=timezone.get_current_timezone()),
                        'password': password,
                        'phone': phone,
#                        'website': f"https://{fake.domain_name()}/{username}",
#                        'bio': fake.paragraph(nb_sentences=5),
                        'cover_photo': cover_photo,
                        'picture': picture
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
                    # user.set_password("APasswordYouShouldChange")
                    # user.groups.add(group)
                    # user.save()
                    print(f"User already exists.")

                created_users += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating user: {e}"))

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_users} fake users'))
