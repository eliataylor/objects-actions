import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(PROJECT_DIR)

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'm(##s4x5rs))6f09xu_xq@1a3-*5sm@n8bh^9dm(p46-%t@et%')


DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

SUPERUSER_USERNAME = os.getenv('DJANGO_SUPERUSER_USERNAME', 'superadmin')
SUPERUSER_PASSWORD = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin')
SUPERUSER_EMAIL = os.getenv('DJANGO_SUPERUSER_EMAIL', 'info@oaexample.com')

ALLOWED_HOSTS = [
    "oaexample.com",
    ".oaexample.com",
    "prod_app.storage.googleapis.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://oaexample-django-app-cloudrun-zzv45b5nya-uw.a.run.app",
    "https://prod_app.storage.googleapis.com"
    "https://oaexample.com",
    "https://*.oaexample.com",
]

from corsheaders.defaults import default_headers

CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-email-verification-key',  # used by allauth
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://\w+\.oaexample\.com$",
    r"^http://\w+\.oaexample\.com$",
]
CORS_ALLOWED_ORIGINS = [
    'https://oaexample.com',
    'https://www.oaexample.com',
    "https://prod_app.storage.googleapis.com"
]

CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read the CSRF cookie

SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = False  # Allow JavaScript to read the CSRF cookie

CORS_ALLOW_CREDENTIALS = True

# CSRF_TRUSTED_ORIGINS += CORS_ALLOWED_ORIGINS
# CSRF_COOKIE_NAME = "oaexample-jwt"

# JWT_AUTH_COOKIE = "oaexample-jwt"
# JWT_AUTH_REFRESH_COOKIE = "oaexample-refresh-jwt"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    'django.contrib.sessions',
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'django.contrib.humanize',
#    'django.contrib.sites',
    'storages',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',

    #    'address',
    #    'djmoney',

    "allauth",
    "allauth.account",

    "allauth.socialaccount",
    'allauth.socialaccount.providers.google',
    "allauth.mfa",
    "allauth.headless",
    "allauth.usersessions",

    'oaexample_app',
    'drf_spectacular',
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    #    'csp.middleware.CSPMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

SITE_ID = 1

MFA_FORMS = {
    'authenticate': 'allauth.mfa.forms.AuthenticateForm',
    'reauthenticate': 'allauth.mfa.forms.AuthenticateForm',
    'activate_totp': 'allauth.mfa.forms.ActivateTOTPForm',
    'deactivate_totp': 'allauth.mfa.forms.DeactivateTOTPForm',
}

GOOGLE_CALLBACK_URL = os.environ.get('GOOGLE_CALLBACK_URL', "")
CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_ID', "")
SECRET = os.environ.get('GOOGLE_OAUTH_SECRET', "")
KEY = os.environ.get('GOOGLE_OAUTH_KEY', "")

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 15,
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',

}

SPECTACULAR_SETTINGS = {
    'TITLE': 'oaexample',
    'DESCRIPTION': 'oaexample',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True
}

ROOT_URLCONF = 'oaexample_base.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            #            os.path.join(PROJECT_DIR, 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'oaexample_base.wsgi.application'

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("MYSQL_DATABASE"),
        "USER": os.getenv("MYSQL_USER"),
        "PASSWORD": os.getenv("MYSQL_PASSWORD"),
        "HOST": os.getenv("MYSQL_HOST"),
        "PORT": 3306,
    }
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators
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

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

GS_FILE_OVERWRITE = True  # WARN: change after initial launch!

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

STATICFILES_DIRS = [
    os.path.join(PROJECT_DIR, 'static'),
]

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

AUTH_USER_MODEL = "oaexample_app.Users"

ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_LOGOUT_ON_PASSWORD_CHANGE = False
ACCOUNT_LOGIN_BY_CODE_ENABLED = True
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_CONFIRM_EMAIL_ON_GET = True

HEADLESS_ONLY = True

DEFAULT_HTTP_PROTOCOL = 'https'
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://oaexample.com")
LOGIN_REDIRECT_URL = f"{FRONTEND_URL}/account/provider/callback"
SIGNUP_REDIRECT_URL = f"{FRONTEND_URL}/account/provider/callback"

# SOCIALACCOUNT_ADAPTER = 'oaexample_app.adapter.CustomHeadlessAdapter'
# HEADLESS_ADAPTER  = 'oaexample_app.adapter.CustomHeadlessAdapter'
# SOCIALACCOUNT_TOKEN_STRATEGY = 'oaexample_app.strategies.CustomTokenStrategy'

print(f"USING frontend {FRONTEND_URL}")
# ACCOUNT_ADAPTER = 'oaexample_app.adapter.UserAdapter'
# ACCOUNT_ADAPTER = 'allauth.account.adapter.DefaultAccountAdapter'

HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": f"{FRONTEND_URL}/account/verify-email/{{key}}",
    # Key placeholders are automatically populated. You are free to adjust this to your own needs, e.g.
    "account_reset_password": f"{FRONTEND_URL}/account/password/reset",
    "account_reset_password_from_key": f"{FRONTEND_URL}/account/password/reset/key/{{key}}",
    "account_signup": f"{FRONTEND_URL}/account/signup",
    # Fallback in case the state containing the `next` URL is lost and the handshake
    # with the third-party provider fails.
    "socialaccount_login_error": f"{FRONTEND_URL}/account/provider/callback",
    "socialaccount_login": f"{FRONTEND_URL}/account/provider/callback",
}

MFA_SUPPORTED_TYPES = ["totp", "recovery_codes", "webauthn"]
MFA_PASSKEY_LOGIN_ENABLED = True


SOCIALACCOUNT_EMAIL_AUTHENTICATION=True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT=True
SOCIALACCOUNT_EMAIL_REQUIRED=True
SOCIALACCOUNT_EMAIL_VERIFICATION=True
SOCIALACCOUNT_STORE_TOKENS=True
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            "name" : "google",
            "provider_id": "google",
            'client_id': os.environ.get('GOOGLE_OAUTH_CLIENT_ID', ""),
            'secret': os.environ.get('GOOGLE_OAUTH_SECRET', ""),
            'key': os.environ.get('GOOGLE_OAUTH_KEY', ""),
        },
        'FETCH_USERINFO': True,
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}

# EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# SMTP server configuration
SENDGRID_API_KEY = os.environ.get("SMTP_PASSWORD")
EMAIL_HOST = os.environ.get("SMTP_EMAIL_HOST", 'smtp.gmail.com')
EMAIL_PORT = os.environ.get("SMTP_EMAIL_PORT", 587)
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
# EMAIL_HOST_USER = os.environ.get("SMTP_EMAIL_ADDRESS", "")
EMAIL_HOST_PASSWORD = SENDGRID_API_KEY

# SendGrid
EMAIL_HOST_USER = 'apikey'  # This is the string 'apikey', not the actual API key
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "")
EMAIL_USE_LOCALTIME = True

# EMAIL_FILE_PATH = '/home/app-messages'  # change this to a proper location

"""
import logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
"""
