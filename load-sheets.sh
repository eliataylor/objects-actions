#!/bin/bash

# Example:
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


# Run the Python scripts to generate files
echo "Building Django with types $csvpath and permissions $permissionspath"
python -m generate django --types="$csvpath" --permissions="$permissionspath" --output_dir="$SCRIPT_DIR/stack/django/${machinename}_app"

echo "Building TypeScript with types $csvpath and permissions $permissionspath"
python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$SCRIPT_DIR/stack/reactjs/src/object-actions/types/"
python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$SCRIPT_DIR/stack/databuilder/src/"
python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$SCRIPT_DIR/stack/cypress/cypress/support/"
python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$SCRIPT_DIR/stack/k6/"
