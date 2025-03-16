####OBJECT-ACTIONS-PERMISSIONS-ROLE-GROUPS-STARTS####
from django.apps import AppConfig

class OaexampleAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'oaexample_app'

    def ready(self):
        from django.contrib.auth.models import Group
        from django.db.models.signals import post_migrate

        def create_groups(sender, **kwargs):
            if sender.name == self.name:  # Only run for this app
                # Create tester group
                Group.objects.get_or_create(name="oa-tester")

                # Create role groups
                Group.objects.get_or_create(name="verified")
                Group.objects.get_or_create(name="paid user")
                Group.objects.get_or_create(name="admin")
                Group.objects.get_or_create(name="rally attendee")
                Group.objects.get_or_create(name="city sponsor")
                Group.objects.get_or_create(name="city official")
                Group.objects.get_or_create(name="rally speaker")
                Group.objects.get_or_create(name="rally moderator")

        post_migrate.connect(create_groups)
####OBJECT-ACTIONS-PERMISSIONS-ROLE-GROUPS-ENDS####