#!/bin/bash

# Exit on any error
set -e

echo "[OADJANGO] Starting Django setup for new project..."

# SSL Certificate Setup
API_HOST_DOMAIN=$(echo "$REACT_APP_API_HOST" | sed -E 's|^[^/]*//([^:/]*).*|\1|')
ssl_cert_path="/app/ssl/certificate-$API_HOST_DOMAIN.crt"
if [[ ! -f "$ssl_cert_path" ]]; then
  if [[ "$REACT_APP_APP_HOST" == https://* ]]; then
    echo "[OADJANGO] Creating SSL certificate at: $ssl_cert_path"
    mkdir -p "/app/ssl"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "/app/ssl/certificate-$API_HOST_DOMAIN.key" \
        -out "$ssl_cert_path" \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost/SN=$API_HOST_DOMAIN"
  else
    echo "[OADJANGO] REACT_APP_API_HOST does not use HTTPS. Skipping SSL certificate creation."
  fi
else
  echo "[OADJANGO] SSL certificate already exists at: $ssl_cert_path"
fi

# Wait for database to be ready (for Docker environments)
echo "[OADJANGO] Waiting for database to be ready..."
python manage.py check --database default || {
    echo "[OADJANGO] Database not ready, waiting..."
    sleep 5
    python manage.py check --database default
}

# Step 1: Create migrations for all apps
echo "[OADJANGO] Creating migrations for all apps..."
output=$(python manage.py makemigrations --noinput 2>&1) || {
    echo "[OADJANGO] Make migrations output: $output";
    # Continue even if no migrations needed
}

# Step 2: Apply all migrations
echo "[OADJANGO] Applying migrations..."
output=$(python manage.py migrate --noinput 2>&1) || {
    echo "[OADJANGO] Migrate output: $output";
    exit 1
}

# Step 3: Run syncdb for any remaining tables
echo "[OADJANGO] Running syncdb..."
output=$(python manage.py migrate --run-syncdb --noinput 2>&1) || {
    echo "[OADJANGO] Syncdb output: $output";
    # Continue even if syncdb fails
}

# Step 4: Create superuser if it doesn't exist
echo "[OADJANGO] Creating superuser..."
output=$(python manage.py createsuperuser --noinput 2>&1) || {
    echo "[OADJANGO] Superuser creation output: $output";
    # Continue even if superuser already exists
}


# Step 7: Collect static files
echo "[OADJANGO] Collecting static files..."
output=$(python manage.py collectstatic --noinput 2>&1) || {
    echo "[OADJANGO] Collectstatic output: $output";
    exit 1
}

# Step 8: Validate setup
echo "[OADJANGO] Validating Django setup..."
python manage.py check --deploy || {
    echo "[OADJANGO] Django check failed, but continuing..."
}

# Determine port
PORT=$(echo "$REACT_APP_API_HOST" | sed -E 's|^https?://[^:/]+:?([0-9]*)/?|\1|')

# Default to 8088 if no port is extracted
if [[ -z "$PORT" || ! "$PORT" =~ ^[0-9]+$ ]]; then
    PORT=8088
fi

echo "[OADJANGO] Using PORT: $PORT"

# Start the server
if [ "$DJANGO_ENV" = "testing" ] || [ "$DJANGO_ENV" = "development" ] || { [ "$DJANGO_ENV" = "docker" ] && [ "$DJANGO_DEBUG" = "True" ]; }; then
    echo "[OADJANGO] Running in development mode with runserver_plus..."
    exec python manage.py runserver_plus 0.0.0.0:$PORT --cert-file "$ssl_cert_path"
else
    echo "[OADJANGO] Running in production mode with gunicorn"
    exec gunicorn strongmsp_base.wsgi:application \
        --bind 0.0.0.0:$PORT \
        --workers 3 \
        --timeout 300 \
        --capture-output \
        --log-level debug \
        --access-logfile '-' \
        --error-logfile '-'
fi
