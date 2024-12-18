#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting K6"
cd "$projectpath/k6"
k6 run -o json="${projectpath}/results/k6-dev-main-${TIMESTAMP}.json" --env environment="dev" localhost.js
