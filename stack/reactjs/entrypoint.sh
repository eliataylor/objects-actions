#!/bin/bash

if [ ! -d "/app/reactjs/node_modules" ]; then
  echo "Falling back to npm installing dependencies from entrypoint.sh"
  npm install
fi

# Ensure the SSL certificate exists or create one
ssl_cert_path="$HOME/.ssl/certificate.crt"
if [ ! -f "$ssl_cert_path" ]; then
    echo "SSL certificate not found. Creating one at: $ssl_cert_path"
    mkdir -p "$HOME/.ssl"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$HOME/.ssl/certificate.key" \
        -out "$ssl_cert_path" \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"
fi

if [ ! -f /app/reactjs/.env ]; then
  echo "No .env file found. Using default .env.public."
  cp /app/reactjs/.env.public /app/reactjs/.env
else
  echo ".env file found. Using the provided version."
fi

exec "$@"

echo "Starting ReactJS"
npm run start-ssl-in-docker
