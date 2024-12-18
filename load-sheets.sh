#!/bin/bash
source "$(dirname "$0")/common.sh"

# Run the Python scripts to generate files
echo "Building Django with types $csvpath and permissions $permissionspath"
python -m generate django --types="$csvpath" --permissions="$permissionspath" --output_dir="$projectpath/django/${machinename}_app"

echo "Building TypeScript with types $csvpath and permissions $permissionspath"
python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$projectpath/reactjs/src/object-actions/types/"
python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$projectpath/databuilder/src/"
python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$projectpath/cypress/cypress/support/"
# python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$projectpath/k6/"
