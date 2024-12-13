#!/bin/bash

# Define required environment variables for this script
REQUIRED_VARS=("GCP_PROJECT_ID" \
              "GCP_REGION" \
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
              "DJANGO_ALLOWED_HOSTS" \
              "DJANGO_CSRF_TRUSTED_ORIGINS" \
              "SMTP_EMAIL_ADDRESS" \
              "ADMIN_EMAIL" \
              "SMTP_EMAIL_HOST" \
              "DEFAULT_FROM_EMAIL" \
              "GOOGLE_CALLBACK_URL" \
              "FRONTEND_URL" \
              "FRONTEND_INDEX_HTML" \
              "GOOGLE_OAUTH_CLIENT_ID" \
              "GOOGLE_PLACES_KEY" \
              "APPLE_KEY_ID" \
              "APPLE_DEVELOPER_TOKEN" \
              "APPLE_TEAM_ID" \
              "APPLE_KEY" \
              "SPOTIFY_CLIENT_ID" \
              "SPOTIFY_REDIRECT_URI" \
              "TWILIO_PHONE_NUMBER" \
              "TWILIO_ACCOUNT_SID" \
              "TWILIO_VERIFY_SERVICE_SID" )

SCRIPT_DIR=$(dirname "$0")
source "${SCRIPT_DIR}/functions.sh"
source "${SCRIPT_DIR}/common.sh"

show_section_header "DEPLOY CLOUD RUN FROM SOURCE"

login_service_account $GCP_SA_KEY_PATH $GCP_PROJECT_ID $GCP_SERVICE_NAME

show_loading "Deploying container to Cloud Run..."
#    --image $GCP_DOCKER_REPO_ZONE-docker.pkg.dev/$GCP_PROJECT_ID/$GCP_DOCKER_REPO_NAME/$GCP_SERVICE_NAME:latest \
#    --image gcr.io/$GCP_PROJECT_ID/$GCP_PROJECT_ID-cloudrun \

gcloud run deploy $GCP_SERVICE_NAME-cloudrun \
    --region $GCP_REGION \
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
    --set-env-vars ^@^DJANGO_ALLOWED_HOSTS=$DJANGO_ALLOWED_HOSTS@DJANGO_CSRF_TRUSTED_ORIGINS=$DJANGO_CSRF_TRUSTED_ORIGINS \
    --set-env-vars DJANGO_SUPERUSER_USERNAME=$DJANGO_SUPERUSER_USERNAME \
    --set-env-vars DJANGO_SUPERUSER_EMAIL=$DJANGO_SUPERUSER_EMAIL \
    --set-env-vars GCP_MYSQL_HOST=$GCP_MYSQL_HOST \
    --set-env-vars MYSQL_DATABASE=$MYSQL_DATABASE \
    --set-env-vars MYSQL_USER=$MYSQL_USER \
    --set-env-vars SMTP_EMAIL_ADDRESS=$SMTP_EMAIL_ADDRESS \
    --set-env-vars EMAIL_HOST_USER=apikey \
    --set-env-vars SMTP_EMAIL_PORT=$SMTP_EMAIL_PORT \
    --set-env-vars SMTP_EMAIL_HOST=$SMTP_EMAIL_HOST \
    --set-env-vars ADMIN_EMAIL=$ADMIN_EMAIL \
    --set-env-vars DEFAULT_FROM_EMAIL=$DEFAULT_FROM_EMAIL \
    --set-env-vars GOOGLE_CALLBACK_URL=$GOOGLE_CALLBACK_URL \
    --set-env-vars FRONTEND_URL=$FRONTEND_URL \
    --set-env-vars FRONTEND_INDEX_HTML=$FRONTEND_INDEX_HTML \
    --set-env-vars GOOGLE_OAUTH_CLIENT_ID=$GOOGLE_OAUTH_CLIENT_ID \
    --set-env-vars APPLE_KEY_ID=$APPLE_KEY_ID \
    --set-env-vars APPLE_BUNDLE_ID=$APPLE_BUNDLE_ID \
    --set-env-vars APPLE_TEAM_ID=$APPLE_TEAM_ID \
    --set-env-vars SPOTIFY_CLIENT_ID=$SPOTIFY_CLIENT_ID \
    --set-env-vars SPOTIFY_REDIRECT_URI=$SPOTIFY_REDIRECT_URI \
    --set-env-vars TWILIO_PHONE_NUMBER=$TWILIO_PHONE_NUMBER \
    --set-env-vars TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID \
    --set-env-vars TWILIO_VERIFY_SERVICE_SID=$TWILIO_VERIFY_SERVICE_SID \
    --set-secrets APPLE_KEY=APPLE_KEY:latest \
    --set-secrets APPLE_DEVELOPER_TOKEN=APPLE_DEVELOPER_TOKEN:latest \
    --set-secrets GOOGLE_OAUTH_SECRET=GOOGLE_OAUTH_SECRET:latest \
    --set-secrets GOOGLE_OAUTH_KEY=GOOGLE_OAUTH_KEY:latest \
    --set-secrets GOOGLE_PLACES_KEY=GOOGLE_PLACES_KEY:latest \
    --set-secrets SMTP_PASSWORD=SMTP_PASSWORD:latest \
    --set-secrets SPOTIFY_SECRET=SPOTIFY_SECRET:latest \
    --set-secrets TWILIO_AUTH_TOKEN=TWILIO_AUTH_TOKEN:latest \
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
