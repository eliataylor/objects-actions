import os
DJANGO_ENV = os.getenv('DJANGO_ENV', 'production')
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

print(f"DJANGO_ENV: {DJANGO_ENV} ")
print(f"DEBUG: {DEBUG} ")

from .database import *
from .storage import *
from .email import *
from .security import *
from .allauth import *
