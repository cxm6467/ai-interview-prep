#!/bin/bash

# Quick AWS SSO browser login
# This script opens your browser for AWS SSO authentication

echo "🌐 Opening browser for AWS SSO login..."

# Check if terraform profile exists
if aws configure list --profile terraform &>/dev/null; then
    # Profile exists, just login
    aws sso login --profile terraform
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully logged in to AWS!"
        echo "💡 Current identity:"
        AWS_PROFILE=terraform aws sts get-caller-identity --output table
        echo ""
        echo "🚀 Ready to deploy! Run: npm run deploy"
    else
        echo "❌ Login failed. You may need to reconfigure SSO."
        echo "💡 Run: npm run aws:login"
    fi
else
    echo "❌ No terraform profile found."
    echo "💡 Run the full setup first: npm run aws:login"
    exit 1
fi