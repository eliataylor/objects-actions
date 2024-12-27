#!/bin/bash

REQUIRED_VARS=("GCP_PROJECT_ID" "GCP_BUCKET_API_ZONE" "GCP_DNS_ZONE_NAME" "GCP_SERVICE_NAME" "DOMAIN_NAME")

SCRIPT_DIR=$(dirname "$0")
source "${SCRIPT_DIR}/common.sh"

login_service_account "$GCP_SA_KEY_PATH" "$GCP_PROJECT_ID"

# Get Project Number
show_loading "Get GCP Project number"
PROJECT_NUMBER=$(gcloud projects describe "$GCP_PROJECT_ID" --format="value(projectNumber)")
if [ $? -ne 0 ]; then
  print_error "Retrieving project number" "Failed"
  exit 1
fi
print_success "Project number: $PROJECT_NUMBER" "Retrieved"

# Section 2: Setup IP, DNS, SSL Certificate
show_section_header "Setup IP and DNS..."
show_loading "Reserving global static external IP..."
echo "Reserving global static external IP address for Loadbalancer..."
if ! gcloud compute addresses describe "$GCP_SERVICE_NAME-api-ip" --global > /dev/null 2>&1; then
    gcloud compute addresses create "$GCP_SERVICE_NAME-api-ip" \
        --network-tier=PREMIUM \
        --ip-version=IPV4 \
        --global
    if [ $? -ne 0 ]; then
        print_error "$GCP_SERVICE_NAME-api-ip IP creation" "Failed"
        exit 1
    else
        print_success "$GCP_SERVICE_NAME-api-ip IP" "Created"
    fi
else
    print_warning "$GCP_SERVICE_NAME-api-ip IP already exists" "Skipped"
fi

# Set the IP address as environment variable
show_loading "Fetching static IP address..."
STATIC_IP=$(gcloud compute addresses describe "$GCP_SERVICE_NAME-api-ip" \
    --format="get(address)" \
    --global 2>/dev/null)
echo "Static IP: $STATIC_IP"

# Create DNS zone if it doesn't exist
show_loading "Creating DNS zone..."
if ! gcloud dns managed-zones describe "$GCP_DNS_ZONE_NAME" > /dev/null 2>&1; then
    gcloud dns managed-zones create "$GCP_DNS_ZONE_NAME" --dns-name="$DOMAIN_NAME." --description="DNS zone for $DOMAIN_NAME"

    if [ $? -ne 0 ]; then
        print_error "$GCP_DNS_ZONE_NAME DNS Zone creation" "Failed"
        exit 1
    else
        print_success "$GCP_DNS_ZONE_NAME DNS Zone" "Created"
    fi
else
    print_warning "$GCP_DNS_ZONE_NAME DNS Zone already exists" "Skipped"
fi

# Add a DNS record set for your domain
show_loading "Creating DNS record..."
if ! gcloud dns record-sets describe "api.${DOMAIN_NAME}." --type=A --zone="$GCP_DNS_ZONE_NAME" > /dev/null 2>&1; then
    gcloud dns record-sets create "api.${DOMAIN_NAME}." \
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

# Create SSL Certificate for Loadbalancer
show_loading "Creating SSL certificate..."
if ! gcloud compute ssl-certificates describe "$GCP_SERVICE_NAME-api-ssl" --global > /dev/null 2>&1; then
    gcloud compute ssl-certificates create "$GCP_SERVICE_NAME-api-ssl" \
        --description="SSL Certificate for Loadbalancer" \
        --domains="api.${DOMAIN_NAME}" \
        --global
    if [ $? -ne 0 ]; then
        print_error "$GCP_SERVICE_NAME-api-ssl certificate creation" "Failed"
        exit 1
    else
        print_success "$GCP_SERVICE_NAME-api-ssl certificate" "Created"
    fi
else
    print_warning "$GCP_SERVICE_NAME-api-ssl certificate already exists" "Skipped"
fi

# Create a serverless NEG
show_section_header "Setup Backend services..."
show_loading "Creating serverless NEG..."
if ! gcloud compute network-endpoint-groups describe "$GCP_SERVICE_NAME-api-neg" --region="$GCP_BUCKET_API_ZONE" > /dev/null 2>&1; then
    gcloud compute network-endpoint-groups create "$GCP_SERVICE_NAME-api-neg" \
        --region="$GCP_BUCKET_API_ZONE" \
        --network-endpoint-type=serverless \
        --cloud-run-service="$GCP_SERVICE_NAME-cloudrun"
    if [ $? -ne 0 ]; then
        print_error "$GCP_SERVICE_NAME-api-neg NEG creation" "Failed"
        exit 1
    else
        print_success "$GCP_SERVICE_NAME-api-neg NEG" "Created"
    fi
else
    print_warning "$GCP_SERVICE_NAME-api-neg NEG already exists" "Skipped"
fi

