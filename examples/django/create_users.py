import os
import django
from faker import Faker
from django.contrib.auth import get_user_model
from allauth.account.models import EmailAddress

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oaexample_app.settings')
django.setup()

fake = Faker()
User = get_user_model()

def generate_email_variations(email):
    name, domain = email.split('@')
    users = []


    for i in range(1, len(name)):
        new_name = name[:i] + '.' + name[i:]
        new_email = new_name + '@' + domain
        users.append({"email":new_email})

    return users

def buildUsers(user_data_list):
    for user_data in user_data_list:
        email = user_data['email']
        first_name = user_data.get('first_name')
        if first_name is None:
            first_name = fake.first_name()
        last_name = user_data.get('last_name')
        if last_name is None:
            last_name = fake.last_name()

        password = "1234"

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
                'password': password,  # Set password
            }
        )

        if created:
            # Mark the email as verified
            EmailAddress.objects.create(
                user=user,
                email=email,
                verified=True,
                primary=True,
            )
            print(f"Created and verified user: {email}")
        else:
            user.set_password("1234")
            user.save()
            print(f"User already exists: {email}. Reset password")


base_list = [
    {
        "email": "eli@pickupmvp.com",
        "first_name": "Eli",
        "last_name": "Taylor"
    },
    {
        "email": "eliabrahamtaylor@gmail.com",
        "first_name": "Mr.",
        "last_name": "T"
    },
    {
        "email": "eli@trackauthoritymusic.com",
        "first_name": "Aaron",
        "last_name": "G"
    },
    {
        "email": "eli@taylormadetraffic.com",
        "first_name": "Aaron",
        "last_name": "G"
    },
    {
        "email": "hackabletester@gmail.com",
        "first_name": "Hank",
        "last_name": "Slayer"
    },
    {
        "email": "imminentvictory03@gmail.com",
        "first_name": "Imminent",
        "last_name": "Victory"
    },
    {
        "email": "jakechaoca@gmail.com",
        "first_name": "Jake",
        "last_name": "Chao"
    },
    {
        "email": "zachebelca@gmail.com",
        "first_name": "Zachary",
        "last_name": "Ebel"
    }
]

def build_user_variations(user_data_list):
    buildUsers(user_data_list)
    for user_data in user_data_list:
        email_variations = generate_email_variations(user_data['email'])
        buildUsers(email_variations)

build_user_variations(base_list)

print("Done.")