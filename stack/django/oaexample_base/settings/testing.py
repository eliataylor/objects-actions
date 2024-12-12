from .base import *

DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

INSTALLED_APPS += [
    'django_extensions',
]

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = False  # Apply HSTS to all subdomains
SECURE_HSTS_PRELOAD = False  # Allow the site to be included in browsers' HSTS preload list
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

GS_PROJECT_ID = os.getenv('GCP_PROJECT_ID')
GS_BUCKET_NAME = os.getenv('GCP_BUCKET_API_NAME')
DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
STATICFILES_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
GS_DEFAULT_ACL = "publicRead"
STATIC_URL = f'https://storage.googleapis.com/{GS_BUCKET_NAME}/static/'
MEDIA_URL = f'https://storage.googleapis.com/{GS_BUCKET_NAME}/media/'

DATABASES['default']['HOST'] = os.getenv("MYSQL_HOST", "127.0.0.1")

SPECTACULAR_SETTINGS = {
    "SERVE_PUBLIC": True,
    "SERVE_INCLUDE_SCHEMA": True
}

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True
CSRF_TRUSTED_ORIGINS = ["http://*", "https://*"]
ALLOWED_HOSTS = ['*']