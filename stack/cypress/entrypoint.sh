#!/bin/sh

# Check if cypress.env.json exists; if not, create it from cypress.public.json
if [ ! -f /app/cypress/cypress.env.json ]; then
  echo "No cypress.env.json file found. Using default cypress.public.json."
  cp /app/cypress/cypress.public.json /app/cypress/cypress.env.json
else
  echo "cypress.env.json file found. Using the provided version."
fi

# Start Xvfb to provide a display server
Xvfb :99 -screen 0 1280x1024x24 &

# Export the DISPLAY environment variable
export DISPLAY=:99

# Debugging: Check if Xvfb is running
if pgrep Xvfb > /dev/null; then
  echo "Xvfb is running."
else
  echo "Failed to start Xvfb."
  exit 1
fi

# Execute the given command or default to Cypress run
if [ "$#" -gt 0 ]; then
  exec ./node_modules/.bin/cypress "$@"
else
  npx cypress run --headless --browser chrome
fi
