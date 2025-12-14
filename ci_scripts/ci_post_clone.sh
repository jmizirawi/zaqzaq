#!/bin/sh

# Fail on error
set -e

echo "Starting ci_post_clone.sh..."

# Install Node.js using Homebrew
echo "Installing Node.js..."
brew install node
node -v
npm -v

# Install Rust
echo "Installing Rust..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustc --version
cargo --version

# Install Project Dependencies
echo "Installing npm dependencies..."
npm install

# Build the frontend explicitly to ensure dist/ exists
echo "Building frontend..."
npm run build

echo "ci_post_clone.sh completed successfully."
