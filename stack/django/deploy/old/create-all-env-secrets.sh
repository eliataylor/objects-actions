#!/bin/bash

# Check if the .env file path is provided
if [ -z "$1" ]; then
  echo "Usage: $0 /path/to/.env"
  exit 1
fi

ENV_FILE=$1

# Check if the .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo ".env file not found at $ENV_FILE"
  exit 1
fi

# Read each line from the .env file
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip empty lines and lines starting with a comment
  if [[ -z "$line" || "$line" =~ ^\s*# ]]; then
    continue
  fi

  # Extract the key and value, stripping comments
  key=$(echo "$line" | cut -d '=' -f 1)
  value=$(echo "$line" | cut -d '=' -f 2- | cut -d '#' -f 1 | sed 's/[[:space:]]*$//')

    # Remove = followed by a space and a double quote
  value=$(echo "$value" | sed 's/=\s*"//g')

  # Remove = followed by a space and a single quote
  value=$(echo "$value" | sed "s/=\s*'//g")

  # Remove a double quote at the end
  value=$(echo "$value" | sed 's/"$//')

  # Remove a single quote at the end
  value=$(echo "$value" | sed "s/'$//")



  # Create or update the secret in GCP Secret Manager
  echo "Processing secret for $key..."

  # Check if the secret exists
  secret_exists=$(gcloud secrets list --filter="name:$key" --format="value(name)")

  if [ -z "$secret_exists" ]; then
    # Create the secret if it does not exist
    echo "Creating secret for $key..."
    echo "$value" | gcloud secrets create "$key" --data-file=-
  else
    # Overwrite the secret if it already exists
    echo "Updating secret for $key with $value"
    echo "$value" | gcloud secrets versions add "$key" --data-file=-
  fi

done < "$ENV_FILE"

echo "All secrets imported."
