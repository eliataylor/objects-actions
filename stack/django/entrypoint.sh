#!/bin/bash

# exit immediately if a command exits with a non-zero status
set -e

ssl_cert_path="$HOME/.ssl/certificate.crt"
if [ ! -f "$ssl_cert_path" ]; then
    echo "SSL certificate not found. Creating one at: $ssl_cert_path"
    mkdir -p "$HOME/.ssl"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$HOME/.ssl/certificate.key" \
        -out "$ssl_cert_path" \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"
fi

exec "$@"

# Create a superuser if it does not exist
if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ] && [ "$DJANGO_SUPERUSER_EMAIL" ]; then
    echo "Running createsuperuser in Django"
    python manage.py makemigrations oaexample_app
    python manage.py migrate
    python manage.py migrate --run-syncdb
    python manage.py makemigrations
    python manage.py createsuperuser --noinput || true
    python manage.py collectstatic --noinput || true
    echo "Superuser created."
else
    echo "ENV for Django Username, Password and Email is not SET"
fi


if [ "$DJANGO_ENV" = "development" ] || { [ "$DJANGO_ENV" = "docker" ] && [ "$DJANGO_DEBUG" = "True" ]; }; then
    echo "Running in development mode with runserver_plus..."
    python manage.py runserver_plus 0.0.0.0:8080 --cert-file "$ssl_cert_path"
else
    echo "Running in production mode with gunicorn..."
    exec gunicorn oaexample_base.wsgi:application \
        --bind 0.0.0.0:8080 \
        --workers 3 \
        --access-logfile '-' \
        --error-logfile '-'
fi
