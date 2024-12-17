#!/bin/bash

projectname=${1:-test}

# Convert projectname to alphanumeric, lowercase, and replace spaces with hyphens
machinename=$(echo "$projectname" | tr '[:upper:]' '[:lower:]' | sed 's/[^[:alnum:]]\+/-/g' | sed 's/^-\|-$//g')

# Default to "test" if machinename is empty
if [ -z "$machinename" ]; then
    machinename="test"
fi

projectpath=$(realpath "$machinename")

echo "Starting Cypressio"
cd "$projectpath/cypress"
npm install
npm run cy:run
