from .base import *
from google.oauth2 import service_account

DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

INSTALLED_APPS += [
    'django_extensions',
]

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = False  # Apply HSTS to all subdomains
SECURE_HSTS_PRELOAD = False  # Allow the site to be included in browsers HSTS preload list
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

GS_PROJECT_ID = os.getenv('GCP_PROJECT_ID')
GS_BUCKET_NAME = os.getenv('GCP_BUCKET_API_NAME')
DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
STATICFILES_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
GS_DEFAULT_ACL = "publicRead"

GS_CREDENTIALS_PATH = os.getenv('GCP_SA_KEY_PATH')
GS_CREDENTIALS = service_account.Credentials.from_service_account_file(GS_CREDENTIALS_PATH)

STATIC_URL = f'https://storage.googleapis.com/{GS_BUCKET_NAME}/static/'
MEDIA_URL = f'https://storage.googleapis.com/{GS_BUCKET_NAME}/media/'

DATABASES['default']['HOST'] = os.getenv("MYSQL_HOST", "127.0.0.1")

SPECTACULAR_SETTINGS = {
    "SERVE_PUBLIC": True,
    "SERVE_INCLUDE_SCHEMA": True
}

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

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True
ALLOWED_HOSTS = ['*']
