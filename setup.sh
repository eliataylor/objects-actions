#!/bin/bash
source "$(dirname "$0")/common.sh"

# Copy the stack directory to the machine name if it doesn't exist
if [ ! -d "$machinename" ]; then
    cp -R stack "$machinename"
    rm -rf "$machinename/cypress/node_modules"
    rm -rf "$machinename/cypress/cypress/fixtures/*"
    rm -rf "$machinename/cypress/cypress/downloads/*"
    rm -rf "$machinename/cypress/cypress/screenshots/*"
    rm -rf "$machinename/cypress/cypress/videos/*"
    rm -rf "$machinename/cypress/cypress/e2e/examples"
    rm -rf "$machinename/databuilder/node_modules"
    rm -rf "$machinename/django/.venv"
    rm -rf "$machinename/django/media/uploads"
    rm -rf "$machinename/django/$machinename_app/migrations/*"
    rm -rf "$machinename/k6/results/*"
    rm -rf "$machinename/reactjs/node_modules"
    echo "Copied stack to new project directory: $machinename"
else
    echo "Project directory $machinename already exists. Skipping copy."
fi

export LC_ALL=C # avoids issues with non-UTF-8 characters
echo "String replacing 'oaexample' with $machinename"

# Recursively replace "oaexample" with "$machinename" in all files (case-insensitive)
find $projectpath -type f -exec sed -i '' -e "s/oaexample/$machinename/Ig" {} +

# Rename directories containing "oaexample" to "$machinename" recursively
find "$machinename" -depth -name "*oaexample*" | while read -r dir; do
    newdir=$(echo "$dir" | LC_ALL=C sed "s/oaexample/$machinename/I")
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
cd src

if [ ! -d .venv ]; then
    python -m venv .venv
    echo "Created new virtual environment."
else
    echo "Virtual environment already exists."
fi
source .venv/bin/activate
pip install -r requirements.txt

# Run the Python scripts to generate files
python -m generate django --types="$csvpath" --matrix="$permissionspath" --output_dir="$projectpath/django/${machinename}_app"

python -m generate typescript --types="$csvpath" --matrix="$permissionspath" --output_dir="$projectpath/reactjs/src/object-actions/types/"
python -m generate typescript --types="$csvpath" --matrix="$permissionspath" --output_dir="$projectpath/databuilder/src/"
python -m generate typescript --types="$csvpath" --matrix="$permissionspath" --output_dir="$projectpath/cypress/cypress/support/"
python -m generate typescript --types="$csvpath" --matrix="$permissionspath" --output_dir="$projectpath/k6/"
