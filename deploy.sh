#!/bin/bash

# Build the project
echo "Building project..."
yarn build

# Remove old docs folder if it exists
rm -rf docs

# Move dist to docs
echo "Moving build to docs folder..."
mv dist docs

# Add and commit the docs folder to main branch
echo "Committing build files..."
git add .
git commit -m "Update build files"

# Push to main branch
echo "Pushing to GitHub..."
git push origin main

echo "Deployment complete! Access your site at: https://rishpandey.github.io/my-habitica/"
echo "Make sure to configure GitHub Pages to serve from the /docs folder on main branch."
