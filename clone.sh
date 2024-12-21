#!/bin/bash
source "$(dirname "$0")/docs/common.sh"

API_HOST_PROTOCOL=$(echo "$REACT_APP_API_HOST" | sed -E 's|^(https?)://.*|\1|')
API_HOST_DOMAIN=$(echo "$REACT_APP_API_HOST" | sed -E 's|^[^/]*//([^:/]*).*|\1|')
API_HOST_PORT=$(echo "$REACT_APP_API_HOST" | sed -E 's|.*:([0-9]+)$|\1|')

APP_HOST_PROTOCOL=$(echo "$REACT_APP_APP_HOST" | sed -E 's|^(https?)://.*|\1|')
APP_HOST_DOMAIN=$(echo "$REACT_APP_APP_HOST" | sed -E 's|^[^/]*//([^:/]*).*|\1|')
APP_HOST_PORT=$(echo "$REACT_APP_APP_HOST" | sed -E 's|.*:([0-9]+)$|\1|')

# String replacements
REPLACEMENTS=(
  "https://localapi.oaexample.com:8080|$REACT_APP_API_HOST"
  "https://localhost.oaexample.com:3000|$REACT_APP_APP_HOST"
  "localhost.oaexample.com|$APP_HOST_DOMAIN"
  "3000|$APP_HOST_PORT"
  "8080|$API_HOST_PORT"
  "info@oaexample.com|$REACT_APP_LOGIN_EMAIL"
  "APasswordYouShouldChange|$REACT_APP_LOGIN_PASS"
  "oaexample|$MACHINE_NAME"
)

echo "Setting up $MACHINE_NAME at stackpath"

# Directories to loop through
STACK_DIRS=("cypress" "databuilder" "django" "k6" "reactjs")

mkdir -p "$STACK_PATH/stack"

# Copy directories into stack folder and clean generated files
for dir in "${STACK_DIRS[@]}"; do
    if [ -d "$SCRIPT_DIR/stack/$dir" ]; then
        cp -R "$SCRIPT_DIR/stack/$dir" "$STACK_PATH/stack/$dir"
        echo "Copied $dir to $STACK_PATH/stack/$dir"

        # Remove generated files
        case "$dir" in
            "cypress")
                rm -rf "$STACK_PATH/stack/cypress/node_modules" \
                       "$STACK_PATH/stack/cypress/cypress/fixtures/*" \
                       "$STACK_PATH/stack/cypress/cypress/downloads/*" \
                       "$STACK_PATH/stack/cypress/cypress/screenshots/*" \
                       "$STACK_PATH/stack/cypress/cypress/videos/*" \
                       "$STACK_PATH/stack/cypress/cypress/e2e/examples"
                ;;
            "databuilder")
                rm -rf "$STACK_PATH/stack/databuilder/node_modules"
                ;;
            "django")
                rm -rf "$STACK_PATH/stack/django/.venv" \
                       "$STACK_PATH/stack/django/media/uploads" \
                       "$STACK_PATH/stack/django/oaexample_app/migrations/*"
                ;;
            "k6")
                rm -rf "$STACK_PATH/stack/k6/results/*"
                ;;
            "reactjs")
                rm -rf "$STACK_PATH/stack/reactjs/node_modules"
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

if [ -f "$ENV_FILE" ]; then
    cp $ENV_FILE "$STACK_PATH/.env"
    echo "Copied Env to $STACK_PATH/.env"
else
    echo "No ENV FILE: $ENV_FILE"
fi

export LC_ALL=C # Avoid issues with non-UTF-8 characters

for replacement in "${REPLACEMENTS[@]}"; do
    IFS="|" read -r find replace <<< "$replacement"
    echo "Replacing $find with $replace in $STACK_PATH"
    find "$STACK_PATH" -type f | while read -r file; do
        awk -v find="$find" -v replace="$replace" '{gsub(find, replace)} 1' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    done

done

# Display results
echo "SCRIPT_DIR:"
ls -lsat $SCRIPT_DIR
echo "STACK_PATH:"
ls -lsat $STACK_PATH

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

# Django dependencies
cd "$STACK_PATH/stack/django"
if [ ! -d .venv ]; then
    python -m venv .venv
    echo "Created new virtual environment."
else
    rm -rf .venv
    python -m venv .venv
    echo "Recreated virtual environment."
fi
source .venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Generator dependencies
cd "$STACK_PATH/src"
if [ ! -d .venv ]; then
    python -m venv .venv
    echo "Created new virtual environment."
else
    rm -rf .venv
    python -m venv .venv
    echo "Recreated virtual environment."
fi
source .venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "Your new stack is available at $STACK_PATH"

. "$SCRIPT_DIR/load-sheets.sh" --env "$ENV_FILE"
