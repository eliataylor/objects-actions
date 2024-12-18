#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting Cypress.io"
cd "$stackpath/cypress"
npm install
npm run cy:run
