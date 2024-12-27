#!/bin/bash

# Ensure required environment variables are set
required_vars=("GCP_PROJECT_ID" "GCP_BUCKET_APP_NAME" "SSL_CERT_NAME" "GCP_DNS_ZONE_NAME" "DOMAIN_NAME")

# Set up gcloud CLI using Service Account Key
SCRIPT_DIR="$(dirname "$0")"
source "${SCRIPT_DIR}/common.sh"

login_service_account "$GCP_SA_KEY_PATH" "$GCP_PROJECT_ID"
set_project "$GCP_PROJECT_ID"

# created in functions.sh
# SANITIZED_GCP_BUCKET_APP_NAME=$(sanitize_bucket_name "$GCP_BUCKET_APP_NAME")

progress() {
  local task_name="$1"
  echo -ne "Task: [ $task_name ]\r"
}

echo "Starting GCP setup script for bucket $GCP_BUCKET_APP_NAME renamed to $SANITIZED_GCP_BUCKET_APP_NAME"

# Set Default GCP Project
progress "Setting GCP project to $GCP_PROJECT_ID..."
gcloud config set project "$GCP_PROJECT_ID"

# Reserve global static external IP address for Load Balancer
progress "Reserving global static external IP address for Load Balancer..."
if ! gcloud compute addresses describe "${SANITIZED_GCP_BUCKET_APP_NAME}-ip" --global > /dev/null 2>&1; then
  gcloud compute addresses create "${SANITIZED_GCP_BUCKET_APP_NAME}-ip" \
    --network-tier=PREMIUM \
    --ip-version=IPV4 \
    --global
else
  printf "\e[31mIP address ${SANITIZED_GCP_BUCKET_APP_NAME}-ip already exists. Skipping creation.\e[0m\n"
fi

# Fetch and display the static IP address
progress "Fetching static IP address..."
STATIC_IP=$(gcloud compute addresses describe "${SANITIZED_GCP_BUCKET_APP_NAME}-ip" \
  --format="get(address)" \
  --global 2>/dev/null)

printf "\e[31mUsing Static IP: $STATIC_IP\e[0m\n"

# Create DNS zone if it doesn't exist
createDnsZone() {
  progress "Creating DNS zone..."
  if ! gcloud dns managed-zones describe "$GCP_DNS_ZONE_NAME" > /dev/null 2>&1; then
    gcloud dns managed-zones create "$GCP_DNS_ZONE_NAME" \
      --dns-name="$DOMAIN_NAME" \
      --description="DNS zone for $DOMAIN_NAME"
  else
    echo -e "\e[31mDNS zone $GCP_DNS_ZONE_NAME already exists. Skipping creation.\e[0m"
  fi
}

createDnsZone

# Add DNS record set for the domain
gcloud dns record-sets transaction start --zone="$GCP_DNS_ZONE_NAME"
gcloud dns record-sets transaction add --zone="$GCP_DNS_ZONE_NAME" --name="$DOMAIN_NAME" --ttl=300 --type=A "$STATIC_IP"
gcloud dns record-sets transaction execute --zone="$GCP_DNS_ZONE_NAME"

show_loading "Creating DNS record..."
if ! gcloud dns record-sets describe "${DOMAIN_NAME}." --type=A --zone="$GCP_DNS_ZONE_NAME" > /dev/null 2>&1; then
    gcloud dns record-sets create "${DOMAIN_NAME}." \
        --zone="$GCP_DNS_ZONE_NAME" \
        --type="A" \
        --ttl="300" \
        --rrdatas="$STATIC_IP"
    if [ $? -ne 0 ]; then
        print_error "$DOMAIN_NAME DNS record creation" "Failed"
        exit 1
    else
        print_success "$DOMAIN_NAME DNS record" "Created"
    fi
else
    print_warning "$DOMAIN_NAME DNS record already exists" "Skipped"
fi


# Create SSL Certificate for Load Balancer
progress "Creating SSL certificate..."
if ! gcloud compute ssl-certificates describe "$SSL_CERT_NAME" --global > /dev/null 2>&1; then
  gcloud compute ssl-certificates create "$SSL_CERT_NAME" \
    --description="SSL Certificate for Load Balancer" \
    --domains="$DOMAIN_NAME" \
    --global
else
  printf "\e[31mSSL certificate $SSL_CERT_NAME already exists. Skipping creation.\e[0m\n"
fi

# Create GCS Bucket
progress "Creating GCS bucket..."
if ! gcloud storage buckets describe "gs://${SANITIZED_GCP_BUCKET_APP_NAME}" --format="json(name)" > /dev/null 2>&1; then
  gcloud storage buckets create "gs://${SANITIZED_GCP_BUCKET_APP_NAME}" \
    --project="$GCP_PROJECT_ID" \
    --default-storage-class=standard \
    --location="$GCP_BUCKET_API_ZONE" \
    --uniform-bucket-level-access
else
  printf "\e[31mGCS Bucket ${SANITIZED_GCP_BUCKET_APP_NAME} already exists. Skipping creation.\e[0m\n"
fi

# Make GCS Bucket publicly readable
gcloud storage buckets add-iam-policy-binding "gs://${SANITIZED_GCP_BUCKET_APP_NAME}" \
  --member=allUsers \
  --role=roles/storage.objectViewer

