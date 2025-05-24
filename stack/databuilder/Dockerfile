# Use Node.js 18 alpine image as base
FROM node:18-alpine

# Set working directory specific to ReactJS
WORKDIR /app/databuilder

# Install openssl for SSL certificate generation
RUN apk add --no-cache bash

# Copy dependency files to install dependencies
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm cache clean --force && npm ci

# Copy the ReactJS project source code
COPY . .

RUN chmod +x /app/databuilder/entrypoint.sh

CMD ["/bin/bash", "entrypoint.sh"]
