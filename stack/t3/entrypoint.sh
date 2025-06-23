#!/bin/sh

# Ensure node_modules exist
if [ ! -d "/app/nextjs/node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Set environment variable to indicate Docker execution
export DOCKER_ENV=true

npm run dev
