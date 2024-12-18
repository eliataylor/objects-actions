#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting Cypress.io"
cd "$projectpath/cypress"
npm install
npm run cy:run
