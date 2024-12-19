# Use Node.js 20 alpine image as base
FROM node:20-alpine

# Set working directory specific to ReactJS
WORKDIR /app/cypress

# Copy dependency files to install dependencies
COPY package.json package-lock.json /app/cypress/

# Install Node.js dependencies
RUN npm install

# Copy the ReactJS project source code
COPY . /app/cypress/
COPY .env /app/cypress/

CMD ["npm", "run", "cy:run"]
