#!/bin/bash

REQUIRED_VARS=("GCP_PROJECT_ID" "GCP_REGION" "GCP_DNS_ZONE_NAME" "GCP_SERVICE_NAME" "DOMAIN_NAME")

source "./common.sh"

login_service_account $GCP_SA_KEY_PATH $GCP_PROJECT_ID

# Get Project Number
show_loading "Get GCP Project number"
PROJECT_NUMBER=$(gcloud projects describe $GCP_PROJECT_ID --format="value(projectNumber)")
if [ $? -ne 0 ]; then
  print_error "Retrieving project number" "Failed"
  exit 1
fi
print_success "Project number: $PROJECT_NUMBER" "Retrieved"


# Section 2: Setup IP, DNS, SSL Certificate
show_section_header "Setup IP and DNS..."
show_loading "Reserving global static external IP..."
echo "Reserving global static external IP address for Loadbalancer..."
if ! gcloud compute addresses describe $SERVICE_NAME-$PROJECT_NUMBER-ip --global > /dev/null 2>&1; then
    gcloud compute addresses create $SERVICE_NAME-$PROJECT_NUMBER-ip \
        --network-tier=PREMIUM \
        --ip-version=IPV4 \
        --global
    if [ $? -ne 0 ]; then
        print_error "$SERVICE_NAME-$PROJECT_NUMBER-ip IP creation" "Failed"
        exit 1
    else
        print_success "$SERVICE_NAME-$PROJECT_NUMBER-ip IP" "Created"
    fi
else
    print_warning "$SERVICE_NAME-$PROJECT_NUMBER-ip IP already exists" "Skipped"
fi

# Set the IP address as environment variable
show_loading "Fetching static IP address..."
STATIC_IP=$(gcloud compute addresses describe $SERVICE_NAME-$PROJECT_NUMBER-ip \
    --format="get(address)" \
    --global 2>/dev/null)
echo "Static IP: $STATIC_IP"

# Create DNS zone if it doesn't exist
show_loading "Creating DNS zone..."
if ! gcloud dns managed-zones describe $GCP_DNS_ZONE_NAME > /dev/null 2>&1; then
    gcloud dns managed-zones create $GCP_DNS_ZONE_NAME --dns-name="$DOMAIN_NAME." --description="DNS zone for $DOMAIN_NAME"

    if [ $? -ne 0 ]; then
        print_error "$GCP_DNS_ZONE_NAME DNS Zone creation" "Failed"
        exit 1
    else
        print_success "$GCP_DNS_ZONE_NAME DNS Zone" "Created"

        # Add a DNS record set for your domain, ww.domain, and dev.domain
        show_loading "Creating DNS record..."
        if ! gcloud dns record-sets describe $DOMAIN_NAME. --type=A --zone=$GCP_DNS_ZONE_NAME > /dev/null 2>&1; then
            gcloud dns record-sets create $DOMAIN_NAME. \
                --zone="$GCP_DNS_ZONE_NAME" \
                --type="A" \
                --ttl="300" \
                --rrdatas="$STATIC_IP"
            if [ $? -ne 0 ]; then
                print_error "$GCP_DNS_ZONE_NAME DNS Zone creation" "Failed"
                exit 1
            else
                print_success "$GCP_DNS_ZONE_NAME DNS Zone" "Created"
            fi
        else
            print_warning "$DOMAIN_NAME DNS record already exists" "Skipped"
        fi
    fi
else
    print_warning "$GCP_DNS_ZONE_NAME DNS Zone already exists" "Skipped"
fi

# Create SSL Certificate for Loadbalancer
show_loading "Creating SSL certificate..."
if ! gcloud compute ssl-certificates describe $SERVICE_NAME-$PROJECT_NUMBER-ssl --global > /dev/null 2>&1; then
    gcloud compute ssl-certificates create $SERVICE_NAME-$PROJECT_NUMBER-ssl \
        --description="SSL Certificate for Loadbalancer" \
        --domains=$DOMAIN_NAME \
        --global
    if [ $? -ne 0 ]; then
        print_error "$SERVICE_NAME-$PROJECT_NUMBER-ssl certificate creation" "Failed"
        exit 1
    else
        print_success "$SERVICE_NAME-$PROJECT_NUMBER-ssl certificate" "Created"
    fi