# Create a backend service
show_loading "Creating a Backend Service..."
if ! gcloud compute backend-services describe "$GCP_SERVICE_NAME-api-bs" --global > /dev/null 2>&1; then
    gcloud compute backend-services create "$GCP_SERVICE_NAME-api-bs" \
        --load-balancing-scheme=EXTERNAL_MANAGED \
        --global
    if [ $? -ne 0 ]; then
        print_error "$GCP_SERVICE_NAME-api-bs backend service creation" "Failed"
        exit 1
    else
        print_success "$GCP_SERVICE_NAME-api-bs backend service" "Created"
    fi
else
    print_warning "$GCP_SERVICE_NAME-api-bs backend service already exists" "Skipped"
fi

# Add serverless NEG to the backend service
show_loading "Adding serverless NEG to the backend service..."
gcloud compute backend-services add-backend "$GCP_SERVICE_NAME-api-bs" \
    --global \
    --network-endpoint-group="$GCP_SERVICE_NAME-api-neg" \
    --network-endpoint-group-region="$GCP_BUCKET_API_ZONE"
if [ $? -ne 0 ]; then
    print_error "Adding $GCP_SERVICE_NAME-api-neg to backend service" "Failed"
    exit 1
else
    print_success "Adding $GCP_SERVICE_NAME-api-neg to backend service" "Success"
fi


# URL map
# Create a URL map to route incoming requests to the backend service
echo "Creating URL map..."
if ! gcloud compute url-maps describe "$GCP_SERVICE_NAME-api-url-map" > /dev/null 2>&1; then
  gcloud compute url-maps create "$GCP_SERVICE_NAME-api-url-map" \
    --default-service "$GCP_SERVICE_NAME-api-bs" \
    --global
else
    printf "\e[31m$GCP_SERVICE_NAME-api-url-map already exists. Skipping creation.\e[0m"
fi
echo

# Create a URL map to redirect HTTP to HTTPS
echo "Creating URL map for HTTP to HTTPS redirection..."
if ! gcloud compute url-maps describe http-to-https --global > /dev/null 2>&1; then
    gcloud compute url-maps import http-to-https \
        --source "$SCRIPT_DIR/http-to-https.yaml" \
        --global
else
    printf "\e[31mhttp-to-https already exists. Skipping creation.\e[0m"
fi
echo

# Target Proxy
# Create HTTP target proxy
echo "Creating HTTP target proxy..."
if ! gcloud compute target-http-proxies describe "$GCP_SERVICE_NAME-api-http-proxy" > /dev/null 2>&1; then
    gcloud compute target-http-proxies create "$GCP_SERVICE_NAME-api-http-proxy" \
        --url-map=http-to-https \
        --global
else
    printf "\e[31m$GCP_SERVICE_NAME-api-http-proxy already exists. Skipping creation.\e[0m"
fi
echo

# Create HTTPS target proxy
echo "Creating HTTPS target proxy..."
if ! gcloud compute target-https-proxies describe "$GCP_SERVICE_NAME-api-https-proxy" > /dev/null 2>&1; then
    gcloud compute target-https-proxies create "$GCP_SERVICE_NAME-api-https-proxy" \
        --ssl-certificates="$GCP_SERVICE_NAME-api-ssl" \
        --url-map="$GCP_SERVICE_NAME-api-url-map"
        --global
else
    printf "\e[31m$GCP_SERVICE_NAME-api-https-proxy already exists. Skipping creation.\e[0m"
fi
echo

# Forwarding Rules
# Create HTTP load balancer
echo "Creating HTTP load balancer..."
if ! gcloud compute forwarding-rules describe "$GCP_SERVICE_NAME-api-http-lb" > /dev/null 2>&1; then
    gcloud compute forwarding-rules create "$GCP_SERVICE_NAME-api-http-lb" \
        --load-balancing-scheme=EXTERNAL_MANAGED \
        --network-tier=PREMIUM \
        --address="$GCP_SERVICE_NAME-api-ip" \
        --target-http-proxy="$GCP_SERVICE_NAME-api-http-proxy" \
        --global \
        --ports=80
else
    printf "\e[31m$GCP_SERVICE_NAME-api-http-lb already exists. Skipping creation.\e[0m"
fi
echo

# Create HTTPS load balancer
echo "Creating HTTPS load balancer..."
if ! gcloud compute forwarding-rules describe "$GCP_SERVICE_NAME-api-https-lb" > /dev/null 2>&1; then
    gcloud compute forwarding-rules create "$GCP_SERVICE_NAME-api-https-lb" \
        --load-balancing-scheme=EXTERNAL_MANAGED \
        --network-tier=PREMIUM \
        --address="$GCP_SERVICE_NAME-api-ip" \
        --target-https-proxy="$GCP_SERVICE_NAME-api-https-proxy" \
        --global \
        --ports=443
else
    printf "\e[31m$GCP_SERVICE_NAME-api-https-lb already exists. Skipping creation.\e[0m"
fi
echo


printf "\nLoad balancer setup completed."
