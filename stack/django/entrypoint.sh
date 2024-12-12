#!/bin/bash

# exit immediately if a command exits with a non-zero status
set -e

# Run database migrations
#echo "Eli Tests - Running migrate run-syncb"
#python manage.py migrate --run-syncdb --noinput
# echo "Eli Tests - Running makemigrations"
# python manage.py makemigrations --noinput
# echo "Eli Tests - Running migrate"
# python manage.py migrate --noinput
# echo "Eli Tests - Running collectstatic"
# python manage.py collectstatic --noinput

# Create a superuser if it does not exist
if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ] && [ "$DJANGO_SUPERUSER_EMAIL" ]; then
    echo "Running createsuperuser in Django"
    python manage.py createsuperuser --noinput || true
    echo "Superuser created."
else
    echo "ENV for Django Username, Password and Email is not SET"
fi

# Run the gunicorn server
exec gunicorn oaexample_base.wsgi:application --bind 0.0.0.0:8080 --workers 4 --threads 8 --timeout 0