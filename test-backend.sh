#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting K6"
cd "$stackpath/k6"
k6 run -o json="$stackpath/results/k6-dev-main-${TIMESTAMP}.json" --env environment="dev" localhost.js
