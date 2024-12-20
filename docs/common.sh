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

# Load .env file from SCRIPT_DIR and export variables
if [[ -f "$SCRIPT_DIR/.env" ]]; then
    echo "Loading environment variables from $SCRIPT_DIR/.env"
    while IFS='=' read -r key value; do
        if [[ ! "$key" =~ ^# && -n "$key" ]]; then
            export "$key"="$value"
            echo "Exported: $key=$value"
        fi
    done < "$SCRIPT_DIR/.env"
else
    echo "No .env file found in $SCRIPT_DIR"
fi

# Debug: Print all currently set variables
echo "Debug: Current environment variables after loading .env:"
printenv | grep -E 'PROJECT_NAME|STACK_PATH|TYPES_PATH|PERMISSIONS_PATH|OUTPUT_DIR|REACT_APP_'

# CLI argument parsing
while [[ $# -gt 0 ]]; do
    case "$1" in
        --project)
            PROJECT_NAME="$2"
            echo "CLI: PROJECT_NAME set to $PROJECT_NAME"
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

# Derive machinename
MACHINE_NAME=$(get_machinename "$PROJECT_NAME")
echo "Derived MACHINE_NAME: $MACHINE_NAME"

# Ensure stack directory exists
if [[ ! -d "$STACK_PATH" ]]; then
    STACK_PATH="$SCRIPT_DIR/$MACHINE_NAME"
fi
STACK_PATH=$(resolve_absolute_path "$SCRIPT_DIR" "$STACK_PATH")

if [[ ! -d "$STACK_PATH" ]]; then
    mkdir -p "$STACK_PATH"
    echo "Created STACK_PATH: $STACK_PATH"
fi

# Make absolute if relative
TYPES_PATH=$(resolve_absolute_path "$SCRIPT_DIR" "$TYPES_PATH")
echo "Resolved TYPES_PATH: $TYPES_PATH"
OUTPUT_DIR=$(resolve_absolute_path "$SCRIPT_DIR" "$OUTPUT_DIR")
echo "Resolved OUTPUT_DIR: $OUTPUT_DIR"

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

# Debug: Print final variable values
echo "Final Variables:"
echo "PROJECT_NAME=$PROJECT_NAME"
echo "TYPES_PATH=$TYPES_PATH"
echo "PERMISSIONS_PATH=$PERMISSIONS_PATH"
echo "OUTPUT_DIR=$OUTPUT_DIR"
echo "STACK_PATH=$STACK_PATH"
echo "MACHINE_NAME=$MACHINE_NAME"

# Export all variables for use in other scripts
export STACK_PATH PROJECT_NAME TYPES_PATH PERMISSIONS_PATH OUTPUT_DIR REACT_APP_API_HOST REACT_APP_APP_HOST REACT_APP_LOGIN_EMAIL REACT_APP_LOGIN_PASS
