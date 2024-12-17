#!/bin/bash

projectname=${1:-test}

# Convert projectname to alphanumeric, lowercase, and replace spaces with hyphens
machinename=$(echo "$projectname" | tr '[:upper:]' '[:lower:]' | sed 's/[^[:alnum:]]\+/-/g' | sed 's/^-\|-$//g')

# Default to "test" if machinename is empty
if [ -z "$machinename" ]; then
    machinename="test"
fi

projectpath=$(realpath "$machinename")

echo "Starting K6"
cd "$projectpath/k6"
k6 run -o json="${projectpath}/results/k6-dev-main-${TIMESTAMP}.json" --env environment="dev" localhost.js
