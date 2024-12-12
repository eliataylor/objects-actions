#!/bin/bash

# Please make sure you have enable billing for your project
# Please make sure you enable Service Usage API https://console.cloud.google.com/project/_/apis/library/serviceusage.googleapis.com
# Before running this script

REQUIRED_VARS=("GCP_PROJECT_ID" "MYSQL_PASSWORD" "MYSQL_DATABASE" "MYSQL_USER" "MYSQL_HOST" "GCP_MYSQL_INSTANCE" "GCP_MYSQL_ZONE")

show_section_header "CREATE CLOUD SQL"

source "./common.sh"

login_owner "roles/owner"

show_loading "Checking if SQL instance $GCP_MYSQL_INSTANCE... exists on $GCP_MYSQL_PROJECT_ID"

if gcloud sql instances describe $GCP_MYSQL_INSTANCE --project=$GCP_MYSQL_PROJECT_ID --format="json(name)" > /dev/null 2>&1; then
    print_success "\nSQL instance $GCP_MYSQL_INSTANCE exists in project GCP_MYSQL_PROJECT_ID"
  else
    show_section_header "Creating Cloud SQL for MySQL instance $GCP_MYSQL_INSTANCE..."
    gcloud sql instances create $GCP_MYSQL_INSTANCE \
        --database-version=MYSQL_8_0 \
        --tier=db-f1-micro \
        --region=$MYSQL_REGION \
        --availability-type=ZONAL

    print_warning "UPDATE YOUR ENV: GCP_MYSQL_PROJECT_ID=$GCP_PROJECT_ID"
    GCP_MYSQL_PROJECT_ID=$GCP_PROJECT_ID

    if [ $? -ne 0 ]; then
        print_error "mysql $GCP_MYSQL_INSTANCE instance creation" "Failed"
    else
        print_success "mysql $GCP_MYSQL_INSTANCE instance" "Created"
    fi
fi

show_loading "Creating MySQL database..."
if ! gcloud sql databases describe $MYSQL_DATABASE --instance=$GCP_MYSQL_INSTANCE > /dev/null 2>&1; then
    gcloud sql databases create $MYSQL_DATABASE \
        --instance=$GCP_MYSQL_INSTANCE
    if [ $? -ne 0 ]; then
        print_error "$MYSQL_DATABASE database creation" "Failed"
    else
        # Set root password
        show_loading "Creating root password..."
        gcloud sql users set-password root \
            --host=% \
            --instance=$GCP_MYSQL_INSTANCE \
            --password=$MYSQL_ROOT_PASSWORD
        if [ $? -ne 0 ]; then
            print_error "$GCP_MYSQL_INSTANCE set root password" "Failed"
        else
            print_success "$GCP_MYSQL_INSTANCE set root password" "Success"
        fi
    fi
else
    print_warning "$MYSQL_DATABASE database already exists" "Skipped"
fi

# Setup MySQL user
show_loading "Creating MySQL user..."
if gcloud sql databases describe $MYSQL_DATABASE --instance=$GCP_MYSQL_INSTANCE && ! gcloud sql users describe $MYSQL_USER --instance=$GCP_MYSQL_INSTANCE > /dev/null 2>&1; then
    gcloud sql users create $MYSQL_USER \
        --host=% \
        --instance=$GCP_MYSQL_INSTANCE \
        --password=$MYSQL_PASSWORD
    if [ $? -ne 0 ]; then
        print_error "MySQL User creation" "Failed"
    else
        print_success "MySQL User creation" "Success"
    fi
else
    print_warning "MySQL User already exists" "Skipped"
fi
