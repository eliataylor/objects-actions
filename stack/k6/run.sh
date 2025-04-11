#!/bin/bash

# Get current Git branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Replace invalid characters in branch name with underscores
BRANCH_CLEAN=$(echo "$BRANCH" | tr -cd '[:alnum:]-' | tr '[:upper:]' '[:lower:]')

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found"
  echo "Please create a .env file with REACT_APP_API_HOST, CSRF_TOKEN and SESSION_ID variables"
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

# Set default REACT_APP_API_HOST if not defined in .env
if [ -z "$REACT_APP_API_HOST" ]; then
  echo "Warning: REACT_APP_API_HOST not found in .env file, using default value"
  export REACT_APP_API_HOST="https://api.oaexample.com"
fi

# Verify that required variables are loaded
if [ -z "$CSRF_TOKEN" ] || [ -z "SESSION_ID" ]; then
  echo "Error: CSRF_TOKEN or SESSION_ID not found in .env file"
  echo "Contents of .env file:"
  cat .env
  exit 1
fi

# Show confirmation of loaded variables (obfuscated for security)
echo "Loaded REACT_APP_API_HOST: ${REACT_APP_API_HOST}"
echo "Loaded CSRF_TOKEN: ${CSRF_TOKEN:0:5}...${CSRF_TOKEN: -5}"
echo "Loaded SESSION_ID: ${SESSION_ID:0:15}...${SESSION_ID: -15}"

# Create results directory if it doesn't exist
mkdir -p test-results

# Run K6 test with variables from .env file
k6 run \
  --env BASE_URL="$REACT_APP_API_HOST" \
  --env CSRF_TOKEN="$CSRF_TOKEN" \
  --env SESSION_ID="$SESSION_ID" \
  api-speed-tests.js
