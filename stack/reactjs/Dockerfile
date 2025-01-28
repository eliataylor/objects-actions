# Use Node.js 18 alpine image as base
FROM node:18-alpine

# Set working directory specific to ReactJS
WORKDIR /app/reactjs

# Install openssl for SSL certificate generation
RUN apk add --no-cache openssl

# Copy dependency files to install dependencies
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm ci

# Copy the ReactJS project source code
COPY . .

RUN chmod +x /app/reactjs/entrypoint.sh

# Expose the ReactJS development server port
EXPOSE 3000

# Command to run the ReactJS server
CMD ["sh", "entrypoint.sh"]
