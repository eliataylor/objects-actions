# Use an official Python 3.11 base image
FROM python:3.11-slim AS base
WORKDIR /app

# Install core dependencies (Git, curl, build tools) and prepare environment
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        curl \
        build-essential \
        apt-transport-https \
        gnupg \
        ca-certificates \
        gcc \
        libmariadb3 \
        pkg-config \
        python3-dev \
        libssl-dev && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    npm install -g npm@latest && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install K6 (latest version)
# RUN curl -L -o k6.deb https://github.com/grafana/k6/releases/download/v0.55.0/k6-v0.55.0-linux-amd64.deb && \
#     apt-get install -y ./k6.deb && \
#    rm k6.deb

# Copy the project files
COPY . /app

# Clean pre-generated directories from contributor testing
RUN rm -rf "/app/stack/src/.venv" \
    && rm -rf ".github" \
    && rm -rf "/app/stack/test" \
    && rm -rf "/app/stack/cypress/node_modules" \
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
RUN chmod +x /app/stack/*.sh

# Expose ports for Django and React
EXPOSE 8080 3000

# Default command to keep container ready for execution
CMD ["bash"]
