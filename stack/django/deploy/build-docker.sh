#!/bin/bash

# Define required environment variables for this script
REQUIRED_VARS=("GCP_PROJECT_ID" "GCP_DOCKER_REPO_ZONE" "GCP_DOCKER_REPO_NAME" "GCP_SERVICE_NAME")

SCRIPT_DIR="$(dirname "$0")"
source "${SCRIPT_DIR}/common.sh"

login_service_account "$GCP_SA_KEY_PATH" "$GCP_PROJECT_ID"

show_section_header "Building & submitting containers..."

# Create an Artifact Registry repository
show_loading "Creating repository"
if ! gcloud artifacts repositories describe "$GCP_DOCKER_REPO_NAME" --location="$GCP_DOCKER_REPO_ZONE" > /dev/null 2>&1; then
    gcloud artifacts repositories create "$GCP_DOCKER_REPO_NAME" \
        --repository-format=docker \
        --location="$GCP_DOCKER_REPO_ZONE" \
        --description="DESCRIPTION" \
        --async
    if [ $? -ne 0 ]; then
        print_error "$GCP_DOCKER_REPO_NAME repository creation" "Failed"
        exit 1
    else
        print_success "$GCP_DOCKER_REPO_NAME repository" "Created"
    fi
else
    print_warning "$GCP_DOCKER_REPO_NAME repository already exists" "Skipped"
fi

# Authenticate Docker to Artifact Registry
show_loading "Authenticating Docker to Artifact Registry..."
gcloud auth configure-docker "$GCP_DOCKER_REPO_ZONE-docker.pkg.dev"
if [ $? -ne 0 ]; then
    print_error "Authenticating Docker" "Failed"
    exit 1
fi
print_success "Docker authenticated to Artifact Registry" "Success"

# Build container and submit to Artifact Registry repository
cd "$PARENT_DIR" || exit

show_loading "Building container and submitting to Artifact Registry..."

gcloud builds submit --tag "$GCP_DOCKER_REPO_ZONE-docker.pkg.dev/$GCP_PROJECT_ID/$GCP_DOCKER_REPO_NAME/$GCP_SERVICE_NAME:latest"
 # --config "$PARENT_DIR/Dockerfile"

if [ $? -ne 0 ]; then
    print_error "Building & submitting container" "Failed"
    exit 1
fi
print_success "Building & submitting container" "Success"
