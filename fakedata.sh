#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting DataBuilder"
cd "$projectpath/databuilder"
npm install
npm run start
