#!/bin/bash
source "$(dirname "$0")/builder/environment/common.sh"

# Extract host components
API_HOST_PROTOCOL=$(echo "$REACT_APP_API_HOST" | sed -E 's|^(https?)://.*|\1|')
API_HOST_DOMAIN=$(echo "$REACT_APP_API_HOST" | sed -E 's|^[^/]*//([^:/]*).*|\1|')
API_HOST_PORT=$(echo "$REACT_APP_API_HOST" | sed -E 's|.*:([0-9]+)$|\1|')

APP_HOST_PROTOCOL=$(echo "$REACT_APP_APP_HOST" | sed -E 's|^(https?)://.*|\1|')
APP_HOST_DOMAIN=$(echo "$REACT_APP_APP_HOST" | sed -E 's|^[^/]*//([^:/]*).*|\1|')
APP_HOST_PORT=$(echo "$REACT_APP_APP_HOST" | sed -E 's|.*:([0-9]+)$|\1|')

# Exclusion patterns for rsync
EXCLUDE_PATTERNS=(
  "node_modules"
  "data"
  ".idea"
  ".venv"
  ".log"
  ".git*"
  ".DS_Store"
  "vendor"
  "build"
  "*.bak"
  "uploads"
  "*.pyc"
)

# Build exclusion arguments for rsync
EXCLUDE_ARGS=()
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_ARGS+=(--exclude="$pattern")
done

# String replacements (processed in order)
REPLACEMENTS=(
  "https://localapi.oaexample.com:8080|$REACT_APP_API_HOST"
  "https://localhost.oaexample.com:3000|$REACT_APP_APP_HOST"
  "https://oaexample.com|$REACT_APP_APP_HOST"
  "localhost.oaexample.com|$APP_HOST_DOMAIN"
  "localapi.oaexample.com|$API_HOST_DOMAIN"
  "api.oaexample.com|$API_HOST_DOMAIN"
  "oaexample.com|$APP_HOST_DOMAIN"
  "3000|$APP_HOST_PORT"
  "8080|$API_HOST_PORT"
  "info@oaexample.com|$REACT_APP_LOGIN_EMAIL"
  "APasswordYouShouldChange|$REACT_APP_LOGIN_PASS"
  "OAExample|$MACHINE_NAME"
  "OAexample|$MACHINE_NAME"
  "Oaexample|$MACHINE_NAME"
  "oaexample|$MACHINE_NAME"
)

echo "Setting up $MACHINE_NAME at stackpath"

# Copy stack Builder
rsync -av "${EXCLUDE_ARGS[@]}" "$SCRIPT_DIR/builder" "$STACK_PATH/builder"

# Directories to loop through
STACK_DIRS=("cypress" "databuilder" "django" "k6" "reactjs")

mkdir -p "$STACK_PATH/stack"

# Copy directories into stack folder and clean generated files
for dir in "${STACK_DIRS[@]}"; do
    if [ -d "$SCRIPT_DIR/stack/$dir" ]; then
        rsync -av "${EXCLUDE_ARGS[@]}" "$SCRIPT_DIR/stack/$dir/" "$STACK_PATH/stack/$dir/"
        echo "Copied $dir to $STACK_PATH/stack/$dir"

        # Remove generated files
        case "$dir" in
            "cypress")
                rm -rf "$STACK_PATH/stack/cypress/node_modules"
                rm -rf "$STACK_PATH/stack/cypress/cypress/fixtures"/*
                rm -rf "$STACK_PATH/stack/cypress/cypress/downloads"/*
                rm -rf "$STACK_PATH/stack/cypress/cypress/screenshots"/*
                rm -rf "$STACK_PATH/stack/cypress/cypress/videos"/*
                rm -rf "$STACK_PATH/stack/cypress/cypress/e2e/examples"
                echo "Deleted generated files in $dir"
                ;;
            "databuilder")
                rm -rf "$STACK_PATH/stack/databuilder/node_modules"
                echo "Deleted generated files in $dir"
                ;;
            "django")
                rm -rf "$STACK_PATH/stack/django/.venv"
                rm -rf "$STACK_PATH/stack/django/media/uploads"
                rm -rf "$STACK_PATH/stack/django/oaexample_app/migrations"/*
                echo "Deleted generated files in $dir"
                ;;
            "k6")
                rm -rf "$STACK_PATH/stack/k6/test-results"/*
                echo "Deleted generated files in $dir"
                ;;
            "reactjs")
                rm -rf "$STACK_PATH/stack/reactjs/node_modules"
                echo "Deleted generated files in $dir"
                ;;
        esac
    else
        echo "Warning: Directory $SCRIPT_DIR/stack/$dir does not exist. Skipping."
    fi
done

# Rename directories in stack/django/ if they include 'oaexample'
for dir in "$STACK_PATH/stack/django"/*; do
    if [[ "$dir" == *"oaexample"* ]]; then
        new_dir=$(echo "$dir" | sed "s/oaexample/$MACHINE_NAME/g")
        mv "$dir" "$new_dir"
        echo "Renamed $dir to $new_dir"
    fi
done



# Copy docker-compose.yml to $STACK_PATH
if [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    cp "$SCRIPT_DIR/docker-compose.yml" "$STACK_PATH/docker-compose.yml"
    echo "Copied docker-compose.yml to $STACK_PATH"
else
    echo "Error: docker-compose.yml not found in $SCRIPT_DIR"
fi

# Copy environment file
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$STACK_PATH/.env"
    echo "Copied environment file to $STACK_PATH/.env"
else
    echo "No environment file found: $ENV_FILE"
fi

# SSL certificate creation
ssl_cert_path="$HOME/.ssl/certificate.crt"
if [ ! -f "$ssl_cert_path" ]; then
    echo "SSL certificate not found. Creating one at: $ssl_cert_path"
    mkdir -p "$HOME/.ssl"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$HOME/.ssl/certificate.key" \
        -out "$ssl_cert_path" \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"
fi

export LC_ALL=C # Avoid issues with non-UTF-8 characters

echo "Performing string replacements in $STACK_PATH"

for replacement in "${REPLACEMENTS[@]}"; do
    IFS="|" read -r find replace <<< "$replacement"
    echo "  Replacing '$find' with '$replace'"

    # Use -l to list files with matches, then process them
    grep -rl "$find" "$STACK_PATH" 2>/dev/null | while read -r file; do
        # Handle sed -i correctly for macOS vs Linux
        if [[ "$(uname -s)" == "Darwin" ]]; then
            if sed -i '' "s|$find|$replace|g" "$file" 2>/dev/null; then
                echo "    Updated: $file"
            fi
        else
            if sed -i "s|$find|$replace|g" "$file" 2>/dev/null; then
                echo "    Updated: $file"
            fi
        fi
    done
done

cp "$SCRIPT_DIR/load-sheets.sh" "$STACK_PATH/load-sheets.sh"

echo "Your new stack is available at $STACK_PATH"

cd "$STACK_PATH"

. "$STACK_PATH/load-sheets.sh" --env "$ENV_FILE"
