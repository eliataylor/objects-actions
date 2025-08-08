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
DEFAULT_SSL_DIR="/app/ssl"
mkdir -p "$DEFAULT_SSL_DIR"
export SSL_CRT_FILE="${SSL_CRT_FILE:-$DEFAULT_SSL_DIR/certificate.crt}"
export SSL_KEY_FILE="${SSL_KEY_FILE:-$DEFAULT_SSL_DIR/certificate.key}"

# Ensure SSL certificate exists if HTTPS is enabled
if [[ "$HTTPS" == "true" ]]; then
    if [[ ! -f "$SSL_CRT_FILE" || ! -f "$SSL_KEY_FILE" ]]; then
        echo "No SSL certificate found. Creating a certificate with mkcert..."
        
        # Try to use mkcert if available
        if command -v mkcert &> /dev/null; then
            echo "Using mkcert to generate certificate..."
            mkcert -install 2>/dev/null || true
            
            # Extract base domain for wildcard certificate
            BASE_DOMAIN=$(echo "$HOST" | sed -E 's|^[^.]+\.(.+)$|\1|')
            if [[ "$BASE_DOMAIN" == "$HOST" ]]; then
                BASE_DOMAIN="$HOST"
            fi
            
            if [[ "$BASE_DOMAIN" != "$HOST" ]]; then
                # Create wildcard certificate for subdomains
                mkcert -key-file "$SSL_KEY_FILE" \
                       -cert-file "$SSL_CRT_FILE" \
                       "*.$BASE_DOMAIN" "$BASE_DOMAIN" "localhost" "127.0.0.1" "::1"
            else
                # Create certificate for specific domain
                mkcert -key-file "$SSL_KEY_FILE" \
                       -cert-file "$SSL_CRT_FILE" \
                       "$HOST" "localhost" "127.0.0.1" "::1"
            fi
        else
            echo "mkcert not available, using OpenSSL with SAN..."
            # Create OpenSSL config with proper SAN
            cat > /tmp/openssl.cnf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
OU = Unit
CN = $HOST

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $HOST
DNS.2 = localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout "$SSL_KEY_FILE" \
                -out "$SSL_CRT_FILE" \
                -config /tmp/openssl.cnf \
                -extensions v3_req
        fi
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
