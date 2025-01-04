#!/bin/sh

if [ ! -d "/app/cypress/node_modules" ]; then
  echo "Falling back to npm installing dependencies from entrypoint.sh"
  npm install
fi

# Check if cypress.env.json exists; if not, create it from cypress.public.json
if [ ! -f /app/cypress/cypress.env.json ]; then
  echo "No cypress.env.json file found. copying cypress.public.json."
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
  # exec ./node_modules/.bin/cypress "$@"
  exec "$@"
else
  echo "Container is ready. Use the following commands to run Cypress:"
  echo "  - Run tests: docker exec -it cypress-service npx cypress run"
  tail -f /dev/null
fi
