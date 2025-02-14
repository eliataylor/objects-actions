#!/bin/bash

# Ensure node_modules exist
if [ ! -d "/app/reactjs/node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Ensure .env exists, fallback to .env.public
if [ ! -f /app/reactjs/.env ]; then
  echo "No .env file found. Using default .env.public."
  cp /app/reactjs/.env.public /app/reactjs/.env
else
  echo ".env file found. Using the provided version."
fi

# Set environment variable to indicate Docker execution
export DOCKER_ENV=true

# Execute start.sh
exec bash /app/reactjs/start.sh
