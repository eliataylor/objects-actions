import os
from dotenv import load_dotenv

# Determine environment
DJANGO_ENV = os.getenv('DJANGO_ENV', 'production')
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))

# Load appropriate settings
if DJANGO_ENV == 'production':
    if os.path.exists(ROOT_DIR + '/.env.gcp'):
        load_dotenv(dotenv_path=ROOT_DIR + '/.env.gcp', override=True)
    from .production import *

elif DJANGO_ENV == 'testing':
    if os.path.exists(ROOT_DIR + '/.env.gcp'):
        load_dotenv(dotenv_path=ROOT_DIR + '/.env.gcp', override=True)
    if os.path.exists(ROOT_DIR + '/.env.testing'):
        load_dotenv(dotenv_path=ROOT_DIR + '/.env.testing', override=True)
    from .testing import *

elif DJANGO_ENV == 'docker':
    if os.path.exists(ROOT_DIR + '/.env.docker'):
        load_dotenv(dotenv_path=ROOT_DIR + '/.env.docker', override=True)
    from .development import * # notice reuse

else:
    if os.path.exists(ROOT_DIR + '/.env.development'):
        load_dotenv(dotenv_path=ROOT_DIR + '/.env.development', override=True)
    from .development import *


print(f"RUNNING ENV: {DJANGO_ENV} ")
print(f"RUNNING ENV: {DJANGO_ENV} ")
