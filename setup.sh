#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Setting up $machinename at $projectpath"

# Copy the stack directory to the machine name if it doesn't exist

if [ ! -d "$stackpath" ]; then
    cp -R stack "$stackpath"
    rm -rf "$stackpath/cypress/node_modules"
    rm -rf "$stackpath/cypress/cypress/fixtures/*"
    rm -rf "$stackpath/cypress/cypress/downloads/*"
    rm -rf "$stackpath/cypress/cypress/screenshots/*"
    rm -rf "$stackpath/cypress/cypress/videos/*"
    rm -rf "$stackpath/cypress/cypress/e2e/examples"
    rm -rf "$stackpath/databuilder/node_modules"
    rm -rf "$stackpath/django/.venv"
    rm -rf "$stackpath/django/media/uploads"
    rm -rf "$stackpath/django/$machinename_app/migrations/*"
    rm -rf "$stackpath/reactjs/node_modules"
    echo "Copied stack to new project directory: $stackpath"
else
    echo "Project directory $stackpath already exists. Skipping copy."
fi

export LC_ALL=C # avoids issues with non-UTF-8 characters
echo "String replacing '' with $machinename"

# Recursively replace "" with "$machinename" in all files (case-insensitive)
find $stackpath -type f -exec sed -i '' -e "s//$machinename/Ig" {} +

# Rename directories containing "" to "$machinename" recursively
find "$machinename" -depth -name "**" | while read -r dir; do
    newdir=$(echo "$dir" | LC_ALL=C sed "s//$machinename/I")
    mv "$dir" "$newdir"
done

# Ensure the SSL certificate exists or create one
ssl_cert_path="$HOME/.ssl/certificate.crt"
if [ ! -f "$ssl_cert_path" ]; then
    echo "SSL certificate not found. Creating one at: $ssl_cert_path"
    mkdir -p "$HOME/.ssl"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$HOME/.ssl/certificate.key" \
        -out "$ssl_cert_path" \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"
fi

# Navigate to src and set up the virtual environment if it doesn't exist
echo "Pip installing Django dependencies in $SCRIPT_DIR/src"
ls -lsat
cd "$SCRIPT_DIR/src"

if [ ! -d .venv ]; then
    python -m venv .venv
    echo "Created new virtual environment."
else
    echo "Virtual environment already exists."
fi
source .venv/bin/activate
pip install -r requirements.txt


echo "Touching setup_complete"
touch $stackpath/setup_complete
