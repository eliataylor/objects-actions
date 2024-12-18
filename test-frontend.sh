#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting Cypressio"
cd "$projectpath/cypress"
npm install
npm run cy:run
