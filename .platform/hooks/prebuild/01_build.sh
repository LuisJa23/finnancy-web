#!/bin/bash

# This script runs before the application is deployed
# It's the modern way to handle build steps in Elastic Beanstalk

set -e

echo "=== Starting prebuild hook ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Ensure we're in the correct directory
cd /var/app/staging

echo "=== Installing dependencies ==="
# Install dependencies including devDependencies needed for build
npm ci --include=dev

echo "=== Building application ==="
npm run build

echo "=== Verifying build output ==="
if [ -d "dist" ]; then
    echo "✓ dist directory exists"
    echo "Contents of dist directory:"
    ls -la dist/
    
    if [ -f "dist/index.html" ]; then
        echo "✓ dist/index.html exists"
        echo "✓ Build verification successful"
    else
        echo "✗ dist/index.html does not exist"
        exit 1
    fi
else
    echo "✗ dist directory does not exist"
    exit 1
fi

echo "=== Prebuild hook completed successfully ==="
