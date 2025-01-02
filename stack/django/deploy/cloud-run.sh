#!/bin/bash

# Define required environment variables for this script
REQUIRED_VARS=("GCP_PROJECT_ID" \
              "GCP_BUCKET_API_ZONE" \
              "DJANGO_ENV" \
              "GCP_SERVICE_NAME" \
              "GCP_BUCKET_API_NAME" \
              "DJANGO_SUPERUSER_EMAIL" \
              "DJANGO_SUPERUSER_USERNAME" \
              "GCP_MYSQL_PROJECT_ID" \
              "GCP_MYSQL_ZONE" \
              "GCP_MYSQL_INSTANCE" \
              "GCP_MYSQL_HOST" \
              "MYSQL_DATABASE" \
              "EMAIL_HOST_USER" \
              "ADMIN_EMAIL" \
              "SMTP_EMAIL_HOST" \
              "DEFAULT_FROM_EMAIL" \
              "FRONTEND_URL" \
              "FRONTEND_INDEX_HTML" \
              "SPOTIFY_CLIENT_ID" \
              "SPOTIFY_SECRET" \
              "LINKEDIN_SECRET" \
              "GITHUB_SECRET" \
              "GITHUB_CLIENT_ID" \
              "GOOGLE_OAUTH_CLIENT_ID" \
              "GOOGLE_OAUTH_SECRET" \
              "GOOGLE_OAUTH_KEY" )

SCRIPT_DIR=$(dirname "$0")
source "${SCRIPT_DIR}/common.sh"

show_section_header "DEPLOY CLOUD RUN FROM SOURCE"

login_service_account "$GCP_SA_KEY_PATH" "$GCP_PROJECT_ID"

show_loading "Deploying container to Cloud Run..."

gcloud run deploy $GCP_SERVICE_NAME-cloudrun \
    --region $GCP_BUCKET_API_ZONE \
    --source . \
    --cpu 1 \
    --platform managed \
    --service-account $GCP_SERVICE_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com \
    --port 8080 \
    --add-cloudsql-instances=$GCP_MYSQL_PROJECT_ID:$GCP_MYSQL_ZONE:$GCP_MYSQL_INSTANCE \
    --set-env-vars DJANGO_ENV=production \
    --set-env-vars DJANGO_DEBUG=True \
    --set-env-vars GCP_PROJECT_ID=$GCP_PROJECT_ID \
    --set-env-vars GCP_BUCKET_API_NAME=$GCP_BUCKET_API_NAME \
    --set-env-vars DJANGO_SUPERUSER_USERNAME=$DJANGO_SUPERUSER_USERNAME \
    --set-env-vars DJANGO_SUPERUSER_EMAIL=$DJANGO_SUPERUSER_EMAIL \
    --set-env-vars GCP_MYSQL_HOST=$GCP_MYSQL_HOST \
    --set-env-vars MYSQL_DATABASE=$MYSQL_DATABASE \
    --set-env-vars MYSQL_USER=$MYSQL_USER \
    --set-env-vars EMAIL_HOST_USER=$EMAIL_HOST_USER \
    --set-env-vars EMAIL_HOST_USER=$EMAIL_HOST_USER \
    --set-env-vars SMTP_EMAIL_PORT=$SMTP_EMAIL_PORT \
    --set-env-vars SMTP_EMAIL_HOST=$SMTP_EMAIL_HOST \
    --set-env-vars ADMIN_EMAIL=$ADMIN_EMAIL \
    --set-env-vars DEFAULT_FROM_EMAIL=$DEFAULT_FROM_EMAIL \
    --set-env-vars FRONTEND_URL=$FRONTEND_URL \
    --set-env-vars FRONTEND_INDEX_HTML=$FRONTEND_INDEX_HTML \
    --set-env-vars SPOTIFY_CLIENT_ID=$SPOTIFY_CLIENT_ID \
    --set-env-vars GOOGLE_OAUTH_CLIENT_ID=$GOOGLE_OAUTH_CLIENT_ID \
    --set-env-vars ^@^GOOGLE_OAUTH_KEY=$GOOGLE_OAUTH_KEY \
    --set-env-vars GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
    --set-env-vars LINKEDIN_CLIENT_ID=$LINKEDIN_CLIENT_ID \
    --set-secrets GOOGLE_OAUTH_SECRET=GOOGLE_OAUTH_SECRET:latest \
    --set-secrets GITHUB_SECRET=GITHUB_SECRET:latest \
    --set-secrets LINKEDIN_SECRET=LINKEDIN_SECRET:latest \
    --set-secrets SMTP_PASSWORD=SMTP_PASSWORD:latest \
    --set-secrets SPOTIFY_SECRET=SPOTIFY_SECRET:latest \
    --set-secrets DJANGO_SECRET_KEY=DJANGO_SECRET_KEY:latest \
    --set-secrets DJANGO_SUPERUSER_PASSWORD=DJANGO_SUPERUSER_PASSWORD:latest \
    --set-secrets MYSQL_PASSWORD=MYSQL_PASSWORD:latest \
    --min-instances 1 \
    --allow-unauthenticated
if [ $? -ne 0 ]; then
    print_error "Deploying to Cloud Run" "Failed"
    exit 1
fi
print_success "Deploying to Cloud Run" "Success"

echo -e "Build and Deploy to Cloud Run completed."
