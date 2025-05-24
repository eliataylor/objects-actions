#!/bin/bash

# Resolve SCRIPT_DIR to the directory containing docker-compose.yml
find_script_dir() {
    local dir=$(pwd)
    while [[ "$dir" != "/" ]]; do
        if [[ -f "$dir/docker-compose.yml" ]]; then
            echo "$dir"
            return
        fi
        dir=$(dirname "$dir")
    done
    echo "Error: docker-compose.yml not found in the current or parent directories." >&2
    exit 1
}

SCRIPT_DIR=$(find_script_dir)
echo "Running common.sh in $SCRIPT_DIR"

# CLI argument parsing for .env file path
CUSTOM_ENV_PATH=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --env)
            CUSTOM_ENV_PATH="$2"
            echo "CLI: Custom .env file path set to $CUSTOM_ENV_PATH"
            shift 2
            ;;
        --project)
            PROJECT_NAME="$2"
            echo "CLI: PROJECT_NAME set to $PROJECT_NAME"
            shift 2
            ;;
        --machine-name)
            MACHINE_NAME="$2"
            echo "CLI: MACHINE_NAME set to $MACHINE_NAME"
            shift 2
            ;;
        --types)
            TYPES_PATH="$2"
            echo "CLI: TYPES_PATH set to $TYPES_PATH"
            shift 2
            ;;
        --permissions)
            PERMISSIONS_PATH="$2"
            echo "CLI: PERMISSIONS_PATH set to $PERMISSIONS_PATH"
            shift 2
            ;;
        --output)
            OUTPUT_DIR="$2"
            echo "CLI: OUTPUT_DIR set to $OUTPUT_DIR"
            shift 2
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

ENV_FILE="${CUSTOM_ENV_PATH:-$SCRIPT_DIR/.env}"
if [[ -f "$ENV_FILE" ]]; then
    echo "Loading environment variables from: $ENV_FILE"
    while IFS='=' read -r key value; do
        if [[ ! "$key" =~ ^# && -n "$key" ]]; then
            export "$key"="$value"
        fi
    done < "$ENV_FILE"
else
    echo "No .env file found at $ENV_FILE" >&2
    exit 1
fi

# Debug: Print all currently set variables
# echo "Debug: Current environment variables after loading .env:"
# printenv | grep -E 'PROJECT_NAME|STACK_PATH|TYPES_PATH|PERMISSIONS_PATH|OUTPUT_DIR|REACT_APP_'

# Ensure PROJECT_NAME is set
if [[ -z "$PROJECT_NAME" ]]; then
    echo "Error: --project <PROJECT_NAME> is required or must be set in .env." >&2
    exit 1
fi

# Resolve relative paths to absolute paths
resolve_absolute_path() {
    local base="$1"
    local path="$2"
    if [[ "$path" == /* ]]; then
        echo "$path"  # Already absolute
    else
        echo "$base/$path"  # Make relative paths absolute
    fi
}

# Function to derive machinename from PROJECT_NAME
get_machinename() {
    local name="$1"
    name=$(echo "$name" | tr '[:upper:]' '[:lower:]') # Make lowercase
    name=$(echo "$name" | sed 's/[^a-z0-9]/_/g')   # Replace non-alphanumerics with _
    name=$(echo "$name" | sed 's/^_//')         # Trim leading _
    name=$(echo "$name" | sed 's/_$//')         # Trim trailing _
    echo "$name"
}


if [[ -z "$MACHINE_NAME" ]]; then
    MACHINE_NAME=$(get_machinename "$PROJECT_NAME")
    echo "Derived MACHINE_NAME from PROJECT_NAME: $MACHINE_NAME"
else
    echo "Using given MACHINE_NAME: $MACHINE_NAME"
fi

# Ensure stack directory exists
if [[ "$STACK_PATH" == '.' ]]; then
    STACK_PATH=$(pwd)
    echo "STACK_PATH set to current directory: $STACK_PATH"
else
    STACK_PATH=$(resolve_absolute_path "$SCRIPT_DIR" "$STACK_PATH")
    if [[ ! -d "$STACK_PATH" ]]; then
      mkdir -p "$STACK_PATH"
      echo "Created STACK_PATH: $STACK_PATH"
    fi
fi

# Make absolute if relative
TYPES_PATH=$(resolve_absolute_path "$SCRIPT_DIR" "$TYPES_PATH")
OUTPUT_DIR=$(resolve_absolute_path "$SCRIPT_DIR" "$OUTPUT_DIR")

if [[ -n "$PERMISSIONS_PATH" ]]; then
  PERMISSIONS_PATH=$(resolve_absolute_path "$SCRIPT_DIR" "$PERMISSIONS_PATH")
  echo "Resolved PERMISSIONS_PATH: $PERMISSIONS_PATH"
fi

# Validate paths
if [[ ! -f "$TYPES_PATH" ]]; then
    echo "Error: $TYPES_PATH is not a valid Types CSV file path." >&2
    exit 1
fi

if [[ -n "$OUTPUT_DIR" && ! -d "$OUTPUT_DIR" ]]; then
    echo "Error: $OUTPUT_DIR is not a valid output directory path." >&2
    exit 1
fi

if [[ -n "$PERMISSIONS_PATH" && ! -f "$PERMISSIONS_PATH" ]]; then
    echo "Error: $PERMISSIONS_PATH is not a valid permissions CSV path." >&2
    exit 1
fi

echo "****USING: "
printenv | grep -E 'ENV_FILE|PROJECT_NAME|STACK_PATH|TYPES_PATH|PERMISSIONS_PATH|OUTPUT_DIR|REACT_APP_'

# Export all variables for use in other scripts
export ENV_FILE STACK_PATH PROJECT_NAME MACHINE_NAME TYPES_PATH PERMISSIONS_PATH OUTPUT_DIR REACT_APP_API_HOST REACT_APP_APP_HOST REACT_APP_LOGIN_EMAIL REACT_APP_LOGIN_PASS
