# For API load testing
# This part of the project is not yet complete

### To Install:
- `brew install k6`

### To Run:
- `environment=prod ./localhost.sh`
- `environment=dev ./localhost.sh`

--- 
docker-compose for testing

  k6:
    build:
      context: ./stack/k6  # Directory containing the Dockerfile
    container_name: k6-service
    volumes:
      - ./stack/k6:/app/k6  # Mount local scripts directory
    working_dir: /app/k6
    depends_on:
      django:
        condition: service_started
    extra_hosts:
      - "localapi.oaexample.com:127.0.0.1"
      - "localhost.oaexample.com:127.0.0.1"
