from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


# This file is only needed by the databuilder which works best when it can log in as any user to test creating, reading, updating, and deleting (CRUD)

class Command(BaseCommand):
    help = "Update all users' passwords to a given string"

    def add_arguments(self, parser):
        parser.add_argument(
            'password',
            type=str,
            help="The new password to set for all users."
        )

    def handle(self, *args, **options):
        new_password = options['password']
        User = get_user_model()
        users_updated = 0

        base_list = User.objects.filter(groups__name='oa-tester')
        for user in base_list:
            user.set_password(new_password)
            user.save()
            users_updated += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully updated passwords for {users_updated} users."))
