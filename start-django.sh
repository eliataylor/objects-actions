#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting Django in $stackpath/django"
cd "$stackpath/django"

if [ ! -d .venv ]; then
    python -m venv .venv
    echo "Created new virtual environment"
else
    echo "Virtual environment already exists."
fi
source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations "$machinename_app" --noinput
python manage.py migrate --noinput
python manage.py migrate --run-syncdb
python manage.py makemigrations

if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ] && [ "$DJANGO_SUPERUSER_EMAIL" ]; then
    echo "Running createsuperuser in Django"
    python manage.py createsuperuser --noinput || true
    echo "Superuser created."
else
    echo "ENV for Django Username, Password and Email is not SET"
fi

# Run the gunicorn server
exec gunicorn oaexample_base.wsgi:application --bind 0.0.0.0:8080 --workers 4 --threads 8 --timeout 0
