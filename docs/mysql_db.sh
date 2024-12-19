#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Stop any host version of MySQL if running
if command_exists brew && brew services list | grep -q "mysql.*started"; then
    echo "Host MySQL server is running via brew. Stopping it..."
    brew services stop mysql
elif command_exists mysql.server && mysql.server status | grep -q "SUCCESS"; then
    echo "Host MySQL server is running via mysql.server. Stopping it..."
    mysql.server stop
elif command_exists mysql && mysqladmin ping -h "127.0.0.1" --silent; then
    echo "Host MySQL server is running. Stopping it..."
    mysqladmin -u root shutdown
else
    echo "No host MySQL server is running."
fi

# Check or install Docker (user-mode installation)
if ! command_exists docker; then
    echo "Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh --version
    echo "Docker installed. Configuring for non-root user..."
    export DOCKER_HOST="unix:///run/user/$(id -u)/docker.sock"
    nohup dockerd --data-root="$HOME/.docker" --host=$DOCKER_HOST &>/dev/null &
else
    echo "Docker is already installed."
fi

# Run MySQL in a Docker container
MYSQL_ROOT_PASSWORD=1234
MYSQL_PASSWORD=1234
MYSQL_DATABASE=_db
MYSQL_USER=_dbuser

# Check if a MySQL container with the same name exists
if docker ps -a --format '{{.Names}}' | grep -q "^mysql-container$"; then
    echo "MySQL container with the name 'mysql-container' already exists."
    echo "Starting the existing container..."
    docker start mysql-container
else
    echo "Starting a new MySQL container..."
    docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
        -e MYSQL_DATABASE=$MYSQL_DATABASE -e MYSQL_USER=$MYSQL_USER \
        -e MYSQL_PASSWORD=$MYSQL_PASSWORD -p 3306:3306 -d mysql:8.0
fi

# Wait for MySQL to be ready
echo "Waiting for MySQL to initialize..."
while ! docker exec -i mysql-container mysqladmin ping -h "127.0.0.1" --silent; do
    echo "Waiting for MySQL server to be ready..."
    sleep 2
done

# Test MySQL connection
if docker exec -i mysql-container mysql -u$MYSQL_USER -p$MYSQL_PASSWORD -e "USE $MYSQL_DATABASE;"; then
    echo "MySQL database and user successfully set up."
else
    echo "MySQL setup failed. Check container logs."
    docker logs mysql-container
fi

# Final message
echo "Docker and MySQL are set up and running."
