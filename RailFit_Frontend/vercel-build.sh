#!/bin/bash

# Clean install dependencies
npm ci --production=false

# Build the project
npm run build

# Verify build output
ls -la dist/

echo "Build completed successfully"