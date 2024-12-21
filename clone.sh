#!/bin/bash
source "$(dirname "$0")/docs/common.sh"

echo "Setting up $MACHINE_NAME at stackpath"

# Directories to loop through
STACK_DIRS=("cypress" "databuilder" "django" "k6" "reactjs")

# Copy directories and clean generated files
for dir in "${STACK_DIRS[@]}"; do
    if [ -d "$SCRIPT_DIR/stack/$dir" ]; then
        cp -R "$SCRIPT_DIR/stack/$dir" "$STACK_PATH/$dir"
        echo "Copied $dir to $STACK_PATH/$dir"

        # Remove generated files
        case "$dir" in
            "cypress")
                rm -rf "$STACK_PATH/cypress/node_modules" \
                       "$STACK_PATH/cypress/cypress/fixtures/*" \
                       "$STACK_PATH/cypress/cypress/downloads/*" \
                       "$STACK_PATH/cypress/cypress/screenshots/*" \
                       "$STACK_PATH/cypress/cypress/videos/*" \
                       "$STACK_PATH/cypress/cypress/e2e/examples"
                ;;
            "databuilder")
                rm -rf "$STACK_PATH/databuilder/node_modules"
                ;;
            "django")
                rm -rf "$STACK_PATH/django/.venv" \
                       "$STACK_PATH/django/media/uploads" \
                       "$STACK_PATH/django/newproject_app/migrations/*"
                ;;
            "k6")
                rm -rf "$STACK_PATH/k6/results/*"
                ;;
            "reactjs")
                rm -rf "$STACK_PATH/reactjs/node_modules"
                ;;
        esac
    else
        echo "Warning: Directory $SCRIPT_DIR/stack/$dir does not exist. Skipping."
    fi
done

# String replacements
REPLACEMENTS=(
  "https://localapi.oaexample.com:8080:$REACT_APP_API_HOST"
  "https://localhost.oaexample.com:3000:$REACT_APP_APP_HOST"
  "info@oaexample.com:$REACT_APP_LOGIN_EMAIL"
  "APasswordYouShouldChange:$REACT_APP_LOGIN_PASS"
  "oaexample:$PROJECT_NAME"
)

# Rename directories in stack/django/ if they include 'oaexample'
for dir in "$STACK_PATH/django"/*; do
    if [[ "$dir" == *"oaexample"* ]]; then
        new_dir=$(echo "$dir" | sed "s/oaexample/$PROJECT_NAME/g")
        mv "$dir" "$new_dir"
        echo "Renamed $dir to $new_dir"
    fi
done

export LC_ALL=C # Avoid issues with non-UTF-8 characters

for replacement in "${REPLACEMENTS[@]}"; do
    IFS=":" read -r find replace <<< "$replacement"
    echo "Replacing $find with $replace in $STACK_PATH"
    find "$STACK_PATH" -type f -exec sed -i '' -e "s|$find|$replace|g" {} +
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
cd "$STACK_PATH/django"
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
