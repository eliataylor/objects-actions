#!/bin/bash

ssl_cert_path="$HOME/.ssl/certificate.crt"
if [ ! -f "$ssl_cert_path" ]; then
    echo "[DJANGO] SSL certificate not found. Creating one at: $ssl_cert_path"
    mkdir -p "$HOME/.ssl"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$HOME/.ssl/certificate.key" \
        -out "$ssl_cert_path" \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"
fi

exec "$@"

echo "[DJANGO] Building oaexample migrations"
python manage.py makemigrations oaexample_app --noinput || { echo "Make migrations failed"; }
echo "[DJANGO] Building all migrations"
python manage.py makemigrations --noinput || { echo "Make all migrations failed"; }
echo "[DJANGO] Migrating"
python manage.py migrate --noinput || { echo "Migrate failed"; }
echo "[DJANGO] Sync DB"
python manage.py migrate --run-syncdb --noinput || { echo "Migrate db sync failed"; }
echo "[DJANGO] Creating superuser"
python manage.py createsuperuser --noinput || true
echo "[DJANGO] Build static files"
python manage.py collectstatic --noinput || true
echo "[DJANGO] Superuser created."

if [ "$DJANGO_ENV" = "testing" ] || [ "$DJANGO_ENV" = "development" ] || { [ "$DJANGO_ENV" = "docker" ] && [ "$DJANGO_DEBUG" = "True" ]; }; then
    echo "[DJANGO] Running in development mode with runserver_plus..."
    python manage.py runserver_plus 0.0.0.0:8080 --cert-file "$ssl_cert_path"
else
    echo "[DJANGO] Running in production mode with gunicorn with extra timeout..."
    exec gunicorn oaexample_base.wsgi:application \
        --bind 0.0.0.0:8080 \
        --workers 3 \
        --threads 2 \
        --timeout 200 \
        --worker-class gthread \
        --capture-output \
        --log-level debug \
        --access-logfile '-' \
        --error-logfile '-'
fi
