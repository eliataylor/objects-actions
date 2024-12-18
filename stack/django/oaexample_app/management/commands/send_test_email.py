# yourapp/management/commands/send_test_email.py
from django.core.mail import send_mail
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        send_mail(
            'Test Django Email',
            'This is a test email sent from Django.',
            'info@.com',
            ['eliabrahamtaylor@gmail.com'],
            fail_silently=False,
        )
        self.stdout.write(self.style.SUCCESS('Test email sent successfully.'))
