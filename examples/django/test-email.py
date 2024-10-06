from dotenv import load_dotenv
import django
from django.core.mail import send_mail
from django.conf import settings
import os

def my_django_send_mail():
    sender = os.environ.get("DEFAULT_FROM_EMAIL")
    recipient = 'eliabrahamtaylor@gmail.com'
    subject = 'Test Email - dev'
    body = 'This is a test email.'

    print(f"From: {sender}")
    print(f"To: {recipient}")
    send_mail(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=False,
    )


if __name__ == '__main__':
    load_dotenv()  # Add this line to load the .env file
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "oaexample_base.settings")
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ''))
#    if os.path.exists(ROOT_DIR + '/.env.prod'):
#        load_dotenv(dotenv_path=ROOT_DIR + '/.env.prod', override=True)
    django.setup()
    my_django_send_mail()