#!/bin/bash
# Health check script for AWS Elastic Beanstalk

echo "=== Health Check ==="
echo "Date: $(date)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PWD: $(pwd)"
echo "Files in current directory:"
ls -la
echo ""
echo "Files in dist directory:"
if [ -d "dist" ]; then
  ls -la dist/
  echo "dist/index.html exists: $(test -f dist/index.html && echo 'YES' || echo 'NO')"
else
  echo "dist directory does not exist"
fi
echo ""
echo "Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "NPM_CONFIG_PRODUCTION: $NPM_CONFIG_PRODUCTION"
echo "=== End Health Check ==="
