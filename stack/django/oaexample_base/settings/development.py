from .base import *

DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

print(f"Loaded Dev variables. Debug = {DEBUG} ")

INSTALLED_APPS += [
    'django_extensions',  # Example of a dev-only app
]


# CORS settings
del CORS_ALLOWED_ORIGIN_REGEXES
del CORS_ALLOWED_ORIGINS
del CSRF_TRUSTED_ORIGINS

ALLOWED_HOSTS = ['*']

"""
# CSRF settings
CSRF_TRUSTED_ORIGINS += [
    "http://*", "https://*",
    'http://[::1]',
    'https://[::1]',
    "http://*:3000", "https://*:3000",
    "http://*:8080", "https://*:8080",
]
"""
CORS_ALLOW_ALL_ORIGINS = True
CSRF_COOKIE_DOMAIN = None
SESSION_COOKIE_DOMAIN = None

CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read the CSRF cookie

# Allow CSRF over invalid certificates (not recommended for production)
HOST_SCHEME="http://"
# SECURE_PROXY_SSL_HEADER = None
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = None
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_FRAME_DENY = False
# Use HTTP for development purposes
SECURE_SSL_REDIRECT = False

CORS_ALLOW_CREDENTIALS = True

# Allow cookies to be sent with cross-origin requests
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_HTTPONLY = False  # Allow JavaScript to read the CSRF cookie

# CSP
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

# Default storage settings, with the staticfiles storage updated.
# See https://docs.djangoproject.com/en/4.2/ref/settings/#std-setting-STORAGES
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    # ManifestStaticFilesStorage is recommended in production, to prevent
    # outdated JavaScript / CSS assets being served from cache
    # (e.g. after a Wagtail upgrade).
    # See https://docs.djangoproject.com/en/4.2/ref/contrib/staticfiles/#manifeststaticfilesstorage
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.ManifestStaticFilesStorage",
    },
}

EMAIL_USE_SSL = False  # True if using SSL
EMAIL_HOST_USER = os.environ.get("SMTP_EMAIL_ADDRESS", "")

ACCOUNT_EMAIL_VERIFICATION = "optional"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_LOGOUT_ON_PASSWORD_CHANGE = False
ACCOUNT_LOGIN_BY_CODE_ENABLED = True
ACCOUNT_AUTHENTICATION_METHOD = "username_email"  # allow both for the sake of databuilder
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_RATE_LIMITS = False
