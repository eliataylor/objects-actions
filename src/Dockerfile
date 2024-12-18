FROM python:3.12.2

# Set work directory specific to the generate service
WORKDIR /app/generate

# Install dependencies
COPY ./src/requirements.txt /app/generate/
RUN python -m venv .venv && \
    . .venv/bin/activate && \
    pip install --no-cache-dir -r requirements.txt

# Copy the generate script and its required files
COPY ./src/generate.py /app/generate/
COPY ./stack /app/stack

# Command to run the generate script
CMD [".venv/bin/python", "generate.py"]
