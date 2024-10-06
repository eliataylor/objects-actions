#!/bin/bash

REQUIRED_VARS=("GCP_SA_KEY_PATH" "GCP_REGION")

SCRIPT_DIR=$(dirname "$0")
source "${SCRIPT_DIR}/common.sh"

login_service_account $GCP_SA_KEY_PATH $GCP_PROJECT_ID

secrets=$(gcloud secrets list --format="value(name)")

if [ -z "$secrets" ]; then
  echo "No secrets found."
  exit 0
fi

# Iterate over each secret and delete it
for secret in $secrets; do
  echo "Deleting secret: $secret"
  gcloud secrets delete "$secret" --quiet
done

echo "All secrets purged."
