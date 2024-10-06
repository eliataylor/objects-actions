import os
from dotenv import load_dotenv

# Determine environment
DJANGO_ENV = os.getenv('DJANGO_ENV', 'production')
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))

# Load appropriate settings
if DJANGO_ENV == 'production':
    if os.path.exists(ROOT_DIR + '/.env.prod'):
        load_dotenv(dotenv_path=ROOT_DIR + '/.env.prod', override=True)
    from .production import *

elif DJANGO_ENV == 'testing':
    if os.path.exists(ROOT_DIR + '/.env.testing'):
        load_dotenv(dotenv_path=ROOT_DIR + '/.env.gcp', override=True)
    from .testing import *

else:
    if os.path.exists(ROOT_DIR + '/.env.dev'):
        load_dotenv(dotenv_path=ROOT_DIR + '/.env.dev', override=True)
    from .development import *

print(f"RUNNING ENV: {DJANGO_ENV} ")
