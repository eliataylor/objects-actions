from .base import *

import certifi


DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")


# Set HSTS headers
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True  # Apply HSTS to all subdomains
SECURE_HSTS_PRELOAD = True  # Allow the site to be included in browsers' HSTS preload list
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# GS_CREDENTIALS = os.getenv('GCP_SA_KEY')

GS_PROJECT_ID = os.getenv('GCP_PROJECT_ID')
GS_BUCKET_NAME = os.getenv('GCP_BUCKET_API_NAME')
DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
STATICFILES_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
GS_DEFAULT_ACL = "publicRead"
# GS_CREDENTIALS = os.environ.get('GCP_SA_KEY')
STATIC_URL = f'https://storage.googleapis.com/{GS_BUCKET_NAME}/static/'
MEDIA_URL = f'https://storage.googleapis.com/{GS_BUCKET_NAME}/media/'

DATABASES['default']['HOST'] = os.getenv("GCP_MYSQL_HOST", "127.0.0.1")

SPECTACULAR_SETTINGS = {
    "SERVE_PUBLIC": False,
    "SERVE_INCLUDE_SCHEMA": False
}

CSRF_COOKIE_DOMAIN='.oaexample.com'
SESSION_COOKIE_DOMAIN='.oaexample.com'

SECURE_SSL_REDIRECT = True

SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = False  # Allow JavaScript to read the CSRF cookie

CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read the CSRF cookie

# Explicitly set the certificate bundle
EMAIL_SSL_CERTFILE = certifi.where()