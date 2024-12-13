from .base import *

DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

print(f"Loaded Dev variables. Debug = {DEBUG} ")

INSTALLED_APPS += [
    'django_extensions',  # Example of a dev-only app
]


ALLOWED_HOSTS = ['*']
# CORS settings
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://\w+\.oaexample\.com$",
    r"^http://\w+\.oaexample\.com$",
]
CORS_ALLOWED_ORIGINS += [
    'http://localhost.oaexample.com:3000',
    'https://localhost.oaexample.com:3000',
    'http://localhost.oaexample.com',
    'https://oaexample.com',
    'https://www.oaexample.com',
    'https://dev.oaexample.com',
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
    "http://*", "https://*",
    "http://*:3000", "https://*:3000",
    "http://*:8080", "https://*:8080",
]

# CSRF settings
CSRF_TRUSTED_ORIGINS += [
    'http://localhost.oaexample.com:3000',
    'https://localhost.oaexample.com:3000',
    'http://localhost-api.oaexample.com:8080',
    'https://localhost-api.oaexample.com:8080',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
    'https://127.0.0.1:3000',
    'https://localhost:8080',
    'https://127.0.0.1:8080',
    "http://*", "https://*",
    "http://*:3000", "https://*:3000",
    "http://*:8080", "https://*:8080",
]
CORS_ALLOW_ALL_ORIGINS = True

CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read the CSRF cookie

# Allow CSRF over invalid certificates (not recommended for production)
HOST_SCHEME="http://"
SECURE_PROXY_SSL_HEADER = None
SECURE_HSTS_SECONDS = None
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_FRAME_DENY = False
# Use HTTP for development purposes
SECURE_SSL_REDIRECT = False

# Allow cookies to be sent with cross-origin requests
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = True
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
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
