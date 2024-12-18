#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting ReactJS in $stackpath/reactjs"
cd "$stackpath/reactjs"
npm install
npm run start-ssl

# run cypress
