import logging
import os

from dotenv import dotenv_values

logger = logging.getLogger(__name__)

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
logger.debug(f"[OADJANGO] Using Root Dir {ROOT_DIR}")

# Only use this when you still want the private version in debug mode / locally like for social keys
# this is mostly just a hack for OA Contributors to develop without having to changing .env.public or .env
def myEnv(key, default=None):
    if os.path.exists(ROOT_DIR + '/.env.private'):
        config = dotenv_values(ROOT_DIR + '/.env.private')
        if key in config:
            return config[key]
    return os.getenv(key, default)

DJANGO_ENV = myEnv('DJANGO_ENV', 'production')
DEBUG = myEnv('DJANGO_DEBUG', 'True') == 'True'

logger.debug(f"[OADJANGO] DJANGO_ENV: {DJANGO_ENV} ")
logger.debug(f"[OADJANGO] DEBUG: {DEBUG} ")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    'django.contrib.sessions',
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'django.contrib.humanize',
    'storages',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',

    #    'address',
    #    'djmoney',

    "allauth",
    "allauth.account",

    "allauth.socialaccount",
    'allauth.socialaccount.providers.spotify',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.github',
    'allauth.socialaccount.providers.openid_connect',
    "allauth.mfa",
    "allauth.headless",
    "allauth.usersessions",

    'oaexample_app',
    'oasheets_app',
    'drf_spectacular',
]

if DEBUG == True or DJANGO_ENV != 'production':
    INSTALLED_APPS += ['django_extensions']
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'level': 'INFO',
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

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    #    'csp.middleware.CSPMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

SITE_ID = 1

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        #        'oaexample_app.authentication.AuthenticationByDeviceType',
        #        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication'
    ],
    'EXCEPTION_HANDLER': 'oaexample_app.exceptions.oa_exception_handler',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
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
    'COMPONENT_SPLIT_REQUEST': True,
    'EXTENSIONS_INFO': {
        'x-custom-serializers': True,
    }
}

if DEBUG:
    SPECTACULAR_SETTINGS = {
        "SERVE_PUBLIC": True,
        "SERVE_INCLUDE_SCHEMA": True
    }

ROOT_URLCONF = 'oaexample_base.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [f'{ROOT_DIR}/oaexample_base/templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request', # required by allauth
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'oaexample_base.wsgi.application'

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
