#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting DataBuilder in $projectpath/databuilder"
cd "$projectpath/databuilder"
npm install
npm run start
