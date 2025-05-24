#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Find or install Homebrew
if ! command_exists brew; then
    echo "Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    export PATH="/opt/homebrew/bin:$PATH" # Ensure the correct path is set for Apple Silicon
else
    echo "Homebrew is already installed."
fi

# Find or install Git
if ! command_exists git; then
    echo "Git not found. Installing..."
    brew install git
else
    echo "Git is already installed."
fi

# Find or install Python 3
if ! command_exists python3; then
    echo "Python 3 not found. Installing..."
    brew install python
else
    echo "Python 3 is already installed."
fi

# Find or install NVM + Node.js
if ! command_exists nvm; then
    echo "NVM not found. Installing..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # Load NVM
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # Load NVM bash_completion
else
    echo "NVM is already installed."
fi

if ! command_exists node; then
    echo "Node.js not found. Installing latest LTS version..."
    nvm install --lts
else
    echo "Node.js is already installed."
fi

# Find or install K6
if ! command_exists k6; then
    echo "k6 not found. Installing..."
    brew install k6
else
    echo "k6 is already installed."
fi

