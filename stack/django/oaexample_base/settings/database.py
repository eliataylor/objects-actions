import os
from .base import *

# the location of mysql server. options are: docker | local | gcp
OA_ENV_DB = os.getenv("OA_ENV_DB", "docker")
print(f"DATABSE USING: {OA_ENV_DB} ")

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

AUTH_USER_MODEL = "oaexample_app.Users"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("MYSQL_DATABASE", "localdb"),
        "USER": os.getenv("MYSQL_USER", "localuser"),
        "PASSWORD": os.getenv("MYSQL_PASSWORD", "localpassword"),
        "HOST": os.getenv("MYSQL_HOST", "127.0.0.1"),
        "PORT": 3306,
        'OPTIONS': {
            'charset': 'utf8mb4',
            'use_unicode': True,
        }
    }
}

if OA_ENV_DB == 'docker':
    DATABASES["default"]["HOST"] = "mysql8_container"
elif OA_ENV_DB == 'gcp':
    DATABASES["default"]["NAME"] = myEnv("MYSQL_DATABASE", "localdb")
    DATABASES["default"]["USER"] = myEnv("MYSQL_USER", "localuser")
    DATABASES["default"]["PASSWORD"] = myEnv("MYSQL_PASSWORD", "localpassword")
    DATABASES["default"]["HOST"] = myEnv("GCP_MYSQL_HOST")


