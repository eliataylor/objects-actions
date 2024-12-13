#!/bin/bash

# Usage: ./generate_env.sh <PROJECT_ID> <SERVICE_NAME> <OUTPUT_ENV_FILE>
# Example: ./generate_env.sh instant-jetty-426808-u5 oaexample-django-app .env

# Check for required arguments
if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <PROJECT_ID> <SERVICE_NAME> <OUTPUT_ENV_FILE>"
  exit 1
fi

PROJECT_ID=$1
GCP_SERVICE_NAME=$2
OUTPUT_ENV_FILE=$3
GCP_REGION=us-west1

# Clear or create the output file
> $OUTPUT_ENV_FILE

# Fetch Cloud Run environment variables
echo "Fetching environment variables from Cloud Run..."
ENV_VARS=$(gcloud run services describe "$GCP_SERVICE_NAME-cloudrun" \
  --platform managed \
  --region $GCP_REGION \
  --format "json" \
  --project "$PROJECT_ID" | jq -r '.spec.template.spec.containers[0].env[] | "\(.name)=\(.value)"')

if [ -n "$ENV_VARS" ]; then
  echo "# Cloud Run Environment Variables" >> "$OUTPUT_ENV_FILE"
  echo "$ENV_VARS" >> "$OUTPUT_ENV_FILE"
  echo "" >> "$OUTPUT_ENV_FILE"
fi

# Fetch Secrets from Secret Manager
echo "Fetching secrets from Secret Manager..."
SECRETS=$(gcloud secrets list --project "$PROJECT_ID" --format="value(name)")

if [ -n "$SECRETS" ]; then
  echo "# Secrets from Secret Manager" >> "$OUTPUT_ENV_FILE"
  while IFS= read -r SECRET_NAME; do
    SECRET_VALUE=$(gcloud secrets versions access latest \
      --secret "$SECRET_NAME" \
      --project "$PROJECT_ID" 2>/dev/null)
    if [ $? -eq 0 ]; then
      echo "$SECRET_NAME=$SECRET_VALUE" >> "$OUTPUT_ENV_FILE"
    else
      echo "Warning: Could not access the latest version of secret $SECRET_NAME"
    fi
  done <<< "$SECRETS"
  echo "" >> "$OUTPUT_ENV_FILE"
fi

echo "Generated .env file at $OUTPUT_ENV_FILE"

# Verify the .env content
cat "$OUTPUT_ENV_FILE"
