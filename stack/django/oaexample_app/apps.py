from django.apps import AppConfig

class OaexampleAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'oaexample_app'

    def ready(self):
        from django.contrib.auth.models import Group
        from django.db.models.signals import post_migrate
        import oaexample_app.signals

        def create_oa_tester_group(sender, **kwargs):
            Group.objects.get_or_create(name="oa-tester")
        post_migrate.connect(create_oa_tester_group, sender=self)

