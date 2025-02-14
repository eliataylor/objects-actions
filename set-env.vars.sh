#!/bin/bash

set -e

# Root .env setup
if [ ! -f ".env" ]; then
  cp .env.public .env
  echo "Created .env from .env.public"
fi

# Load root .env variables
declare -A ROOT_ENV
while IFS='=' read -r KEY VALUE || [ -n "$KEY" ]; do
  # Ignore empty lines and comments
  [[ -z "$KEY" || "$KEY" =~ ^#.* ]] && continue
  ROOT_ENV["$KEY"]="$VALUE"
done < .env

# List of container contexts
CONTAINERS=(
  "stack/django"
  "stack/reactjs"
  "stack/databuilder"
  "stack/cypress"
)

# Ensure each container has a .env file and contains root variables (overwriting existing values)
for CONTEXT in "${CONTAINERS[@]}"; do
  ENV_FILE="$CONTEXT/.env"

  if [ ! -f "$ENV_FILE" ]; then
    cp .env.public "$ENV_FILE"
    echo "Created $ENV_FILE from .env.public"
  fi

  # Read existing .env file, preserving comments and structure
  TEMP_FILE=$(mktemp)
  while IFS= read -r LINE || [[ -n "$LINE" ]]; do
    if [[ "$LINE" =~ ^#.* || -z "$LINE" ]]; then
      # Preserve comments and empty lines
      echo "$LINE" >> "$TEMP_FILE"
    else
      VAR_NAME=$(echo "$LINE" | cut -d= -f1)
      if [[ -n "${ROOT_ENV[$VAR_NAME]}" ]]; then
        # Overwrite with root .env value
        echo "$VAR_NAME=${ROOT_ENV[$VAR_NAME]}" >> "$TEMP_FILE"
        echo "Updated $VAR_NAME in $ENV_FILE"
      else
        # Keep the existing variable if not in root .env
        echo "$LINE" >> "$TEMP_FILE"
      fi
    fi
  done < "$ENV_FILE"

  # Add any missing variables from root .env
  for KEY in "${!ROOT_ENV[@]}"; do
    if ! grep -q "^$KEY=" "$TEMP_FILE"; then
      echo "$KEY=${ROOT_ENV[$KEY]}" >> "$TEMP_FILE"
      echo "Added missing variable $KEY to $ENV_FILE"
    fi
  done

  mv "$TEMP_FILE" "$ENV_FILE"
done

echo "Environment variable setup complete."
