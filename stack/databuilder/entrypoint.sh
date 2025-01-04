#!/bin/bash

# Check if .env exists; if not, copy from .env.public
if [ ! -f /app/databuilder/.env ]; then
  echo "No .env file found. Using default .env.public."
  cp /app/databuilder/.env.public /app/databuilder/.env
else
  echo ".env file found. Using the provided version."
fi


if [ "$#" -gt 0 ]; then
  echo 'awaiting command'
else
  echo "Executing main script with arguments: $@"
  npx tsx src/main.ts "$@"
fi

