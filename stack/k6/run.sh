#!/bin/bash

# Get current Git branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Replace invalid characters in branch name with underscores
BRANCH_CLEAN=$(echo "$BRANCH" | tr -cd '[:alnum:]-' | tr '[:upper:]' '[:lower:]')

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found"
  echo "Please create a .env file with CSRF_TOKEN and COOKIE variables"
  exit 1
fi

# More compatible method to load variables from .env file
while IFS= read -r line || [ -n "$line" ]; do
  # Skip comments and empty lines
  if [[ ! $line =~ ^[[:space:]]*# && -n $line ]]; then
    # Export the variable
    export "${line?}"
  fi
done < .env

# Verify that required variables are loaded
if [ -z "$CSRF_TOKEN" ] || [ -z "$COOKIE" ]; then
  echo "Error: CSRF_TOKEN or COOKIE not found in .env file"
  echo "Contents of .env file:"
  cat .env
  exit 1
fi

# Show confirmation of loaded variables (obfuscated for security)
echo "Loaded CSRF_TOKEN: ${CSRF_TOKEN:0:5}...${CSRF_TOKEN: -5}"
echo "Loaded COOKIE: ${COOKIE:0:15}...${COOKIE: -15}"

# Create results directory if it doesn't exist
mkdir -p test-results

# Run K6 test with variables from .env file
k6 run \
  --env CSRF_TOKEN="$CSRF_TOKEN" \
  --env COOKIE="$COOKIE" \
  api-speed-tests.js
