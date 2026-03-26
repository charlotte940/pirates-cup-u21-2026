#!/bin/bash

echo "🏴‍☠️ Pirates Cup U21 2026 - Deployment Script"
echo "=============================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
echo "🔐 Checking Firebase login status..."
firebase login:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "🔐 Please login to Firebase..."
    firebase login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build succeeded
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Your app is now live at:"
    firebase hosting:channel:list 2>/dev/null | grep -o 'https://[^ ]*' | head -1
else
    echo "❌ Deployment failed. Please check the errors above."
fi
