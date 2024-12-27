#!/bin/bash

# Create and Generate Service Account Key, save it as 'sa_key.json' in the root folder with the following IAM Permissions:
# Network Admin             # Create load balancer components
# Storage Object Admin      # Create Cloud Storage buckets
# Compute Security Admin    # Create Google-managed SSL certificates
# DNS Administrator         # To manage Cloud DNS
#
# You can also using your own user that has Owner/Editor permissions
# Comment `gcloud auth login --cred-file="$PARENT_DIR/sa_key.json"` command below
# Make sure you have already setup gcloud SDK (gcloud CLI) and login with your account
# Documentation : https://cloud.google.com/sdk/docs/authorizing

# Define required environment variables for this script
required_vars=("GCP_PROJECT_ID" "GCP_BUCKET_APP_NAME" "SSL_CERT_NAME" "GCP_DNS_ZONE_NAME" "DOMAIN_NAME")

# Setup gcloud CLI using Service Account Key
SCRIPT_DIR=$(dirname "$0")
source "${SCRIPT_DIR}/common.sh"

login_service_account $GCP_SA_KEY_PATH $GCP_PROJECT_ID $GCP_SERVICE_NAME
# login_owner "roles/owner" $GCP_PROJECT_ID
set_project $GCP_PROJECT_ID


# Set Task Progress
progress() {
  local task_name=$1
  # current_step=$((current_step + 1))
  # percentage=$((current_step * 100 / total_steps))
  echo -ne "Task: [ $task_name ]\r"
}


# Set Path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Validate environment variables or exit
source "$SCRIPT_DIR/common.sh"

# Set sanitized name for all Loadbalancer resources
SANITIZED_BUCKET_NAME=$(sanitize_bucket_name "$GCP_BUCKET_APP_NAME")

echo "Starting GCP setup script..."
echo

# Set Default GCP Project
task_name="Setting GCP project to $GCP_PROJECT_ID..."
progress "$task_name"
gcloud config set project $GCP_PROJECT_ID


# Reserve global static external IP address for Loadbalancer
task_name="Reserving global static external IP address for Loadbalancer..."
progress "$task_name"
if ! gcloud compute addresses describe $SANITIZED_BUCKET_NAME-ip --global > /dev/null 2>&1; then
  gcloud compute addresses create $SANITIZED_BUCKET_NAME-ip \
      --network-tier=PREMIUM \
      --ip-version=IPV4 \
      --global
else
  printf "\e[31mIP address $SANITIZED_BUCKET_NAME-ip already exists. Skipping creation.\e[0m"
fi


# Set the IP address as environment variable
task_name="Fetching static IP address..."
progress "$task_name"
STATIC_IP=$(gcloud compute addresses describe $SANITIZED_BUCKET_NAME-ip \
    --format="get(address)" \
    --global 2>/dev/null)

printf "\e[31mGCS Using Static IP $STATIC_IP\e[0m"

createDnsZone() {
  task_name="Creating DNS zone..."
  progress "$task_name"
  # Create DNS zone if it doesn't exist
  if ! gcloud dns managed-zones describe $GCP_DNS_ZONE_NAME > /dev/null 2>&1; then
    gcloud dns managed-zones create $GCP_DNS_ZONE_NAME --dns-name=$DOMAIN_NAME --description="DNS zone for $DOMAIN_NAME"
  else
    echo -e "\e[31mDNS zone $GCP_DNS_ZONE_NAME already exists. Skipping creation.\e[0m"
  fi
}


# Add a DNS record set for your domain, ww.domain, and dev.domain
gcloud dns record-sets transaction start --zone=$GCP_DNS_ZONE_NAME
gcloud dns record-sets transaction add --zone=$GCP_DNS_ZONE_NAME --name=$DOMAIN_NAME --ttl=300 --type=A "$STATIC_IP"
gcloud dns record-sets transaction execute --zone=$GCP_DNS_ZONE_NAME

# Create SSL Certificate for Loadbalancer
task_name="Creating SSL certificate..."
progress "$task_name"
if ! gcloud compute ssl-certificates describe $SSL_CERT_NAME --global > /dev/null 2>&1; then
  gcloud compute ssl-certificates create $SSL_CERT_NAME \
      --description="SSL Certificate for Loadbalancer" \
      --domains=$DOMAIN_NAME \
      --global
else
  printf "\e[31mSSL certificate $SSL_CERT_NAME already exists. Skipping creation.\e[0m"
fi


# Create GCS Bucket
task_name="Creating GCS bucket..."
progress "$task_name"
if ! gcloud storage buckets describe gs://$SANITIZED_BUCKET_NAME --format="json(name)" > /dev/null 2>&1; then
  # Create GCS Bucket
  gcloud storage buckets create gs://$SANITIZED_BUCKET_NAME \
    --project=$GCP_PROJECT_ID \
    --default-storage-class=standard \
    --location=$GCP_BUCKET_API_ZONE \
    --uniform-bucket-level-access

else
  printf "\e[31mGCS Bucket $SANITIZED_BUCKET_NAME already exists. Skipping creation.\e[0m"
fi


