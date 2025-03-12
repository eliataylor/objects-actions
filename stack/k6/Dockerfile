# Use the official k6 image as the base
FROM grafana/k6:latest

# Switch to root user to install additional packages
USER root

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Install TypeScript globally
RUN npm install -g typescript

# Revert back to the k6 default user
USER k6

# Set working directory
WORKDIR /app/k6

# Copy local files to the container
COPY . .

# Compile TypeScript files to JavaScript
RUN tsc

# Update the `types` import in `api-speed-tests.js` to use `.js` extension
RUN sed -i 's/from "\.\/types"/from "\.\/types.js"/' api-speed-tests.js

# Remove the original .ts file after compilation
RUN rm -f types.ts

# Default command (can be overridden in docker-compose)
ENTRYPOINT ["k6"]
CMD ["run", "/app/k6/run.sh"]
