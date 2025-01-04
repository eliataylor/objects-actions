FROM cypress/included:13.16.1

# Set working directory
WORKDIR /app/cypress

# Copy dependencies files and install
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire Cypress project
COPY . .

# Install Xvfb for headless mode
RUN apt-get update && apt-get install -y \
    xvfb \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    dbus

# Make entrypoint script executable
RUN chmod +x /app/cypress/entrypoint.sh

# Set the entrypoint script
ENTRYPOINT ["sh", "/app/cypress/entrypoint.sh"]

# Default command to run Cypress in headless mode
CMD ["run", "--headless", "--browser", "chrome"]
