FROM cypress/included:cypress-13.16.1-node-22.12.0-chrome-131.0.6778.108-1-ff-133.0-edge-131.0.2903.70-1

# Set working directory
WORKDIR /app/cypress

# Copy dependencies files and install
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm ci

# Copy the entire Cypress project
COPY . .

# Make entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Set the entrypoint script
ENTRYPOINT ["bash", "./entrypoint.sh"]
