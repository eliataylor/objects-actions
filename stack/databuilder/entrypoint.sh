#!/bin/bash

if [ ! -d "/app/databuilder/node_modules" ]; then
  echo "Falling back to npm installing dependencies from entrypoint.sh"
  npm install
fi

# Check if .env exists; if not, copy from .env.public
if [ ! -f /app/databuilder/.env ]; then
  echo "No .env file found. Using default .env.public."
  cp /app/databuilder/.env.public /app/databuilder/.env
else
  echo ".env file found. Using the provided version."
fi

if [ "$#" -eq 0 ]; then
  echo "Awaiting command (container will stay alive)..."
  # Keep the container alive
  tail -f /dev/null
else
  echo "Executing main script with arguments: $@"
  npx tsx src/main.ts "$@"
fi
