#!/bin/bash

# Please make sure you have enable billing for your project
# Please make sure you enable Service Usage API https://console.cloud.google.com/project/_/apis/library/serviceusage.googleapis.com
# Before running this script

# Define required environment variables for this script
REQUIRED_VARS=("GCP_PROJECT_ID" "GCP_BUCKET_API_ZONE" "GCP_BUCKET_API_NAME")

SCRIPT_DIR=$(dirname "$0")
source "${SCRIPT_DIR}/common.sh"

login_service_account "$GCP_SA_KEY_PATH" "$GCP_PROJECT_ID"

show_section_header "Creating Cloud Storage buckets..."
show_loading "Creating Backend API bucket"
if ! gcloud storage buckets describe "gs://${SANITIZED_GCP_BUCKET_API_NAME}" --format="json(name)" > /dev/null 2>&1; then
    gcloud storage buckets create "gs://${SANITIZED_GCP_BUCKET_API_NAME}" \
        --project="$GCP_PROJECT_ID" \
        --default-storage-class=standard \
        --location="$GCP_BUCKET_API_ZONE"

    if [ $? -ne 0 ]; then
        print_error "gs://${SANITIZED_GCP_BUCKET_API_NAME} creation" "Failed"
    else
        print_success "gs://${SANITIZED_GCP_BUCKET_API_NAME} bucket" "Created"
    fi
else
    print_warning "gs://${SANITIZED_GCP_BUCKET_API_NAME} bucket already exists" "Skipped"
fi


# Make GCS Bucket publicly readable
gcloud storage buckets add-iam-policy-binding "gs://${SANITIZED_GCP_BUCKET_API_NAME}" \
  --member=allUsers \
  --role=roles/storage.objectViewer
