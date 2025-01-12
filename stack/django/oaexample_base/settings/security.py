import os
from urllib.parse import urlparse
from corsheaders.defaults import default_headers
from .base import myEnv, logger, DJANGO_ENV

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

SECRET_KEY = myEnv('DJANGO_SECRET_KEY', 'default')
SUPERUSER_USERNAME = myEnv('DJANGO_SUPERUSER_USERNAME', 'superadmin')
SUPERUSER_PASSWORD = myEnv('DJANGO_SUPERUSER_PASSWORD', 'admin')
SUPERUSER_EMAIL = myEnv('DJANGO_SUPERUSER_EMAIL', 'info@oaexample.com')

ALLOWED_HOSTS = [get_tld(API_HOST_PARTS.hostname), f".{get_tld(API_HOST_PARTS.hostname)}"]

# experimenting by adding the APP_HOST as and ALLOWED_HOST (per https://github.com/pennersr/django-allauth/issues/4041)
if get_tld(APP_HOST_PARTS.hostname) not in ALLOWED_HOSTS:
    ALLOWED_HOSTS += [f"{get_tld(APP_HOST_PARTS.hostname)}", f".{get_tld(APP_HOST_PARTS.hostname)}"]

CORS_ALLOWED_ORIGINS = [APP_HOST, API_HOST]
DEV_PORT = '3000' if not APP_HOST_PARTS.port else APP_HOST_PARTS.port

# allow localhost to tap production to ease front-end dev contributors
CORS_ALLOWED_ORIGINS += [f"{APP_HOST_PARTS.scheme}://localhost:{DEV_PORT}",
                         f"{APP_HOST_PARTS.scheme}://127.0.0.1:{DEV_PORT}",
                         f"{APP_HOST_PARTS.scheme}://localhost.oaexample.com:{DEV_PORT}",
                         f"{APP_HOST_PARTS.scheme}://reactjs-service:{DEV_PORT}",
                         f"{API_HOST_PARTS.scheme}://django-service:8080"]

if DJANGO_ENV != 'production':
    # for docker networking
    ALLOWED_HOSTS += ["localhost", "127.0.0.1", "django-service"]

CORS_ALLOW_CREDENTIALS = True # using cookies
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-email-verification-key',  # used by allauth
    'X-App-Client',  # used by mobile to toggle to Token auth
]

logger.warning(f"Allowing Hosts: {", ".join(ALLOWED_HOSTS)}")

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

CSRF_COOKIE_SECURE = APP_HOST_PARTS.scheme == 'https'
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read the CSRF cookie

# In order to use databuilder inside docker against django also in your django-service container, you'll have to set `CSRF_COOKIE_DOMAIN = None`
if DJANGO_ENV == 'testing-cypress':
    CSRF_COOKIE_DOMAIN = None
    CSRF_COOKIE_SAMESITE = None
elif DJANGO_ENV != 'production':
    CSRF_COOKIE_DOMAIN = f".{get_tld(APP_HOST_PARTS.hostname)}"
    CSRF_COOKIE_SAMESITE = 'Lax'
else:
    CSRF_COOKIE_DOMAIN = f".{get_tld(APP_HOST_PARTS.hostname)}"
    CSRF_COOKIE_SAMESITE = 'Lax'

logger.warning(f"Allowed Origins: {CSRF_COOKIE_DOMAIN}")
logger.warning(f"Allowed Trusted/CSRF Domains: {", ".join(CSRF_TRUSTED_ORIGINS)}")

# same for session cookies
SESSION_COOKIE_DOMAIN = CSRF_COOKIE_DOMAIN
SESSION_COOKIE_SAMESITE = CSRF_COOKIE_SAMESITE
SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE
SESSION_COOKIE_HTTPONLY = CSRF_COOKIE_HTTPONLY

if API_HOST_PARTS.scheme.lower() == 'https':
#    SECURE_SSL_REDIRECT = True # only use if not served behind a reverse proxy like Cloud Run / Nginx /..
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True  # Apply HSTS to all subdomains
    SECURE_HSTS_PRELOAD = True  # Allow the site to be included in browsers' HSTS preload list


if DJANGO_ENV == 'production':
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
