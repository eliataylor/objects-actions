#!/bin/bash

projectname=${1:-test}

# Convert projectname to alphanumeric, lowercase, and replace spaces with hyphens
machinename=$(echo "$projectname" | tr -cs '[:alnum:]' '-' | tr '[:upper:]' '[:lower:]')

# Default to "test" if machinename is empty
if [ -z "$machinename" ]; then
    machinename="test"
fi

# Copy the stack directory to the machine name
cp -R stack "$machinename"

projectpath=$(realpath "$machinename")

# Recursively replace "oaexample" with "$machinename" in all files (case-insensitive)
find "$projectpath" -type f -exec sed -i '' "s/oaexample/$machinename/Ig" {} +

# Rename directories containing "oaexample" to "$machinename" recursively
find "$projectpath" -depth -name "*oaexample*" | while read -r dir; do
    newdir=$(echo "$dir" | sed "s/oaexample/$machinename/I")
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


cd src
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run the Python scripts to generate files
python generate.py admin --types="$projectpath/democrasee-objects.csv" --output_dir="$projectpath/django/${machinename}_app"

python generate.py typescript --types="$projectpath/democrasee-objects.csv" --output_dir="$projectpath/reactjs/src/object-actions/types/types.tsx"
python generate.py typescript --types="$projectpath/democrasee-objects.csv" --output_dir="$projectpath/databuilder/src/types.ts"

# Django setup
cd "$projectpath/django"
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate --run-syncdb
python manage.py createsuperuser
python manage.py runserver_plus "localapi.$machinename.com:8080" --cert-file "$ssl_cert_path"

# ReactJS setup
cd "$projectpath/reactjs"
npm install
npm run start-ssl

# Databuilder setup
cd "$projectpath/databuilder"
npm install
