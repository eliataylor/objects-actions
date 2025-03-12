#!/bin/bash

if [ -z "$environment" ]; then
  environment="dev"
fi

dir='results'
if [ ! -d $dir ]
then
     mkdir $dir
else
     echo "Directory exists"
fi

# Generate timestamp with the format YYYY-MM-DD-HH-MM-SS
TIMESTAMP=$(date +"%Y-%m-%d")

# Get current Git branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Replace invalid characters in branch name with underscores
BRANCH_CLEAN=$(echo "$BRANCH" | tr -cd '[:alnum:]-' | tr '[:upper:]' '[:lower:]')

# Run K6 test with output saved to a file with branch name and timestamp suffix
# k6 run -o json="${dir}/k6-${environment}-${BRANCH_CLEAN}-${TIMESTAMP}.json" --env environment="$environment" localhost.js
# k6 run localhost.js

# Run test with all credentials
k6 run \
  --env CSRF_TOKEN="tx27t5mS8MoWPrI0WQobT4cnSJqZfWa3" \
  --env COOKIE="sessionid=j04b0bau9vgnt9lkfq8nxoqiv7d2bar8; csrftoken=tx27t5mS8MoWPrI0WQobT4cnSJqZfWa3" \
  localhost.js