# Make GCS Bucket publicly readable
gcloud storage buckets add-iam-policy-binding \
  gs://$SANITIZED_BUCKET_NAME \
  --member=allUsers \
  --role=roles/storage.objectViewer

# Assign specialty pages
gcloud storage buckets update gs://$SANITIZED_BUCKET_NAME --web-main-page-suffix=index.html --web-error-page=404.html

# Create external Application Load Balancer with backend buckets
task_name="Creating backend bucket..."
progress "$task_name"
if ! gcloud compute backend-buckets describe $SANITIZED_BUCKET_NAME-backend > /dev/null 2>&1; then
  gcloud compute backend-buckets create $SANITIZED_BUCKET_NAME-backend \
    --gcs-bucket-name=$SANITIZED_BUCKET_NAME \
    --enable-cdn
else
  printf "\e[31mBackend bucket $SANITIZED_BUCKET_NAME-backend already exists. Skipping creation.\e[0m"
fi


# Configure the URL map HTTPS
task_name="Configuring URL map for HTTPS..."
progress "$task_name"
if ! gcloud compute url-maps describe "$SANITIZED_BUCKET_NAME-url-map" > /dev/null 2>&1; then
  gcloud compute url-maps create "$SANITIZED_BUCKET_NAME-url-map" \
    --default-backend-bucket="$SANITIZED_BUCKET_NAME-backend"
else
  printf "\e[31mURL map $SANITIZED_BUCKET_NAME-url-map already exists. Skipping creation.\e[0m"
fi


# Configure the target proxy
task_name="Configuring target HTTPS proxy..."
progress "$task_name"
# For HTTPS proxy to route requests to your URL map
if ! gcloud compute target-https-proxies describe $SANITIZED_BUCKET_NAME-https-proxy > /dev/null 2>&1; then
  gcloud compute target-https-proxies create $SANITIZED_BUCKET_NAME-https-proxy \
    --url-map="$SANITIZED_BUCKET_NAME-url-map" \
    --ssl-certificates=$SSL_CERT_NAME
else
  printf "\e[31mHTTPS proxy $SANITIZED_BUCKET_NAME-https-proxy already exists. Skipping creation.\e[0m"
fi


gcloud compute url-maps add-path-matcher "$SANITIZED_BUCKET_NAME-url-map" \
    --default-backend-bucket=$SANITIZED_BUCKET_NAME \
    --path-matcher-name="all-paths" \
    --path-rules="/*=/$SANITIZED_BUCKET_NAME/index.html"



# Configure the forwarding rule HTTPS
task_name="Configuring forwarding rule for HTTPS..."
progress "$task_name"
if ! gcloud compute forwarding-rules describe $SANITIZED_BUCKET_NAME-https-rule --global > /dev/null 2>&1; then
  gcloud compute forwarding-rules create $SANITIZED_BUCKET_NAME-https-rule \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --network-tier=PREMIUM \
    --address=$SANITIZED_BUCKET_NAME-ip \
    --global \
    --target-https-proxy=$SANITIZED_BUCKET_NAME-https-proxy \
    --ports=443
else
  printf "\e[31mHTTPS forwarding rule $SANITIZED_BUCKET_NAME-https-rule already exists. Skipping creation.\e[0m"
fi


# HTTP to HTTPS redirection
task_name="Configuring URL map for HTTP to HTTPS redirection..."
progress "$task_name"
# Configure the URL map for HTTP to HTTPS redirection
if ! gcloud compute url-maps describe http-to-https --global > /dev/null 2>&1; then
  gcloud compute url-maps import http-to-https \
    --source $SCRIPT_DIR/http-to-https.yaml \
    --global
else
  printf "\e[31mURL map http-to-https already exists. Skipping creation.\e[0m"
fi




# Configure the target proxy HTTP
task_name="Configuring target HTTP proxy..."
progress "$task_name"
if ! gcloud compute target-http-proxies describe $SANITIZED_BUCKET_NAME-http-proxy --global > /dev/null 2>&1; then
  gcloud compute target-http-proxies create $SANITIZED_BUCKET_NAME-http-proxy \
    --url-map=http-to-https \
    --global
else
  printf "\e[31mHTTP proxy $SANITIZED_BUCKET_NAME-http-proxy already exists. Skipping creation.\e[0m"
fi


# Configure the forwarding rule HTTP
task_name="Configuring forwarding rule for HTTP..."
progress "$task_name"
if ! gcloud compute forwarding-rules describe $SANITIZED_BUCKET_NAME-http-rule --global > /dev/null 2>&1; then
  gcloud compute forwarding-rules create $SANITIZED_BUCKET_NAME-http-rule \
      --load-balancing-scheme=EXTERNAL_MANAGED \
      --network-tier=PREMIUM \
      --address=$SANITIZED_BUCKET_NAME-ip \
      --global \
      --target-http-proxy=$SANITIZED_BUCKET_NAME-http-proxy \
      --ports=80
else
  printf "\e[31mHTTP forwarding rule $SANITIZED_BUCKET_NAME-http-rule already exists. Skipping creation.\e[0m"
fi


printf "\nGCP setup script completed."
