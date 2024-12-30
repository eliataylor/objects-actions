from django.contrib.auth import get_user_model
from allauth.account.models import EmailAddress
from django.core.management.base import BaseCommand
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
        last_name = user_data.get('last_name')
        password = "APasswordYouShouldChange"

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
            user.set_password("APasswordYouShouldChange")
            user.save()
            print(f"User already exists: {email}. Reset password")


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        base_list = [
            {
                "email": "info@oaexample.com",
                "first_name": "Eli",
                "last_name": "Taylor"
            },
            {
                "email": "hackabletester@gmail.com",
                "first_name": "Hank",
                "last_name": "Slayer"
            }
        ]
        buildUsers(base_list)
        for user_data in base_list:
            email_variations = generate_email_variations(user_data['email'])
            buildUsers(email_variations)
        self.stdout.write(self.style.SUCCESS('Test email sent successfully.'))
