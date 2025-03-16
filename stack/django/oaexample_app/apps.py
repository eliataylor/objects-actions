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
                Group.objects.get_or_create(name="IsVerified")
                Group.objects.get_or_create(name="IsPaidUser")
                Group.objects.get_or_create(name="IsAdmin")
                Group.objects.get_or_create(name="IsRallyAttendee")
                Group.objects.get_or_create(name="IsCitySponsor")
                Group.objects.get_or_create(name="IsCityOfficial")
                Group.objects.get_or_create(name="IsRallySpeaker")
                Group.objects.get_or_create(name="IsRallyModerator")

        post_migrate.connect(create_groups)
####OBJECT-ACTIONS-PERMISSIONS-ROLE-GROUPS-ENDS####