else
    print_warning "$SERVICE_NAME-$PROJECT_NUMBER-ssl certificate already exists" "Skipped"
fi


# Section 3: Setup Backend Services
# Create a serverless NEG
show_section_header "Setup Backend services..."
show_loading "Creating serverless NEG..."
if ! gcloud compute network-endpoint-groups describe $SERVICE_NAME-$PROJECT_NUMBER-neg --region=$GCP_REGION > /dev/null 2>&1; then
    gcloud compute network-endpoint-groups create $SERVICE_NAME-$PROJECT_NUMBER-neg \
        --region=$GCP_REGION \
        --network-endpoint-type=serverless  \
        --cloud-run-service=$SERVICE_NAME
    if [ $? -ne 0 ]; then
        print_error "$SERVICE_NAME-$PROJECT_NUMBER-neg NEG creation" "Failed"
        exit 1
    else
        print_success "$SERVICE_NAME-$PROJECT_NUMBER-neg NEG" "Created"
    fi
else
    print_warning "$SERVICE_NAME-$PROJECT_NUMBER-neg NEG already exists" "Skipped"
fi

# Create a backend service
show_loading "Creating a Backend Service..."
if ! gcloud compute backend-services describe $SERVICE_NAME-$PROJECT_NUMBER-bs --global > /dev/null 2>&1; then
    gcloud compute backend-services create $SERVICE_NAME-$PROJECT_NUMBER-bs \
        --load-balancing-scheme=EXTERNAL_MANAGED \
        --global
    if [ $? -ne 0 ]; then
        print_error "$SERVICE_NAME-$PROJECT_NUMBER-bs backend service creation" "Failed"
        exit 1
    else
        print_success "$SERVICE_NAME-$PROJECT_NUMBER-bs backend service" "Created"
        # Add serverless NEG to the backend service
        show_loading "Adding serverless NEG to the backend service..."
        if [[ $(gcloud compute backend-services list --filter="name:( $SERVICE_NAME-$PROJECT_NUMBER-bs )" --global) == Listed* ]] then
            gcloud compute backend-services add-backend $SERVICE_NAME-$PROJECT_NUMBER-bs \
                --global \
                --network-endpoint-group=$SERVICE_NAME-$PROJECT_NUMBER-neg \
                --network-endpoint-group-region=$GCP_REGION
            if [ $? -ne 0 ]; then
                print_error "Adding $SERVICE_NAME-$PROJECT_NUMBER-neg to backend service" "Failed"
                exit 1
            else
                print_success "Adding $SERVICE_NAME-$PROJECT_NUMBER-neg to backend service" "Success"
            fi
        else
            print_warning "$SERVICE_NAME-$PROJECT_NUMBER-neg already added" "Skipped"
        fi
    fi
else
    print_warning "$SERVICE_NAME-$PROJECT_NUMBER-bs backend service already exists" "Skipped"
fi


# Section 4: URL map
# Create a URL map to route incoming requests to the backend service
show_section_header "Setup URL map..."
show_loading "Creating default URL map..."
if ! gcloud compute url-maps describe $SERVICE_NAME-$PROJECT_NUMBER-url-map > /dev/null 2>&1; then
gcloud compute url-maps create $SERVICE_NAME-$PROJECT_NUMBER-url-map \
    --default-service $SERVICE_NAME-$PROJECT_NUMBER-bs \
    --global
    if [ $? -ne 0 ]; then
        print_error "$SERVICE_NAME-$PROJECT_NUMBER-url-map URL map creation" "Failed"
        exit 1
    else
        print_success "$SERVICE_NAME-$PROJECT_NUMBER-url-map URL map" "Created"
    fi
else
    print_warning "$SERVICE_NAME-$PROJECT_NUMBER-url-map URL map already exists" "Skipped"
fi

# Create a URL map to redirect HTTP to HTTPS
show_loading "Creating URL map for HTTP to HTTPS redirection..."
if ! gcloud compute url-maps describe http-to-https-redirect > /dev/null 2>&1; then
    gcloud compute url-maps import http-to-https-redirect \
        --source $SCRIPT_DIR/http-to-https.yaml \
        --global
    if [ $? -ne 0 ]; then
        print_error "http-to-https-redirect URL map creation" "Failed"
        exit 1
    else
        print_success "http-to-https-redirect URL map" "Created"
    fi
