#!/bin/sh

set -e

# Define the file reference map
FILES="
.env:.env.public
stack/reactjs/.env:stack/reactjs/.env.public
stack/django/.env:stack/django/.env.public
stack/databuilder/.env:stack/databuilder/.env.public
stack/cypress/cypress.env.json:stack/cypress/cypress.public.json
"

# Loop through each file mapping
echo "$FILES" | while IFS=: read -r target source; do
  if [ ! -f "$target" ]; then
    if [ -f "$source" ]; then
      cp "$source" "$target"
      echo "Created $target from $source"
    else
      echo "Warning: Source file $source does not exist. Skipping $target."
    fi
  else
    echo "Skipping $target, already exists."
  fi
done

# Load root .env variables into memory
load_env() {
  while IFS='=' read -r KEY VALUE || [ -n "$KEY" ]; do
    case "$KEY" in
      ""|\#*) continue ;;  # Ignore empty lines and comments
    esac
    eval "ROOT_$KEY=\"$VALUE\""
  done < ".env"
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
stack/reactjs/.env:DEFAULT_PERMS:DEFAULT_PERMS

stack/cypress/cypress.env.json:email:REACT_APP_LOGIN_EMAIL
stack/cypress/cypress.env.json:password:REACT_APP_LOGIN_PASS
stack/cypress/cypress.env.json:REACT_APP_APP_HOST:REACT_APP_APP_HOST
stack/cypress/cypress.env.json:REACT_APP_API_HOST:REACT_APP_API_HOST
"

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
      update_json_file "$FILE" "$VAR" "$ROOT_KEY"
      ;;
    *.env)
      update_env_file "$FILE" "$VAR" "$ROOT_KEY"
      ;;
  esac
done

# Function to update ports in docker-compose.yml based on REACT_APP_API_HOST and REACT_APP_APP_HOST
DOCKER_COMPOSE_FILE="docker-compose.yml"

update_docker_compose_ports() {
  [ ! -f "$DOCKER_COMPOSE_FILE" ] && return

  # Extract host and port from REACT_APP_API_HOST (for Django)
  API_HOST=$(echo "$ROOT_REACT_APP_API_HOST" | awk -F[/:] '{print $4}')
  API_PORT=$(echo "$ROOT_REACT_APP_API_HOST" | awk -F[/:] '{print $5}')
  [ -z "$API_PORT" ] && API_PORT="80"  # Default port if not specified

  # Extract host and port from REACT_APP_APP_HOST (for ReactJS)
  APP_HOST=$(echo "$ROOT_REACT_APP_APP_HOST" | awk -F[/:] '{print $4}')
  APP_PORT=$(echo "$ROOT_REACT_APP_APP_HOST" | awk -F[/:] '{print $5}')
  [ -z "$APP_PORT" ] && APP_PORT="80"  # Default port if not specified

  TMP_FILE=$(mktemp)
  while IFS= read -r LINE || [ -n "$LINE" ]; do
    case "$LINE" in
      *"django:"*)
        IN_DJANGO=1
        echo "$LINE" >> "$TMP_FILE"
        ;;
      *"reactjs:"*)
        IN_DJANGO=0
        IN_REACTJS=1
        echo "$LINE" >> "$TMP_FILE"
        ;;
      "    ports:"*)
        echo "$LINE" >> "$TMP_FILE"
        ;;
      *"- \"8080:8080\""*)
        if [ "$IN_DJANGO" -eq 1 ]; then
          echo "      - \"$API_PORT:$API_PORT\"" >> "$TMP_FILE"
          echo "Updated Django container to use port $API_PORT"
        else
          echo "$LINE" >> "$TMP_FILE"
        fi
        ;;
      *"- \"3000:3000\""*)
        if [ "$IN_REACTJS" -eq 1 ]; then
          echo "      - \"$APP_PORT:$APP_PORT\"" >> "$TMP_FILE"
          echo "Updated ReactJS container to use port $APP_PORT"
        else
          echo "$LINE" >> "$TMP_FILE"
        fi
        ;;
      *)
        echo "$LINE" >> "$TMP_FILE"
        ;;
    esac
  done < "$DOCKER_COMPOSE_FILE"

  mv "$TMP_FILE" "$DOCKER_COMPOSE_FILE"
}

# Ensure docker-compose.yml exists
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
  echo "Warning: $DOCKER_COMPOSE_FILE not found. Skipping port updates."
else
  update_docker_compose_ports
fi

echo "Environment variable and Docker Compose setup complete."
