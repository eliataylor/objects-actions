import os
import re

from corsheaders.defaults import default_headers


def sanitize_bucket_name(name: str) -> str:
    # Convert to lowercase
    name = name.lower()
    # Replace underscores with dashes
    name = name.replace('_', '-')
    # Remove characters not allowed
    name = re.sub(r'[^a-z0-9-]', '', name)
    # Trim to 63 characters max (to comply with bucket name length limit)
    name = name[:63]
    return name


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(PROJECT_DIR)

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'm(##s4x5rs))6f09xu_xq@1a3-*5sm@n8bh^9dm(p46-%t@et%')

# APPEND_SLASH = False
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

SUPERUSER_USERNAME = os.getenv('DJANGO_SUPERUSER_USERNAME', 'superadmin')
SUPERUSER_PASSWORD = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin')
SUPERUSER_EMAIL = os.getenv('DJANGO_SUPERUSER_EMAIL', 'info@oaexample.com')

ALLOWED_HOSTS = [
    "oaexample.com",
    ".oaexample.com"
]

CSRF_TRUSTED_ORIGINS = [
    "https://oaexample.com",
    "https://*.oaexample.com",
    "http://localhost:3000",
    "https://localhost:3000",
    'http://localhost.oaexample.com:3000',
    'https://localhost.oaexample.com:3000',
    'http://localapi.oaexample.com:8080',
    'https://localapi.oaexample.com:8080'
]

CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-email-verification-key',  # used by allauth
    'X-App-Client',  # used by mobile to toggle to Token auth
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://\w+\.oaexample\.com$",
    r"^http://\w+\.oaexample\.com$",
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost:8080',
    'https://localhost:8080',
    'http://localhost.oaexample.com:3000',
    'https://localhost.oaexample.com:3000',
    'http://localapi.oaexample.com:8080',
    'https://localapi.oaexample.com:8080',
    'https://oaexample.com',
    'https://www.oaexample.com',
    'https://dev.oaexample.com'
]

# CSRF_COOKIE_DOMAIN = '.oaexample.com'
# SESSION_COOKIE_DOMAIN = '.oaexample.com'

CSRF_COOKIE_DOMAIN = None
SESSION_COOKIE_DOMAIN = None

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
    'allauth.socialaccount.providers.spotify',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.github',
    'allauth.socialaccount.providers.openid_connect',
#    'allauth.socialaccount.providers.linkedin_oauth2',
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

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        #        'oaexample_app.authentication.AuthenticationByDeviceType',
        #        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication'
    ],
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
        'OPTIONS': {
            'charset': 'utf8mb4',
            'use_unicode': True,
        }
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

ACCOUNT_EMAIL_VERIFICATION = "optional"  # since SMS only is allowed
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_LOGOUT_ON_PASSWORD_CHANGE = False
ACCOUNT_LOGIN_BY_CODE_ENABLED = True
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_SESSION_REMEMBER = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_DISPLAY = lambda user: user.get_full_name()

HEADLESS_ONLY = True

DEFAULT_HTTP_PROTOCOL = 'https'
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://oaexample.com")
print(f"USING frontend {FRONTEND_URL}")

LOGIN_REDIRECT_URL = f"{FRONTEND_URL}/account/provider/callback"
SIGNUP_REDIRECT_URL = f"{FRONTEND_URL}/account/provider/callback"

HEADLESS_ADAPTER = 'oaexample_app.adapter.CustomHeadlessAdapter'
SOCIALACCOUNT_ADAPTER = 'oaexample_app.adapter.MySocialAccountAdapter'
# SOCIALACCOUNT_TOKEN_STRATEGY = 'oaexample_app.strategies.CustomTokenStrategy'
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

SOCIALACCOUNT_EMAIL_AUTHENTICATION = False
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True
SOCIALACCOUNT_EMAIL_REQUIRED = False
SOCIALACCOUNT_EMAIL_VERIFICATION = False
SOCIALACCOUNT_STORE_TOKENS = True
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            "name": "google",
            "provider_id": "google",
            'client_id': os.environ.get('GOOGLE_OAUTH_CLIENT_ID', ""),
            'secret': os.environ.get('GOOGLE_OAUTH_SECRET', ""),
            'key': os.environ.get('GOOGLE_OAUTH_KEY', ""),
        },
        'EMAIL_AUTHENTICATION': True,
        'FETCH_USERINFO': True,
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    },
    'github': {
        'SCOPE': [
            'user',
            'repo',
            'read:org',
        ],
        'APP': {
            "name": "github",
            "provider_id": "github",
            "callback_url": "https://oaexample.com/account/provider/callback",
            'client_id': os.environ.get('GITHUB_CLIENT_ID', ""),
            'secret': os.environ.get('GITHUB_SECRET', "")
        },
    },
    "openid_connect": {
        "APPS": [
            {
                "provider_id": "linkedin",
                "name": "LinkedIn",
                "client_id": os.environ.get('LINKEDIN_CLIENT_ID', ""),
                "secret": os.environ.get('LINKEDIN_SECRET', ""),
                "settings": {
                    "server_url": "https://www.linkedin.com/oauth",
                },
            }
        ]
    },
    "spotify": {
        'SCOPE': ['user-read-email', 'user-top-read', 'user-read-recently-played', 'playlist-read-collaborative'],
        'AUTH_PARAMS': {'access_type': 'offline'},
        'METHOD': 'oauth2',
        'FETCH_USERINFO': True,
        'VERIFIED_EMAIL': False,
        'VERSION': 'v1',
        "APP": {

            "name": "spotify",
            "provider_id": "spotify",

            "client_id": os.environ.get("SPOTIFY_CLIENT_ID"),
            "secret": os.environ.get("SPOTIFY_SECRET"),
            "callback_url": "https://oaexample.com/account/provider/callback",
        }
    },

}

# SMTP server configuration
EMAIL_PASSWORD = os.environ.get("SMTP_PASSWORD")
EMAIL_HOST = os.environ.get("SMTP_EMAIL_HOST", 'smtp.gmail.com')
EMAIL_PORT = os.environ.get("SMTP_EMAIL_PORT", 587)
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
# EMAIL_HOST_USER = os.environ.get("SMTP_EMAIL_ADDRESS", "")
EMAIL_HOST_PASSWORD = EMAIL_PASSWORD

if EMAIL_PASSWORD is None:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# SendGrid
EMAIL_HOST_USER = 'apikey'  # This is the string 'apikey', not the actual API key
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "")
EMAIL_USE_LOCALTIME = True

# EMAIL_FILE_PATH = '/home/app-messages'  # change this to a proper location

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_VERIFY_SERVICE_SID = os.environ.get("TWILIO_VERIFY_SERVICE_SID", "")
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER", "")

APPLE_DEVELOPER_TOKEN = os.environ.get("APPLE_DEVELOPER_TOKEN", "")

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