gcloud storage buckets update "gs://${SANITIZED_GCP_BUCKET_APP_NAME}" \
  --web-main-page-suffix=index.html --web-error-page=index.html

# Create external Application Load Balancer with backend buckets
progress "Creating backend bucket..."
if ! gcloud compute backend-buckets describe "${SANITIZED_GCP_BUCKET_APP_NAME}-backend" > /dev/null 2>&1; then
  gcloud compute backend-buckets create "${SANITIZED_GCP_BUCKET_APP_NAME}-backend" \
    --gcs-bucket-name="$SANITIZED_GCP_BUCKET_APP_NAME" \
    --enable-cdn
else
  printf "\e[31mBackend bucket ${SANITIZED_GCP_BUCKET_APP_NAME}-backend already exists. Skipping creation.\e[0m\n"
fi

# Configure the URL map HTTPS
progress "Configuring URL map for HTTPS..."
if ! gcloud compute url-maps describe "${SANITIZED_GCP_BUCKET_APP_NAME}-url-map" > /dev/null 2>&1; then
  gcloud compute url-maps create "${SANITIZED_GCP_BUCKET_APP_NAME}-url-map" \
    --default-backend-bucket="${SANITIZED_GCP_BUCKET_APP_NAME}-backend"
else
  printf "\e[31mURL map ${SANITIZED_GCP_BUCKET_APP_NAME}-url-map already exists. Skipping creation.\e[0m\n"
fi

# Configure the target HTTPS proxy
progress "Configuring target HTTPS proxy..."
if ! gcloud compute target-https-proxies describe "${SANITIZED_GCP_BUCKET_APP_NAME}-https-proxy" > /dev/null 2>&1; then
  gcloud compute target-https-proxies create "${SANITIZED_GCP_BUCKET_APP_NAME}-https-proxy" \
    --url-map="${SANITIZED_GCP_BUCKET_APP_NAME}-url-map" \
    --ssl-certificates="$SSL_CERT_NAME"
else
  printf "\e[31mHTTPS proxy ${SANITIZED_GCP_BUCKET_APP_NAME}-https-proxy already exists. Skipping creation.\e[0m\n"
fi

# gcloud compute url-maps add-path-matcher "${SANITIZED_GCP_BUCKET_APP_NAME}-url-map" \
#    --default-backend-bucket="${SANITIZED_GCP_BUCKET_APP_NAME}-backend" \
#    --path-matcher-name="all-paths" \
#    --path-rules="/*=${SANITIZED_GCP_BUCKET_APP_NAME}"

# Configure the forwarding rule HTTPS
progress "Configuring forwarding rule for HTTPS..."
if ! gcloud compute forwarding-rules describe "${SANITIZED_GCP_BUCKET_APP_NAME}-https-rule" --global > /dev/null 2>&1; then
  gcloud compute forwarding-rules create "${SANITIZED_GCP_BUCKET_APP_NAME}-https-rule" \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --network-tier=PREMIUM \
    --address="${SANITIZED_GCP_BUCKET_APP_NAME}-ip" \
    --global \
    --target-https-proxy="${SANITIZED_GCP_BUCKET_APP_NAME}-https-proxy" \
    --ports=443
else
  printf "\e[31mHTTPS forwarding rule ${SANITIZED_GCP_BUCKET_APP_NAME}-https-rule already exists. Skipping creation.\e[0m\n"
fi

# HTTP to HTTPS redirection
progress "Configuring URL map for HTTP to HTTPS redirection..."
if ! gcloud compute url-maps describe http-to-https --global > /dev/null 2>&1; then
  gcloud compute url-maps import http-to-https \
    --source "$SCRIPT_DIR/http-to-https.yaml" \
    --global
else
  printf "\e[31mURL map http-to-https already exists. Skipping creation.\e[0m\n"
fi

# Configure the target HTTP proxy
progress "Configuring target HTTP proxy..."
if ! gcloud compute target-http-proxies describe "${SANITIZED_GCP_BUCKET_APP_NAME}-http-proxy" --global > /dev/null 2>&1; then
  gcloud compute target-http-proxies create "${SANITIZED_GCP_BUCKET_APP_NAME}-http-proxy" \
    --url-map=http-to-https \
    --global
else
  printf "\e[31mHTTP proxy ${SANITIZED_GCP_BUCKET_APP_NAME}-http-proxy already exists. Skipping creation.\e[0m\n"
fi

# Configure the forwarding rule HTTP
progress "Configuring forwarding rule for HTTP..."
if ! gcloud compute forwarding-rules describe "${SANITIZED_GCP_BUCKET_APP_NAME}-http-rule" --global > /dev/null 2>&1; then
  gcloud compute forwarding-rules create "${SANITIZED_GCP_BUCKET_APP_NAME}-http-rule" \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --network-tier=PREMIUM \
    --address="${SANITIZED_GCP_BUCKET_APP_NAME}-ip" \
    --global \
    --target-http-proxy="${SANITIZED_GCP_BUCKET_APP_NAME}-http-proxy" \
    --ports=80
else
  printf "\e[31mHTTP forwarding rule ${SANITIZED_GCP_BUCKET_APP_NAME}-http-rule already exists. Skipping creation.\e[0m\n"
fi

printf "\nGCP setup script completed.\n"
