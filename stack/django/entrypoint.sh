#!/bin/bash

ssl_cert_path="$HOME/.ssl/certificate.crt"
if [[ ! -f "$ssl_cert_path" ]]; then
  if [[ "$REACT_APP_APP_HOST" == https://* ]]; then
    echo "REACT_APP_APP_HOST uses HTTPS. Creating SSL certificate at: $ssl_cert_path"
    mkdir -p "$HOME/.ssl"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$HOME/.ssl/certificate.key" \
        -out "$ssl_cert_path" \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"
  else
    echo "REACT_APP_API_HOST does not use HTTPS. Skipping SSL certificate creation."
  fi
else
  echo "SSL certificate already exists at: $ssl_cert_path"
fi

exec "$@"

echo "[OADJANGO] Building oaexample migrations"
output=$(python manage.py makemigrations oaexample_app --noinput 2>&1) || {
    echo "[OADJANGO] Make migrations output: $output";
}

echo "[OADJANGO] Building all migrations"
output=$(python manage.py makemigrations --noinput 2>&1) || {
    echo "[OADJANGO] Make all migrations output: $output";
}

echo "[OADJANGO] Migrating"
output=$(python manage.py migrate --noinput 2>&1) || {
    echo "[OADJANGO] Migrate output: $output";
}

echo "[OADJANGO] Sync DB"
output=$(python manage.py migrate --run-syncdb --noinput 2>&1) || {
    echo "[OADJANGO] Migrate db sync output: $output";
}

echo "[OADJANGO] Creating superuser"
output=$(python manage.py createsuperuser --noinput 2>&1) || {
    echo "[OADJANGO] createsuperuser output: $output";
}

echo "[OADJANGO] Build static files"
output=$(python manage.py collectstatic --noinput 2>&1) || {
    echo "[OADJANGO] static files output: $output";
}

if [ "$DJANGO_ENV" = "testing" ] || [ "$DJANGO_ENV" = "development" ] || { [ "$DJANGO_ENV" = "docker" ] && [ "$DJANGO_DEBUG" = "True" ]; }; then
    echo "[OADJANGO] Running in development mode with runserver_plus..."
    python manage.py runserver_plus 0.0.0.0:8080 --cert-file "$ssl_cert_path"
else
    echo "[OADJANGO] Running in production mode with gunicorn"
    exec gunicorn oaexample_base.wsgi:application \
        --bind 0.0.0.0:8080 \
        --workers 3 \
        --capture-output \
        --log-level debug \
        --access-logfile '-' \
        --error-logfile '-'
fi
