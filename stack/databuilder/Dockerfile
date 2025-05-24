# Use Node.js 18 alpine image as base
FROM node:18-alpine

# Set working directory specific to ReactJS
WORKDIR /app/databuilder

# Copy dependency files to install dependencies
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm cache clean --force && npm install

# Copy the ReactJS project source code
COPY . .

RUN chmod +x /app/databuilder/entrypoint.sh

CMD ["bash", "entrypoint.sh"]
