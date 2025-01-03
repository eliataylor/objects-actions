import os
from urllib.parse import urlparse
from corsheaders.defaults import default_headers
from .base import myEnv

def get_tld(hostname):
    if hostname:
        parts = hostname.split(".")
        if hostname == "localhost" or hostname.replace(".", "").isdigit():
            # Handle localhost or IP
            result = hostname
        else:
            # Get the last two parts for domain names
            result = ".".join(parts[-2:])
        return result
    else:
        return hostname


APP_HOST = os.getenv('REACT_APP_APP_HOST', 'https://localhost.oaexample.com:3000')
APP_HOST_PARTS = urlparse(APP_HOST)
API_HOST = os.getenv('REACT_APP_API_HOST', 'https://localapi.oaexample.com:8080')
API_HOST_PARTS = urlparse(API_HOST)

SECRET_KEY = myEnv('DJANGO_SECRET_KEY', 'm(##s4x5rs))6f09xu_xq@1a3-*5sm@n8bh^9dm(p46-%t@et%')
SUPERUSER_USERNAME = myEnv('DJANGO_SUPERUSER_USERNAME', 'superadmin')
SUPERUSER_PASSWORD = myEnv('DJANGO_SUPERUSER_PASSWORD', 'admin')
SUPERUSER_EMAIL = myEnv('DJANGO_SUPERUSER_EMAIL', 'info@oaexample.com')

ALLOWED_HOSTS = [get_tld(API_HOST_PARTS.hostname), f".{get_tld(API_HOST_PARTS.hostname)}"]

CORS_ALLOWED_ORIGINS = [API_HOST, APP_HOST]
CORS_ALLOW_CREDENTIALS = True # using cookies
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-email-verification-key',  # used by allauth
    'X-App-Client',  # used by mobile to toggle to Token auth
]

CSRF_TRUSTED_ORIGINS = [APP_HOST, API_HOST]
CSRF_COOKIE_DOMAIN = f".{get_tld(APP_HOST_PARTS.hostname)}"
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = APP_HOST_PARTS.scheme == 'https'
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read the CSRF cookie


SESSION_COOKIE_DOMAIN = f".{get_tld(APP_HOST_PARTS.hostname)}"
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = APP_HOST_PARTS.scheme == 'https'
SESSION_COOKIE_HTTPONLY = False  # Allow JavaScript to read the CSRF cookie

if API_HOST_PARTS.scheme.lower() == 'https':
#    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True  # Apply HSTS to all subdomains
    SECURE_HSTS_PRELOAD = True  # Allow the site to be included in browsers' HSTS preload list


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


if APP_HOST == 'localhost' or API_HOST == 'localhost':
    CSP_DEFAULT_SRC = ("'self'", "*")
    CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "'unsafe-eval'", "*")
    CSP_STYLE_SRC = ("'self'", "'unsafe-inline'", "*")
    CSP_IMG_SRC = ("'self'", "data:", "*")
    CSP_CONNECT_SRC = ("'self'", "*")
    CSP_FONT_SRC = ("'self'", "*")
    CSP_FRAME_SRC = ("'self'", "*")
    CSP_BASE_URI = ("'self'", "*")
    CSP_FORM_ACTION = ("'self'", "*")
    CSP_INCLUDE_NONCE_IN = ['script-src']
