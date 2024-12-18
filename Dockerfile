# Use an official Python 3.11 base image
FROM python:3.11-slim AS base
WORKDIR /app

# Install core dependencies (Git, curl, build tools) and prepare environment
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl build-essential apt-transport-https gnupg ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js and npm (LTS version) from NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

# Install K6 (latest version)
# RUN curl -s https://packagecloud.io/install/repositories/loadimpact/k6/script.deb.sh | bash && apt-get update && bash apt-get install -y k6

# Copy the project files
COPY . /app

# Clean pre-generated directories
RUN rm -rf "/app/stack/cypress/node_modules" \
    && rm -rf "/app/stack/databuilder/node_modules" \
    && rm -rf "/app/stack/django/.venv" \
    && rm -rf "/app/stack/k6/results/*" \
    && rm -rf "/app/stack/reactjs/node_modules" \
    && rm -rf "/app/stack/cypress/node_modules" \
    && rm -rf "/app/stack/cypress/cypress/fixtures/*" \
    && rm -rf "/app/stack/cypress/cypress/downloads/*" \
    && rm -rf "/app/stack/cypress/cypress/screenshots/*" \
    && rm -rf "/app/stack/cypress/cypress/videos/*" \
    && rm -rf "/app/stack/cypress/cypress/e2e/examples" \
    && rm -rf "/app/stack/databuilder/node_modules" \
    && rm -rf "/app/stack/django/.venv" \
    && rm -rf "/app/stack/django/media/uploads" \
    && rm -rf "/app/stack/django/newproject_app/migrations/*" \
    && rm -rf "/app/stack/k6/results/*" \
    && rm -rf "/app/stack/reactjs/node_modules" \


# Make all scripts executable
RUN chmod +x /app/*.sh

# Expose ports for Django and React
EXPOSE 8080 3000

# Default command to keep container ready for execution
CMD ["bash"]
