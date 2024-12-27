#!/bin/bash

# Setup gcloud CLI using Service Account Key
# Define required environment variables for this script
REQUIRED_VARS=("GCP_PROJECT_ID" "GCP_BUCKET_APP_NAME" "GCP_SA_KEY_PATH")

SCRIPT_DIR=$(dirname "$0")
source "${SCRIPT_DIR}/common.sh"

login_service_account "$GCP_SA_KEY_PATH" "$GCP_PROJECT_ID"
# login_owner "roles/owner" $GCP_PROJECT_ID
set_project $GCP_PROJECT_ID

SANITIZED_BUCKET_NAME=$(sanitize_bucket_name "$GCP_BUCKET_APP_NAME")

show_loading "Building Project"

npm run build

show_section_header "Deploying front end to $SANITIZED_BUCKET_NAME..."
show_loading "Setting Web/Cors Settings"
gsutil web set -m index.html -e index.html gs://$SANITIZED_BUCKET_NAME
gsutil cors set "$SCRIPT_DIR/storage-cors.json" gs://$SANITIZED_BUCKET_NAME

show_loading "Uploading Project"
gcloud storage rsync build gs://$SANITIZED_BUCKET_NAME --recursive
# gsutil -m rsync -r build gs://$SANITIZED_BUCKET_NAME
