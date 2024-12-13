#!/bin/bash

# Please make sure you have enable billing for your project
# Please make sure you enable Service Usage API https://console.cloud.google.com/project/_/apis/library/serviceusage.googleapis.com
# Before running this script
REQUIRED_VARS=("GCP_PROJECT_ID")

SCRIPT_DIR=$(dirname "$0")
source "${SCRIPT_DIR}/common.sh"

show_section_header "Enabling necessary Google Cloud APIs..."

login_owner "roles/owner"

show_loading "Enabling Google Cloud APIs"
apis=(
    "cloudresourcemanager.googleapis.com"
    "artifactregistry.googleapis.com"
    "cloudbuild.googleapis.com"
    "run.googleapis.com"
    "secretmanager.googleapis.com"
    "sqladmin.googleapis.com"
    "sql-component.googleapis.com"
    "compute.googleapis.com"
    "dns.googleapis.com"
)
for api in "${apis[@]}"; do
    gcloud services enable "$api"
    if [ $? -ne 0 ]; then
        print_error "$api" "Failed"
    else
        print_success "$api" "Enabled"
    fi
done