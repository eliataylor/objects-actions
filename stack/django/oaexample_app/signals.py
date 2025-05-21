from allauth.account.signals import email_confirmed
from django.contrib.auth.models import Group
from django.dispatch import receiver

from models import Cities


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

# Add signals to update state aggregations when cities are deleted
from django.db.models.signals import post_delete
from django.dispatch import receiver

@receiver(post_delete, sender=Cities)
def update_state_on_city_delete(sender, instance, **kwargs):
    if instance.state_id:
        instance.state_id.update_aggregations()
