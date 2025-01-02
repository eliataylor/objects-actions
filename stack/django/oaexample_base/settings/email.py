import os
from .base import *
from urllib.parse import urlparse


# how are emails sent: django | gmail | sendgrid | smtp
OA_ENV_EMAIL = os.getenv("OA_ENV_EMAIL", "django")
print(f"EMAIL USING: {OA_ENV_EMAIL} ")

API_HOST = os.getenv('REACT_APP_API_HOST', 'https://localapi.oaexample.com:8080')
API_HOST_PARTS = urlparse(API_HOST)

#Default is SMTP server configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST_USER = myEnv("EMAIL_HOST_USER", "info@oaexample.com")
EMAIL_HOST_PASSWORD = myEnv("EMAIL_HOST_PASSWORD")
EMAIL_HOST = myEnv("SMTP_EMAIL_HOST", 'smtp.gmail.com')
EMAIL_PORT = myEnv("SMTP_EMAIL_PORT", 587)
EMAIL_USE_TLS = True

print(f"Using {EMAIL_HOST_USER}")

DEFAULT_FROM_EMAIL = myEnv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)
ADMIN_EMAIL = myEnv("ADMIN_EMAIL", EMAIL_HOST_USER)
EMAIL_USE_LOCALTIME = True
EMAIL_USE_SSL = API_HOST_PARTS.scheme == 'https'

if OA_ENV_EMAIL == 'django':
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
elif OA_ENV_EMAIL == 'sendgrid':
    EMAIL_HOST = 'smtp.sendgrid.net'
    EMAIL_HOST_USER = 'apikey'  # this is exactly the value 'apikey'


TWILIO_ACCOUNT_SID = myEnv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = myEnv("TWILIO_AUTH_TOKEN", "")
TWILIO_VERIFY_SERVICE_SID = myEnv("TWILIO_VERIFY_SERVICE_SID", "")
TWILIO_PHONE_NUMBER = myEnv("TWILIO_PHONE_NUMBER", "")


"""
# in docker it's created at ~/.ssl/certificate.crt
if DEBUG:
    import certifi
    EMAIL_SSL_CERTFILE = certifi.where()
    if os.path.isfile(EMAIL_SSL_CERTFILE) and os.access(EMAIL_SSL_CERTFILE, os.R_OK):
        print(f"SSL certificate file is valid and readable: {EMAIL_SSL_CERTFILE}")
    else:
        print(f"SSL certificate file is not valid or readable: {EMAIL_SSL_CERTFILE}")
"""
