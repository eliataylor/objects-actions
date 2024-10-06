# Define required environment variables for this script
REQUIRED_VARS=("GCP_PROJECT_ID" "GCP_SERVICE_NAME")

show_section_header "CREATING SERVICE ACCOUNT"

source "./common.sh"

login_owner "roles/owner"

show_loading "Enable required IAM API..."
gcloud services enable iam.googleapis.com
if [ $? -ne 0 ]; then
    print_error "Enabling IAM API" "Failed"
    exit 1
else
    print_success "Enabling IAM API" "Success"
fi


show_loading "Creating service account..."
if ! gcloud iam service-accounts describe $GCP_SERVICE_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com > /dev/null 2>&1; then
    gcloud iam service-accounts create $GCP_SERVICE_NAME \
    --description="Service account for automatic deployment to google cloud" \
    --display-name="$GCP_SERVICE_NAME"
    if [ $? -ne 0 ]; then
        print_error "Service account creation" "Failed"
    else
        print_success "Service account creation" "Success"
    fi
else
    print_warning "$GCP_SERVICE_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com already exists" "Skipped"
fi

show_loading "Add necessary IAM permissions for service account..."
roles=(
    "roles/viewer"
    "roles/artifactregistry.admin"
    "roles/cloudbuild.builds.builder"
    "roles/run.admin"
    "roles/cloudsql.admin"
    "roles/compute.instanceAdmin.v1"
    "roles/compute.networkAdmin"
    "roles/compute.securityAdmin"
    "roles/dns.admin"
    "roles/secretmanager.admin"
    "roles/iam.serviceAccountUser"
    "roles/serviceusage.serviceUsageAdmin"
    "roles/storage.admin"
)
for role in "${roles[@]}"; do
    if [[ $(gcloud projects get-iam-policy $GCP_PROJECT_ID --flatten="bindings[].members" --format='table(bindings.role)' --filter="bindings.members:$GCP_SERVICE_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com AND bindings.role:$role") == ROLE* ]] then
        print_warning "$role role already exists" "Skipped"
    else
        gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
        --member="serviceAccount:$GCP_SERVICE_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
        --role="$role" \
        --quiet
        if [ $? -ne 0 ]; then
            print_error "$role added to Service Account" "Failed"
        else
            print_success "$role added to Service Account" "Success"
        fi
    fi
done


# Create and download the service account key
show_loading "Create and download the service account key..."

gcloud iam service-accounts keys create $GCP_SA_KEY_PATH \
    --iam-account=$GCP_SERVICE_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com

if [ $? -ne 0 ]; then
    print_error "Service account key creation" "Failed"
else
    print_success "Service account key creation" "Success"
fi