# Parse and export given .env file
parse_and_export_env() {
  local FILE="$1"
  if [ -f "$FILE" ]; then
    # Remove entire lines that are comments
    env_content=$(grep -vE '^\s*#' "$FILE")

    # Strip inline comments
    env_content=$(echo "$env_content" | sed 's/[[:space:]]*#.*//')

    # Remove any 'export ' prefix
    env_content=$(echo "$env_content" | sed 's/^export //')

    # Export the variables
    export $(echo "$env_content" | xargs)
  else
    echo "$FILE not found. Skipping."
  fi
}

# Function to print error message
print_error() {
    local item="$1"    # Item name, e.g., API name
    local status="$2"  # Status message, e.g., "Enable fail."

    # Print formatted error message
    printf "\033[31m%-5s\033[0m %-60s %-20s\n" "[Error]" "$item" "$status"
}

# Function to print success message
print_success() {
    local item="$1"    # Item name, e.g., API name
    local status="$2"  # Status message, e.g., "Enable success"

    # Print formatted success message
    printf "\033[32m%-5s\033[0m %-60s %-20s\n" "[Success]" "$item" "$status"
}

# Function to print warning message
print_warning() {
    local item="$1"    # Item name, e.g., API name
    local status="$2"  # Status message, e.g., "Skipped"

    # Print formatted success message
    printf "\033[33m%-5s\033[0m %-60s %-20s\n" "[Warning]" "$item" "$status"
}

# Function to show section header
show_section_header() {
    local section_name="$1"  # Section name

    # Print section header
    printf "\n\033[1m%s\033[0m\n" "$section_name"
    echo "--------------------------------------------"
}

# Function to show loading indicator
show_loading() {
    local task="$1"    # Task description

    # Print formatted loading message
    echo -n "➤ $task... "
    printf "\033[34m[Loading]\033[0m"
    echo -ne "\033[0m "
}

# Function to import secret to Secret Manager
import_secret_env() {
  local file_path="$1"

  if [[ ! -f "$file_path" ]]; then
    echo "File not found: $file_path"
    return 1
  fi

  while IFS='=' read -r key value; do
    if [[ -n "$key" && -n "$value" ]]; then
        if ! gcloud secrets describe $key > /dev/null 2>&1; then
            echo -n "$value" | gcloud secrets create "$key" \
                --replication-policy="automatic" \
                --data-file=-
            if [ $? -ne 0 ]; then
                print_error "Secret '$key' creation." "Failed"
            else
                print_success "Secret '$key' creation." "Success"
            fi
        else
            print_warning "'$key' secret already exists" "Skipped"
        fi
    else
      print_error "Invalid line: $key=$value" "Skipping"
    fi
  done < <(cat "$file_path"; echo)
}

# Function to create secret in Secret Manager
create_secret() {
    local key="$1"
    local value="$2"

    show_loading "Processing secret for $key..."
    if ! gcloud secrets describe "$key" > /dev/null 2>&1; then
        # Create the secret if it does not exist
        echo -n "$value" | gcloud secrets create "$key" \
            --replication-policy="automatic" \
            --data-file=-
        if [ $? -ne 0 ]; then
            print_error "$key secret creation" "Failed"
        else
            print_success "$key secret" "Created"
        fi
    else
        # Update the secret by adding a new version
        echo -n "$value" | gcloud secrets versions add "$key" --data-file=-
        if [ $? -ne 0 ]; then
            print_error "$key secret update" "Failed"
        else
            print_success "$key secret" "Updated"

            # Get the latest version (last added)
            local current_version
            current_version=$(gcloud secrets versions list "$key" --sort-by="~createTime" --limit=1 --format="value(name)")

            if [[ -n "$current_version" ]]; then
                # Disable all versions first
                gcloud secrets versions list "$key" --format="value(name)" | while read -r version; do
                    if [[ "$version" != "$current_version" ]]; then
                        gcloud secrets versions disable "$key" --version="$version" > /dev/null 2>&1
                    fi
                done

                # Enable only the current version
                gcloud secrets versions enable "$key" --version="$current_version" > /dev/null 2>&1
                if [ $? -eq 0 ]; then
                    print_success "$key secret" "New version activated and others disabled"
                else
                    print_error "$key secret activation" "Failed to enable the new version"
                fi
            else
                print_error "$key secret version retrieval" "Failed to retrieve the latest version"
            fi
        fi
    fi
}

set_project() {
  show_loading "Setting GCP Project..."
  local key="$1" # $GCP_PROJECT_ID
  gcloud config set project $key
  if [ $? -ne 0 ]; then
      print_error "Setting GCP Project" "Failed"
      exit 1
  else
      print_success "Setting GCP Project" "Success"
  fi
}

login_owner() {
  show_section_header "Setting up gcloud CLI permissions using your Owner account..."

  CURRENT_USER=$(gcloud config get-value account)
  local REQUIRED_ROLE="$1" # "roles/owner"
  local GCP_PROJECT_ID="$2"

  show_loading "Checking if the user has the required role $REQUIRED_ROLE"
  ROLE_EXISTS=$(gcloud projects get-iam-policy $GCP_PROJECT_ID --format=json | jq -e --arg role "$REQUIRED_ROLE" --arg user "$CURRENT_USER" '
      .bindings[] | select(.role == $role) | .members[] | select(. == "user:" + $user)
  ' > /dev/null 2>&1)

  if [ $? -ne 0 ]; then
      print_warning "The current user does not have the required role. Please login."
      gcloud auth login
      if [ $? -ne 0 ]; then
        print_error "Configure gcloud CLI with Service Account" "Failed"
        exit 1
      fi

  else
      print_success "The current user has the required role $REQUIRED_ROLE."
  fi

}

login_service_account() {
  show_section_header "Setting up gcloud CLI permissions using Service Account..."
  show_loading "Configuring gcloud CLI with Service Account"

  local GCP_SA_KEY_PATH="$1"
  local GCP_PROJECT_ID="$2"
  local GCP_SERVICE_NAME="$3"

  # gcloud auth login --cred-file="$PARENT_DIR/keys/djremoter.json"

  gcloud auth activate-service-account --key-file=$GCP_SA_KEY_PATH
  # gcloud auth activate-service-account $GCP_SERVICE_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com --key-file=$GCP_SA_KEY_PATH --project=$GCP_PROJECT_ID

  if [ $? -ne 0 ]; then
      print_error "Configure gcloud CLI with Service Account" "Failed"
      exit 1
  fi
  print_success "Configure gcloud CLI with Service Account" "Success"
}



# Function to sanitize bucket name
sanitize_bucket_name() {
  local name="$1"
  # Convert to lowercase
  name=$(echo "$name" | tr '[:upper:]' '[:lower:]')
  # Replace underscores with dashes
  name=$(echo "$name" | tr '_' '-')
  # Remove characters not allowed
  name=$(echo "$name" | sed -e 's/[^a-z0-9-]//g')
  # Trim to 63 characters max (to comply with bucket name length limit)
  name=$(echo "$name" | cut -c 1-63)
  echo "$name"
}
