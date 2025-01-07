#!/bin/bash

if [ ! -d "/app/reactjs/node_modules" ]; then
  echo "Falling back to npm installing dependencies from entrypoint.sh"
  npm install
fi

if [ ! -f /app/reactjs/.env ]; then
  echo "No .env file found. Using default .env.public."
  cp /app/reactjs/.env.public /app/reactjs/.env
else
  echo ".env file found. Using the provided version."
fi

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

echo "Starting ReactJS"
npm run start-ssl-in-docker
