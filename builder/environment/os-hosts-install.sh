#!/bin/bash

source "$(pwd)/builder/environment/common.sh"

API_HOST=$(echo "$REACT_APP_API_HOST" | sed -E 's|^https?://([^:/]+).*|\1|')
APP_HOST=$(echo "$REACT_APP_APP_HOST" | sed -E 's|^https?://([^:/]+).*|\1|')

desired_entries=(
  "127.0.0.1  $APP_HOST"
  "127.0.0.1  $API_HOST"
)

# Check and inject entries
for entry in "${desired_entries[@]}"; do
  if ! grep -q "$entry" /etc/hosts; then

    # Backup the current /etc/hosts file
    backup_file="/etc/hosts.bak.$(date +%Y%m%d%H%M%S)"
    sudo cp /etc/hosts "$backup_file"
    echo "Backup of /etc/hosts created at $backup_file"

    echo "Adding: $entry"
    echo "$entry" | sudo tee -a /etc/hosts > /dev/null
  else
    echo "Entry already exists: $entry"
  fi
done

echo "Updated /etc/hosts file:"
cat /etc/hosts
