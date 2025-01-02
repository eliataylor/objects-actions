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
output=$(python manage.py makemigrations oaexample_app --noinput 2>&1) || {
    echo "[DJANGO] Make migrations failed: $output";
}

echo "[DJANGO] Building all migrations"
output=$(python manage.py makemigrations --noinput 2>&1) || {
    echo "[DJANGO] Make all migrations failed: $output";
}

echo "[DJANGO] Migrating"
output=$(python manage.py migrate --noinput 2>&1) || {
    echo "[DJANGO] Migrate failed: $output";
}

echo "[DJANGO] Sync DB"
output=$(python manage.py migrate --run-syncdb --noinput 2>&1) || {
    echo "[DJANGO] Migrate db sync failed: $output";
}

echo "[DJANGO] Creating superuser"
output=$(python manage.py createsuperuser --noinput 2>&1) || {
    echo "[DJANGO] createsuperuser failed: $output";
}

echo "[DJANGO] Build static files"
output=$(python manage.py collectstatic --noinput 2>&1) || {
    echo "[DJANGO] static files failed: $output";
}

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
