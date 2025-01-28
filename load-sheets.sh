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

# Check if permissions path is a valid file path
permissions_arg=""
if [[ -f "$PERMISSIONS_PATH" ]]; then
    permissions_arg="--permissions=$PERMISSIONS_PATH"
else
    permissions_arg="--default_perm=IsAuthenticatedOrReadOnly"
fi


echo "Building Django with types $TYPES_PATH and permissions $PERMISSIONS_PATH"
python -m generate django --types="$TYPES_PATH" --output_dir="$STACK_PATH/stack/django/${MACHINE_NAME}_app"
# TODO: if not first run, sh into docker and run migrations (follow stack/django/readme.md)

+echo "Resetting forms folder: $STACK_PATH/stack/reactjs/src/object-actions/forming/forms/*"
+rm -f "$STACK_PATH/stack/reactjs/src/object-actions/forming/forms/*"
echo "Building forms with types $TYPES_PATH"
python -m generate forms --types="$TYPES_PATH" --output_dir="$STACK_PATH/stack/reactjs/src/object-actions/forming/forms"

echo "creating types.ts with types $TYPES_PATH and permissions $PERMISSIONS_PATH"
python -m generate typescript --types="$TYPES_PATH" --output_dir="$STACK_PATH/stack/reactjs/src/object-actions/types"
python -m generate typescript --types="$TYPES_PATH" --output_dir="$STACK_PATH/stack/databuilder/src/"
python -m generate typescript --types="$TYPES_PATH" --output_dir="$STACK_PATH/stack/cypress/cypress/support/"
python -m generate typescript --types="$TYPES_PATH" --output_dir="$STACK_PATH/stack/k6/"

echo "creating access.ts and permissions.json with $permissions_arg"
python -m generate permissions-ts $permissions_arg --types="$TYPES_PATH" --output_dir="$STACK_PATH/stack/reactjs/src/object-actions/types"
python -m generate permissions-ts $permissions_arg --types="$TYPES_PATH" --output_dir="$STACK_PATH/stack/databuilder/src/"
python -m generate permissions-ts $permissions_arg --types="$TYPES_PATH" --output_dir="$STACK_PATH/stack/cypress/cypress/support/"
