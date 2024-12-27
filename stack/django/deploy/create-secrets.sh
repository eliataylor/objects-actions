#!/bin/bash

# Define required environment variables for this script


REQUIRED_VARS=("GCP_PROJECT_ID" "GCP_BUCKET_API_ZONE" "GCP_SERVICE_NAME")

SCRIPT_DIR=$(dirname "$0")
source "${SCRIPT_DIR}/common.sh"

show_section_header "ADD SECRETS TO GCP: WARNING THIS DOES NOT WORK FOR variable values with spaces in them. even if quoted"
login_service_account "$GCP_SA_KEY_PATH" "$GCP_PROJECT_ID"
set_project $GCP_PROJECT_ID

json_string=$(jq -r ${GCP_SA_KEY_PATH})
printf json_string
show_loading "Setting Service Agent key a string in Secrets Manager"
create_secret "GCP_SA_KEY" "$json_string"
if [ $? -ne 0 ]; then
    print_error "GCP_SA_KEY failed to set!"
    exit 1
else
    print_success "GCP_SA_KEY set"
fi

variable_names=("GCP_PROJECT_ID" \
\
 "GCP_DOCKER_REPO_ZONE" \
 "GCP_DOCKER_REPO_NAME" \
\
 "GCP_DNS_ZONE_NAME" \
 "DOMAIN_NAME" \
\
 "GCP_BUCKET_API_ZONE" \
 "GCP_BUCKET_API_NAME" \
 "GCP_BUCKET_APP_ZONE" \
 "GCP_BUCKET_APP_NAME" \
\
 "GCP_SERVICE_NAME" \
\
 "MYSQL_DATABASE" \
 "MYSQL_USER" \
 "MYSQL_PASSWORD" \
 "GCP_MYSQL_HOST" \
 "GCP_MYSQL_INSTANCE" \
 "GCP_MYSQL_ZONE" \

 "DJANGO_SECRET_KEY" \
 "DJANGO_SUPERUSER_USERNAME" \
 "DJANGO_SUPERUSER_PASSWORD" \
 "DJANGO_SUPERUSER_EMAIL" \
 "DJANGO_ALLOWED_HOSTS" \
 "DJANGO_CSRF_TRUSTED_ORIGINS" \

 "SMTP_PASSWORD" \
 "SMTP_EMAIL_ADDRESS" \

 "GOOGLE_OAUTH_CLIENT_ID" \
 "GOOGLE_OAUTH_KEY" \
 "FRONTEND_URL" \
 "DEFAULT_FROM_EMAIL" \
 "TWILIO_ACCOUNT_SID" \
 "TWILIO_AUTH_TOKEN" \
 "GITHUB_CLIENT_ID" \
 "LINKEDIN_CLIENT_ID" \
 "SPOTIFY_CLIENT_ID")

secret_names=("MYSQL_PASSWORD" \
 "DJANGO_SECRET_KEY" \
 "DJANGO_SUPERUSER_PASSWORD" \
 "SMTP_PASSWORD" \
 "GOOGLE_OAUTH_SECRET" \
 "TWILIO_AUTH_TOKEN" \
 "SPOTIFY_SECRET" \
 "GITHUB_SECRET" \
 "LINKEDIN_SECRET" )

GCP_BUCKET_API_NAME

for var_name in "${secret_names[@]}"; do
    var_value="${!var_name}"

    # Call the function to create secret
    create_secret "$var_name" "$var_value"

    if [ $? -ne 0 ]; then
        print_error "$var_name" " failed to set!"
    else
        print_success "$var_name" " set"
    fi
done
