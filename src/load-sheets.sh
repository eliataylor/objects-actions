#!/bin/bash
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd) # /app in docker

# Run the Python scripts to generate files
echo "Building Django with types $csvpath and permissions $permissionspath"
python -m generate django --types="$csvpath" --permissions="$permissionspath" --output_dir="$stackpath/django/${machinename}_app"

echo "Building TypeScript with types $csvpath and permissions $permissionspath"
python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$stackpath/reactjs/src/object-actions/types/"
python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$stackpath/databuilder/src/"
python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$stackpath/cypress/cypress/support/"
# python -m generate typescript --types="$csvpath" --permissions="$permissionspath" --output_dir="$stackpath/k6/"
