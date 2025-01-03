#!/bin/bash
# bash deploy/upload-app.sh .env

REQUIRED_VARS=("GCP_PROJECT_ID" "GCP_BUCKET_APP_NAME" "GCP_SA_KEY_PATH" "REACT_APP_API_HOST")

SCRIPT_DIR=$(dirname "$0")
source "${SCRIPT_DIR}/common.sh"

if [[ "${REACT_APP_API_HOST}" =~ localhost|localapi|:[0-9]+ ]]; then
  read -p "Warning: Are you sure you want to deploy REACT_APP_API_HOST as ${REACT_APP_API_HOST}? (yes/no): " CONFIRMATION
  if [[ "$CONFIRMATION" != "yes" ]]; then
    echo "Aborted. Then update it in your .env"
    exit 1
  fi
fi

login_service_account "$GCP_SA_KEY_PATH" "$GCP_PROJECT_ID"
# login_owner "roles/owner" $GCP_PROJECT_ID
set_project "$GCP_PROJECT_ID"

show_loading "Building Project"

npm run build

show_section_header "Deploying front end to ${SANITIZED_GCP_BUCKET_APP_NAME}..."
show_loading "Setting Web/Cors Settings"
gsutil web set -m index.html -e index.html "gs://${SANITIZED_GCP_BUCKET_APP_NAME}"
gsutil cors set "$SCRIPT_DIR/storage-cors.json" "gs://${SANITIZED_GCP_BUCKET_APP_NAME}"

show_loading "Uploading Project"
gcloud storage rsync build "gs://${SANITIZED_GCP_BUCKET_APP_NAME}" --recursive
# gsutil -m rsync -r build gs://$SANITIZED_GCP_BUCKET_APP_NAME
