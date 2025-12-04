#!/bin/bash

# Build the project
echo "Building project..."
yarn build

# Add and commit the dist folder to main branch
echo "Committing build files..."
git add .
git commit -m "Update build files"

# Push to main branch
echo "Pushing to GitHub..."
git push origin main

echo "Deployment complete! Access your site at: https://rishpandey.github.io/my-habitica/"
