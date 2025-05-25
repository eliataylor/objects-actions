# Use Node.js 18 alpine image as base
FROM node:18-alpine

# Set working directory specific to ReactJS
WORKDIR /app/reactjs

# Install openssl for SSL certificate generation
RUN apk add --no-cache openssl bash

# Copy dependency files to install dependencies
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm cache clean --force && npm ci || \
    (echo "Initial install failed, trying without package-lock.json" && \
     rm -f package-lock.json && \
     npm install)

# Copy the ReactJS project source code
COPY . .

RUN chmod +x /app/reactjs/entrypoint.sh

# Expose the ReactJS development server port
EXPOSE 3000

# Command to run the ReactJS server
CMD ["/bin/sh", "entrypoint.sh"]
