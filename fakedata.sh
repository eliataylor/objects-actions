#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting DataBuilder in $stackpath/databuilder"
cd "$stackpath/databuilder"
npm install
npm run start
