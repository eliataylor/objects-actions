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

echo "Building Django migrations"
python manage.py makemigrations oaexample_app || { echo "Makemigrations failed"; }
echo "Migrating"
python manage.py migrate --noinput || { echo "Migrate failed"; }
echo "Migrating Sync DB"
python manage.py migrate --run-syncdb --noinput || { echo "Migrate db sync failed"; }
echo "Creating superuser"
python manage.py createsuperuser --noinput || true
echo "Build static files"
python manage.py collectstatic --noinput || true
echo "Superuser created."

if [ "$DJANGO_ENV" = "testing" ] || [ "$DJANGO_ENV" = "development" ] || { [ "$DJANGO_ENV" = "docker" ] && [ "$DJANGO_DEBUG" = "True" ]; }; then
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
