#!/bin/bash

projectname=${1:-test}
csvpath=${2:-examples/democrasee-objects.csv}

# Convert projectname to alphanumeric, lowercase, and replace spaces with hyphens
machinename=$(echo "$projectname" | tr '[:upper:]' '[:lower:]' | sed 's/[^[:alnum:]]\+/-/g' | sed 's/^\-\|\-$//g')

# Default to "test" if machinename is empty
if [ -z "$machinename" ]; then
    machinename="test"
fi

# Copy the stack directory to the machine name if it doesn't exist
if [ ! -d "$machinename" ]; then
    cp -R stack "$machinename"
    echo "Copied stack to new project directory: $machinename"
else
    echo "Project directory $machinename already exists. Skipping copy."
fi

projectpath=$(realpath "$machinename")

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
python -m generate django --types="$csvpath" --output_dir="$projectpath/django/${machinename}_app"

python -m generate typescript --types="$csvpath" --output_dir="$projectpath/reactjs/src/object-actions/types/types.tsx"
python -m generate typescript --types="$csvpath" --output_dir="$projectpath/databuilder/src/types.ts"
