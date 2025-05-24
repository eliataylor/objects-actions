#!/bin/sh

# Ensure node_modules exist
if [ ! -d "/app/reactjs/node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Set environment variable to indicate Docker execution
export DOCKER_ENV=true

# Execute start.sh
exec bash /app/reactjs/start.sh
