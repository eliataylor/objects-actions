#!/bin/bash

# Ensure .env exists, fallback to .env.public if missing
[ -f .env ] || cp .env.public .env

# Load environment variables from .env
while IFS='=' read -r key value; do
    [[ $key =~ ^[[:space:]]*# ]] && continue  # skip comments
    [[ -z $key ]] && continue                 # skip empty lines
    key=$(echo "$key" | xargs)               # trim whitespace
    value=$(echo "$value" | xargs)           # trim whitespace
    export "$key"="$value"
done < .env

# Extract protocol, host, and port from REACT_APP_APP_HOST
if [[ -n "$REACT_APP_APP_HOST" ]]; then
    PROTOCOL=$(echo "$REACT_APP_APP_HOST" | sed -E 's|^(https?)://.*|\1|')
    HOST=$(echo "$REACT_APP_APP_HOST" | sed -E 's|^https?://([^:/]+).*|\1|')
    PORT=$(echo "$REACT_APP_APP_HOST" | sed -E 's|^https?://[^:/]+:?([0-9]*)/?|\1|')

    # Default to HTTPS if protocol is "https"
    if [[ "$PROTOCOL" == "https" ]]; then
        export HTTPS=true
    fi

    # Set HOST and PORT if extracted values exist
    export HOST="${HOST:-0.0.0.0}"
    export PORT="${PORT:-3000}"
fi

# populates EnvProvider.tsx with necessary prefixes for react-scripts
export REACT_APP_DEFAULT_PERMS=$DEFAULT_PERMS

echo "DEFAULT_PERMS: $DEFAULT_PERMS vs $REACT_APP_DEFAULT_PERMS"

# Set SSL certificate paths
DEFAULT_SSL_DIR="$HOME/.ssl"
mkdir -p "$DEFAULT_SSL_DIR"
export SSL_CRT_FILE="${SSL_CRT_FILE:-$DEFAULT_SSL_DIR/certificate.crt}"
export SSL_KEY_FILE="${SSL_KEY_FILE:-$DEFAULT_SSL_DIR/certificate.key}"

# Ensure SSL certificate exists if HTTPS is enabled
if [[ "$HTTPS" == "true" ]]; then
    if [[ ! -f "$SSL_CRT_FILE" || ! -f "$SSL_KEY_FILE" ]]; then
        echo "No SSL certificate found. Creating a self-signed certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$SSL_KEY_FILE" \
            -out "$SSL_CRT_FILE" \
            -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=$HOST"
    else
        echo "Using existing SSL certificate at: $SSL_CRT_FILE"
    fi
fi

# Ensure the app is accessible from Docker
if [[ -n "$DOCKER_ENV" ]]; then
    export HOST="0.0.0.0"
fi

# Start React app
if [[ "$HTTPS" == "true" ]]; then
  npm run start-ssl-in-docker
else
  npm run react-start
fi
