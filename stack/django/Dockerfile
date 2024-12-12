# Use the official Python image as a parent image
FROM python:3.12.2 AS builder

WORKDIR /app

# Install ca-certificates
RUN apt-get update && apt-get install -y ca-certificates

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime stage
FROM python:3.12.2 AS runner

# Set environment variables
ENV PYTHONUNBUFFERED=1


# Install system dependencies
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin/gunicorn /usr/local/bin/gunicorn
RUN apt-get update && \
    apt-get install -y gcc libmariadb3 pkg-config python3-dev libssl-dev && \
    apt-get clean

# Create and set the working directory
WORKDIR /app

# Copy the rest of the application code into the container
COPY . .

EXPOSE 8080

# Run the Django application
CMD ["sh", "entrypoint.sh"]
