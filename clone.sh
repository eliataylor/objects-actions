#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Setting up $machinename at stackpath"

# Copy the stack directory to the machine name if it doesn't exist
rm -rf "$stackpath"

if [ ! -d "$stackpath" ]; then
    mv "$SCRIPT_DIR/stack" "$stackpath"
    echo "Copied stack to new project directory: $stackpath"
else
    echo "Project directory $stackpath already exists. Skipping copy."
fi

rm -rf "$stackpath/src/.venv" \
    && rm -rf ".github" \
    && rm -rf "$stackpath/test" \
    && rm -rf "$stackpath/cypress/node_modules" \
    && rm -rf "$stackpath/databuilder/node_modules" \
    && rm -rf "$stackpath/django/.venv" \
    && rm -rf "$stackpath/k6/results/*" \
    && rm -rf "$stackpath/reactjs/node_modules" \
    && rm -rf "$stackpath/cypress/node_modules" \
    && rm -rf "$stackpath/cypress/cypress/fixtures/*" \
    && rm -rf "$stackpath/cypress/cypress/downloads/*" \
    && rm -rf "$stackpath/cypress/cypress/screenshots/*" \
    && rm -rf "$stackpath/cypress/cypress/videos/*" \
    && rm -rf "$stackpath/cypress/cypress/e2e/examples" \
    && rm -rf "$stackpath/databuilder/node_modules" \
    && rm -rf "$stackpath/django/.venv" \
    && rm -rf "$stackpath/django/media/uploads" \
    && rm -rf "$stackpath/django/newproject_app/migrations/*" \
    && rm -rf "$stackpath/k6/results/*" \
    && rm -rf "$stackpath/reactjs/node_modules" \

if [ -d "$stackpath/django/oaexample_app" ]; then

    export LC_ALL=C # avoids issues with non-UTF-8 characters
    echo "String replacing 'oaexample' with $machinename"

    # Recursively replace "" with "$machinename" in all files (case-insensitive)
    find $stackpath -type f -exec sed -i '' -e "s/oaexample/$machinename/Ig" {} +

    # Rename directories containing "" to "$machinename" recursively
    find "$machinename" -depth -name "*oaexample*" | while read -r dir; do
        newdir=$(echo "$dir" | LC_ALL=C sed "s/oaexample/$machinename/I")
        mv "$dir" "$newdir"
    done


else
    echo "No oaexample directory found so skipping sed"
fi

echo "SCRIPT_DIR:"
ls -lsat $SCRIPT_DIR
echo "STACK_PATH:"
ls -lsat $stackpath

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


echo "Pip installing Django dependencies in $stackpath/django"
cd "$stackpath/django"
ls -lsat
if [ ! -d .venv ]; then
    python -m venv .venv
    echo "Created new virtual environment."
else
    rm -rf .venv
    python -m venv .venv
    echo "Virtual environment already exists."
fi
source .venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "Pip installing Generator dependencies in $SCRIPT_DIR/src"
cd "$stackpath/src"
ls -lsat

if [ ! -d .venv ]; then
    python -m venv .venv
    echo "Created new virtual environment."
else
    rm -rf .venv
    python -m venv .venv
    echo "Virtual environment already exists."
fi
source .venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt


echo "Touching $stackpath/setup_complete"
touch $stackpath/setup_complete