else
    print_warning "http-to-https-redirect URL map already exists" "Skipped"
fi


# Section 5: Target Proxy
# Create HTTP target proxy
show_section_header "Setup Target Proxy..."
show_loading "Creating HTTP target proxy..."
if ! gcloud compute target-http-proxies describe $SERVICE_NAME-$PROJECT_NUMBER-http-proxy > /dev/null 2>&1; then
    gcloud compute target-http-proxies create $SERVICE_NAME-$PROJECT_NUMBER-http-proxy \
        --url-map=http-to-https-redirect \
        --global
    if [ $? -ne 0 ]; then
        print_error "http-to-https-redirect URL map creation" "Failed"
        exit 1
    else
        print_success "http-to-https-redirect URL map" "Created"
    fi
else
    print_warning "http-to-https-redirect URL map already exists" "Skipped"
fi

# Create HTTPS target proxy
show_loading "Creating HTTPS target proxy..."
if ! gcloud compute target-https-proxies describe $SERVICE_NAME-$PROJECT_NUMBER-https-proxy > /dev/null 2>&1; then
    gcloud compute target-https-proxies create $SERVICE_NAME-$PROJECT_NUMBER-https-proxy \
        --ssl-certificates=$SERVICE_NAME-$PROJECT_NUMBER-ssl \
        --url-map=$SERVICE_NAME-$PROJECT_NUMBER-url-map \
        --global
    if [ $? -ne 0 ]; then
        print_error "http-to-https-redirect URL map creation" "Failed"
        exit 1
    else
        print_success "http-to-https-redirect URL map" "Created"
    fi
else
    print_warning "http-to-https-redirect URL map already exists" "Skipped"
fi


# Section 6: Forwarding Rules
# Create HTTP load balancer
show_section_header "Setup Forwarding Rules..."
show_loading "Creating HTTP load balancer..."
if ! gcloud compute forwarding-rules describe $SERVICE_NAME-$PROJECT_NUMBER-http-lb --global > /dev/null 2>&1; then
    gcloud compute forwarding-rules create $SERVICE_NAME-$PROJECT_NUMBER-http-lb \
        --load-balancing-scheme=EXTERNAL_MANAGED \
        --network-tier=PREMIUM \
        --address=$SERVICE_NAME-$PROJECT_NUMBER-ip \
        --target-http-proxy=$SERVICE_NAME-$PROJECT_NUMBER-http-proxy \
        --global \
        --ports=80
    if [ $? -ne 0 ]; then
        print_error "$SERVICE_NAME-$PROJECT_NUMBER-http-lb forwarding rule creation" "Failed"
        exit 1
    else
        print_success "$SERVICE_NAME-$PROJECT_NUMBER-http-lb"forwarding rule  "Created"
    fi
else
    print_warning "$SERVICE_NAME-$PROJECT_NUMBER-http-lb forwarding rule already exists" "Skipped"
fi

# Create HTTPS load balancer
show_loading "Creating HTTPS load balancer..."
if ! gcloud compute forwarding-rules describe $SERVICE_NAME-$PROJECT_NUMBER-https-lb --global  > /dev/null 2>&1; then
    gcloud compute forwarding-rules create $SERVICE_NAME-$PROJECT_NUMBER-https-lb \
        --load-balancing-scheme=EXTERNAL_MANAGED \
        --network-tier=PREMIUM \
        --address=$SERVICE_NAME-$PROJECT_NUMBER-ip \
        --target-https-proxy=$SERVICE_NAME-$PROJECT_NUMBER-https-proxy \
        --global \
        --ports=443
    if [ $? -ne 0 ]; then
        print_error "$SERVICE_NAME-$PROJECT_NUMBER-https-lb Forwarding rule creation" "Failed"
        exit 1
    else
        print_success "$SERVICE_NAME-$PROJECT_NUMBER-https-lb Forwarding rule" "Created"
    fi
else
    print_warning "$SERVICE_NAME-$PROJECT_NUMBER-https-lb Forwarding rule already exists" "Skipped"
fi


echo -e "\nGCP Load balancer setup completed.\n"