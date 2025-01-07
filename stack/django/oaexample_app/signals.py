from django.contrib.auth.models import Group
from allauth.account.signals import email_confirmed
from django.dispatch import receiver

@receiver(email_confirmed)
def add_user_to_verified_group(request, email_address, **kwargs):
    # Get the user associated with the verified email
    user = email_address.user

    # Get or create the "verified" group
    verified_group, created = Group.objects.get_or_create(name="verified")

    # Add the user to the "verified" group if they are not already in it
    if not user.groups.filter(name="verified").exists():
        print('adding user to verified group')
        user.groups.add(verified_group)
