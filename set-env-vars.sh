#!/bin/sh

set -e

# Define root .env file and public templates
ROOT_ENV_FILE=".env"
PUBLIC_ENV_FILE=".env.public"
PUBLIC_JSON_FILE="stack/cypress/cypress.public.json"

# Ensure root .env file exists
if [ ! -f "$ROOT_ENV_FILE" ]; then
  cp "$PUBLIC_ENV_FILE" "$ROOT_ENV_FILE"
  echo "Created $ROOT_ENV_FILE from $PUBLIC_ENV_FILE"
fi

# Load root .env variables into memory
load_env() {
  while IFS='=' read -r KEY VALUE || [ -n "$KEY" ]; do
    case "$KEY" in
      ""|\#*) continue ;;  # Ignore empty lines and comments
    esac
    eval "ROOT_$KEY=\"$VALUE\""
  done < "$ROOT_ENV_FILE"
}

# Mapping of target files and variables to update
MAPPING="
stack/django/.env:DJANGO_SUPERUSER_PASSWORD:REACT_APP_LOGIN_PASS
stack/django/.env:DJANGO_SUPERUSER_EMAIL:REACT_APP_LOGIN_EMAIL
stack/django/.env:REACT_APP_APP_HOST:REACT_APP_APP_HOST
stack/django/.env:REACT_APP_API_HOST:REACT_APP_API_HOST
stack/django/.env:OA_ENV_STORAGE:OA_ENV_STORAGE
stack/django/.env:OA_ENV_EMAIL:OA_ENV_EMAIL
stack/django/.env:OA_ENV_DB:OA_ENV_DB

stack/databuilder/.env:REACT_APP_API_HOST:REACT_APP_API_HOST
stack/databuilder/.env:REACT_APP_APP_HOST:REACT_APP_APP_HOST
stack/databuilder/.env:REACT_APP_LOGIN_EMAIL:REACT_APP_LOGIN_EMAIL
stack/databuilder/.env:REACT_APP_LOGIN_PASS:REACT_APP_LOGIN_PASS

stack/reactjs/.env:REACT_APP_API_HOST:REACT_APP_API_HOST
stack/reactjs/.env:REACT_APP_APP_HOST:REACT_APP_APP_HOST
stack/reactjs/.env:REACT_APP_TITLE:PROJECT_NAME
stack/reactjs/.env:REACT_APP_LOGIN_EMAIL:REACT_APP_LOGIN_EMAIL
stack/reactjs/.env:REACT_APP_LOGIN_PASS:REACT_APP_LOGIN_PASS

stack/cypress/cypress.env.json:email:REACT_APP_LOGIN_EMAIL
stack/cypress/cypress.env.json:password:REACT_APP_LOGIN_PASS
stack/cypress/cypress.env.json:REACT_APP_APP_HOST:REACT_APP_APP_HOST
stack/cypress/cypress.env.json:REACT_APP_API_HOST:REACT_APP_API_HOST
"

# Ensure missing .env files are created from .env.public
ensure_env_file() {
  FILE="$1"
  if [ ! -f "$FILE" ]; then
    cp "$PUBLIC_ENV_FILE" "$FILE"
    echo "Created $FILE from $PUBLIC_ENV_FILE"
  fi
}

# Ensure missing .json files are created from cypress.public.json
ensure_json_file() {
  FILE="$1"
  if [ ! -f "$FILE" ]; then
    cp "$PUBLIC_JSON_FILE" "$FILE"
    echo "Created $FILE from $PUBLIC_JSON_FILE"
  fi
}

# Function to update .env files
update_env_file() {
  FILE="$1"
  VAR="$2"
  ROOT_KEY="$3"
  ROOT_VALUE=$(eval "echo \${ROOT_$ROOT_KEY}")

  [ -z "$ROOT_VALUE" ] && return  # Skip if root value is empty

  TMP_FILE=$(mktemp)
  UPDATED=0

  while IFS= read -r LINE || [ -n "$LINE" ]; do
    case "$LINE" in
      \#*|"") echo "$LINE" >> "$TMP_FILE" ;;  # Preserve comments and blank lines
      "$VAR="*) echo "$VAR=$ROOT_VALUE" >> "$TMP_FILE"; UPDATED=1 ;;
      *) echo "$LINE" >> "$TMP_FILE" ;;
    esac
  done < "$FILE"

  if [ "$UPDATED" -eq 0 ]; then
    echo "$VAR=$ROOT_VALUE" >> "$TMP_FILE"
  fi

  mv "$TMP_FILE" "$FILE"
  echo "Updated $VAR in $FILE"
}

# Function to update JSON files manually
update_json_file() {
  FILE="$1"
  VAR="$2"
  ROOT_KEY="$3"
  ROOT_VALUE=$(eval "echo \${ROOT_$ROOT_KEY}")

  [ -z "$ROOT_VALUE" ] && return  # Skip if root value is empty

  TMP_FILE=$(mktemp)
  UPDATED=0

  while IFS= read -r LINE || [ -n "$LINE" ]; do
    KEY=$(echo "$LINE" | awk -F: '{print $1}' | tr -d ' ",')

    if [ "$KEY" = "$VAR" ]; then
      echo "  \"$VAR\": \"$ROOT_VALUE\"," >> "$TMP_FILE"
      UPDATED=1
    else
      echo "$LINE" >> "$TMP_FILE"
    fi
  done < "$FILE"

  if [ "$UPDATED" -eq 0 ]; then
    echo "  \"$VAR\": \"$ROOT_VALUE\"," >> "$TMP_FILE"
  fi

  mv "$TMP_FILE" "$FILE"
  echo "Updated $VAR in $FILE"
}

# Load root .env variables
load_env

# Iterate over mapping and update files
echo "$MAPPING" | while IFS=: read -r FILE VAR ROOT_KEY; do
  case "$FILE" in
    *.json)
      ensure_json_file "$FILE"
      update_json_file "$FILE" "$VAR" "$ROOT_KEY"
      ;;
    *.env)
      ensure_env_file "$FILE"
      update_env_file "$FILE" "$VAR" "$ROOT_KEY"
      ;;
  esac
done

echo "Environment variable setup complete."
