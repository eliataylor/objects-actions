#!/bin/bash

# Resolve relative paths to absolute based on the location of setup.sh
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# Default values
projectname="test"  # Default project name
types=""
permissions=""
output=""

# Function to derive machinename from projectname
get_machinename() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^[:alnum:]]\+/-/g' | sed 's/^-\|-$//g'
}

# CLI argument parsing
while [[ $# -gt 0 ]]; do
    case "$1" in
        --project)
            projectname="$2"
            shift 2
            ;;
        --types)
            types="$2"
            shift 2
            ;;
        --permissions)
            permissions="$2"
            shift 2
            ;;
        --output)
            output="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Derive machinename
machinename=$(get_machinename "$projectname")

# Ensure project directory exists or create it
if [ ! -d "$machinename" ]; then
    mkdir -p "$machinename"
fi

# Get the absolute path
projectpath=$(realpath "$machinename")

resolve_absolute_path() {
    local path="$1"
    if [[ "$path" == /* ]]; then
        echo "$path"  # Already absolute
    else
        echo "$SCRIPT_DIR/$path"  # Make relative paths absolute
    fi
}

# Resolve paths for types and permissions
csvpath=$(resolve_absolute_path "${types:-examples/democrasee-objects.csv}")
permissionspath=$(resolve_absolute_path "${permissions:-examples/democrasee-permissions.csv}")


# Export all variables for use in scripts
export machinename projectpath csvpath permissionspath output
