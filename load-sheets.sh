#!/bin/bash

# Example:
# ./load-sheets.sh --env .env
# OR
# ./load-sheets.sh --project "oaexample" --types "stack/objects.csv" --permissions "stack/permissions.csv"

source "$(pwd)/docs/common.sh"

cd "$SCRIPT_DIR/src"

if [ ! -d .venv ]; then
    python -m venv .venv
    echo "First run. Creating new virtual environment."
    source .venv/bin/activate
    pip install --upgrade pip setuptools wheel
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

# Ensure csvpath is a valid file path
if [[ ! -f "$TYPES_PATH" ]]; then
    echo "Error: $TYPES_PATH is not a valid file path." >&2
    exit 1
fi

# Check if permissionspath is a valid file path
permissions_arg=""
if [[ -f "$PERMISSIONS_PATH" ]]; then
    permissions_arg="--permissions=\"$PERMISSIONS_PATH\""
fi

# Run the Python scripts to generate files
echo "Building Django with types $TYPES_PATH and permissions $PERMISSIONS_PATH"
python -m generate django --types="$TYPES_PATH" $permissions_arg --output_dir="$STACK_PATH/stack/django/${MACHINE_NAME}_app"

# echo "Building TypeScript with types $TYPES_PATH and permissions $PERMISSIONS_PATH"
python -m generate typescript --types="$TYPES_PATH" $permissions_arg --output_dir="$STACK_PATH/stack/reactjs/src/object-actions/"
python -m generate typescript --types="$TYPES_PATH" $permissions_arg --output_dir="$STACK_PATH/stack/databuilder/src/"
python -m generate typescript --types="$TYPES_PATH" $permissions_arg --output_dir="$STACK_PATH/stack/cypress/cypress/support/"
python -m generate typescript --types="$TYPES_PATH" $permissions_arg --output_dir="$STACK_PATH/stack/k6/"
