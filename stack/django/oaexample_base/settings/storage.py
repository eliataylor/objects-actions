import os
from urllib.parse import urlparse

from .base import myEnv, logger

# Configure where to put uploaded and system files
# https://docs.djangoproject.com/en/5.0/howto/static-files/

APP_HOST = os.getenv('REACT_APP_APP_HOST', 'https://localhost.oaexample.com:3000')
APP_HOST_PARTS = urlparse(APP_HOST)
API_HOST = os.getenv('REACT_APP_API_HOST', 'https://localapi.oaexample.com:8080')
API_HOST_PARTS = urlparse(API_HOST)

OA_ENV_STORAGE = os.getenv("OA_ENV_STORAGE", "local")
logger.debug(f"[OADJANGO] STORAGE USING: {OA_ENV_STORAGE} ")

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if OA_ENV_STORAGE == 'gcp':
    import re

    # follows naming conventions found during deploy/create-bucket.sh
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

    # https://django-storages.readthedocs.io/en/1.12.2/backends/gcloud.html
    GS_CREDENTIALS_PATH = myEnv('GCP_SA_KEY_PATH', False)
    if os.path.isfile(GS_CREDENTIALS_PATH):
        GOOGLE_APPLICATION_CREDENTIALS = GS_CREDENTIALS_PATH
        logger.debug(f'loading Google Service credentials from {GS_CREDENTIALS_PATH}')
    else:
        import json
        from google.oauth2 import service_account
        credentials_info = json.loads(myEnv('GS_CREDENTIALS'))
        GS_CREDENTIALS = service_account.Credentials.from_service_account_info(credentials_info)
        logger.debug(f'Using Google Service credentials from secret manager')

    GS_FILE_OVERWRITE = False
    GS_BUCKET_NAME = sanitize_bucket_name(myEnv('GCP_BUCKET_API_NAME', 'oaexample-media'))

    # Ensure the correct file storage structure within the bucket
    STATICFILES_LOCATION = "static"
    MEDIAFILES_LOCATION = "media"

    # Static and Media Settings
    STORAGES = {
        "default": {  # Media files
            "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
            "OPTIONS": {
                "bucket_name": GS_BUCKET_NAME,
                "location": MEDIAFILES_LOCATION
            },
        },
        "staticfiles": {  # Static files
            "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
            "OPTIONS": {
                "bucket_name": GS_BUCKET_NAME,
                "location": STATICFILES_LOCATION
            },
        },
    }

    GS_DEFAULT_ACL = "publicRead"

    # URL paths for serving static and media files
    STATIC_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/{STATICFILES_LOCATION}/"
    MEDIA_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/{MEDIAFILES_LOCATION}/"

    # Additional Django settings for staticfiles
    STATICFILES_DIRS = []  # Include any additional static file directories
else:
    BASE_DIR = os.path.dirname(PROJECT_DIR)

    # Static files (CSS, JavaScript, Images)
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # Directory where static files are collected
    STATICFILES_DIRS = [os.path.join(PROJECT_DIR, 'static')]  # Additional static file directories

    # Media files (uploaded content)
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  # Directory to store uploaded media files

    # Staticfiles settings
    STATICFILES_FINDERS = [
        'django.contrib.staticfiles.finders.FileSystemFinder',
        'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    ]

    # Default storage settings
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
            "OPTIONS": {
                "location": MEDIA_ROOT,  # Media file storage location
            },
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
