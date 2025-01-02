#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR=$(realpath ".")

source "$SCRIPT_DIR/functions.sh"

# Primary .env file
ENV_FILE="$1"

# Optional .env.private file
PRIVATE_ENV_FILE="$2"

# Parse and export variables from the primary .env file
parse_and_export_env "$ENV_FILE"

# Parse and export variables from the optional .env.private file, if provided
if [ -n "$PRIVATE_ENV_FILE" ]; then
  parse_and_export_env "$PRIVATE_ENV_FILE"
fi


# Sanitize and export GCP_BUCKET_APP_NAME and GCP_BUCKET_API_NAME if they exist
if [ -n "$GCP_BUCKET_APP_NAME" ]; then
  SANITIZED_GCP_BUCKET_APP_NAME=$(sanitize_bucket_name "$GCP_BUCKET_APP_NAME")
  export GCP_BUCKET_APP_NAME="$SANITIZED_GCP_BUCKET_APP_NAME"
fi

if [ -n "$GCP_BUCKET_API_NAME" ]; then
  SANITIZED_GCP_BUCKET_API_NAME=$(sanitize_bucket_name "$GCP_BUCKET_API_NAME")
  export GCP_BUCKET_API_NAME="$SANITIZED_GCP_BUCKET_API_NAME"
fi

# Check if necessary variables are set
missing_vars=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "The following required environment variables are missing:"
  for var in "${missing_vars[@]}"; do
    echo " $var"
  done
  exit 1
fi
