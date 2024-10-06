#!/bin/bash

# Please make sure you have enable billing for your project
# Please make sure you enable Service Usage API https://console.cloud.google.com/project/_/apis/library/serviceusage.googleapis.com
# Before running this script
show_section_header "Enabling necessary Google Cloud APIs..."

# Define required environment variables for this script
source "./common.sh"

login_owner "roles/owner"

# Section 2: Enable necessary Google Cloud APIs
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