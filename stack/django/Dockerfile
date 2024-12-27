# Use Python 3.12 slim image as base
FROM python:3.12-slim

# Set working directory specific to Django
WORKDIR /app/django

# Install required system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libmariadb3 \
    libmariadb-dev \
    python3-dev \
    libssl-dev \
    pkg-config && \
    openssl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy dependency file to install dependencies
COPY requirements.txt /app/django/

RUN pip install -r requirements.txt

# Copy the Django project source code
COPY . /app/django/

RUN chmod +x /app/django/entrypoint.sh

# Expose the Django development server port
EXPOSE 8080

# Run the Django application
CMD ["sh", "entrypoint.sh"]
