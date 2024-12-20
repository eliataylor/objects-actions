#!/bin/bash
source "$(dirname "$0")/docs/common.sh"

echo "Setting up $MACHINE_NAME at stackpath"

# Copy the stack directory to the machine name if it doesn't exist

if [ ! -d "$STACK_PATH" ]; then
    cp -R "$SCRIPT_DIR/stack" "$STACK_PATH"
    echo "Copied stack to new project directory: $STACK_PATH"
else
    echo "Resetting existing directory $STACK_PATH "
fi

rm -rf "$STACK_PATH/src/.venv" \
    && rm -rf ".github" \
    && rm -rf "$STACK_PATH/test" \
    && rm -rf "$STACK_PATH/cypress/node_modules" \
    && rm -rf "$STACK_PATH/databuilder/node_modules" \
    && rm -rf "$STACK_PATH/django/.venv" \
    && rm -rf "$STACK_PATH/k6/results/*" \
    && rm -rf "$STACK_PATH/reactjs/node_modules" \
    && rm -rf "$STACK_PATH/cypress/node_modules" \
    && rm -rf "$STACK_PATH/cypress/cypress/fixtures/*" \
    && rm -rf "$STACK_PATH/cypress/cypress/downloads/*" \
    && rm -rf "$STACK_PATH/cypress/cypress/screenshots/*" \
    && rm -rf "$STACK_PATH/cypress/cypress/videos/*" \
    && rm -rf "$STACK_PATH/cypress/cypress/e2e/examples" \
    && rm -rf "$STACK_PATH/databuilder/node_modules" \
    && rm -rf "$STACK_PATH/django/.venv" \
    && rm -rf "$STACK_PATH/django/media/uploads" \
    && rm -rf "$STACK_PATH/django/newproject_app/migrations/*" \
    && rm -rf "$STACK_PATH/k6/results/*" \
    && rm -rf "$STACK_PATH/reactjs/node_modules" \

if [ -d "$STACK_PATH/django/oaexample_app" ]; then

    export LC_ALL=C # avoids issues with non-UTF-8 characters
    echo "String replacing 'oaexample' with $MACHINE_NAME"

    # Recursively replace "" with "$MACHINE_NAME" in all files (case-insensitive)
    find $STACK_PATH -type f -exec sed -i '' -e "s/oaexample/$MACHINE_NAME/Ig" {} +

    # Rename directories containing "" to "$MACHINE_NAME" recursively
    find "$MACHINE_NAME" -depth -name "*oaexample*" | while read -r dir; do
        newdir=$(echo "$dir" | LC_ALL=C sed "s/oaexample/$MACHINE_NAME/I")
        mv "$dir" "$newdir"
    done


else
    echo "No oaexample directory found so skipping sed"
fi

echo "SCRIPT_DIR:"
ls -lsat $SCRIPT_DIR
echo "STACK_PATH:"
ls -lsat $STACK_PATH

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


echo "Pip installing Django dependencies in $STACK_PATH/django"
cd "$STACK_PATH/django"
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

echo "Pip installing Generator dependencies in $STACK_PATH/src"
cd "$STACK_PATH/src"
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


echo "Your new stack is available at $STACK_PATH"
