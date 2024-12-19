# Use Node.js 20 alpine image as base
FROM node:20-alpine

# Set working directory specific to ReactJS
WORKDIR /app/databuilder

# Copy dependency files to install dependencies
COPY package.json package-lock.json /app/databuilder/

# Install Node.js dependencies
RUN npm install

# Copy the ReactJS project source code
COPY . /app/databuilder/
COPY .env /app/databuilder/

RUN chmod +x /app/databuilder/entrypoint.sh

CMD ["sh", "entrypoint.sh"]
