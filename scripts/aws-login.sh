#!/bin/bash

# AWS CLI Browser Authentication Script
# This script provides multiple ways to authenticate with AWS CLI

set -e

echo "🚀 AWS Authentication Setup"
echo "=========================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   curl \"https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip\" -o \"awscliv2.zip\""
    echo "   unzip awscliv2.zip"
    echo "   sudo ./aws/install"
    exit 1
fi

# Function to check if we're already authenticated
check_auth() {
    if aws sts get-caller-identity &> /dev/null; then
        echo "✅ Already authenticated with AWS"
        aws sts get-caller-identity --output table
        return 0
    else
        return 1
    fi
}

# Function for SSO login (recommended)
sso_login() {
    echo "🔐 Setting up AWS SSO authentication..."
    echo ""
    echo "You'll need:"
    echo "- SSO start URL (e.g., https://my-company.awsapps.com/start)"
    echo "- SSO region (e.g., us-east-1)"
    echo "- Account ID and role name"
    echo ""
    
    read -p "Enter your SSO start URL: " SSO_START_URL
    read -p "Enter your SSO region [us-east-1]: " SSO_REGION
    SSO_REGION=${SSO_REGION:-us-east-1}
    
    read -p "Enter your AWS account ID: " ACCOUNT_ID
    read -p "Enter your role name [AdministratorAccess]: " ROLE_NAME
    ROLE_NAME=${ROLE_NAME:-AdministratorAccess}
    
    read -p "Enter your preferred region [us-east-1]: " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
    
    # Configure SSO profile
    aws configure set sso_start_url "$SSO_START_URL" --profile terraform
    aws configure set sso_region "$SSO_REGION" --profile terraform
    aws configure set sso_account_id "$ACCOUNT_ID" --profile terraform
    aws configure set sso_role_name "$ROLE_NAME" --profile terraform
    aws configure set region "$AWS_REGION" --profile terraform
    aws configure set output json --profile terraform
    
    echo "🌐 Opening browser for SSO authentication..."
    aws sso login --profile terraform
    
    echo "✅ SSO authentication complete!"
    echo "💡 To use this profile, set: export AWS_PROFILE=terraform"
}

# Function for browser-based login (AWS CLI v2 feature)
browser_login() {
    echo "🌐 Opening browser for AWS authentication..."
    echo ""
    echo "This will open your default browser to sign in to AWS Console."
    echo "After signing in, you'll get temporary credentials."
    echo ""
    
    # This requires AWS CLI v2 with browser support
    if aws configure list | grep -q "sso_"; then
        aws sso login
    else
        echo "📝 Browser login requires SSO configuration. Let's set that up..."
        sso_login
    fi
}

# Function for access key authentication
access_key_login() {
    echo "🔑 Setting up access key authentication..."
    echo ""
    echo "⚠️  Note: This method stores long-term credentials locally."
    echo "   SSO login is more secure for interactive use."
    echo ""
    
    read -p "Enter your AWS Access Key ID: " AWS_ACCESS_KEY_ID
    read -s -p "Enter your AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
    echo ""
    read -p "Enter your preferred region [us-east-1]: " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
    
    aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID" --profile terraform
    aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY" --profile terraform
    aws configure set region "$AWS_REGION" --profile terraform
    aws configure set output json --profile terraform
    
    echo "✅ Access key authentication configured!"
}

# Main menu
main() {
    if check_auth; then
        echo ""
        read -p "Do you want to reconfigure? (y/N): " RECONFIGURE
        if [[ ! "$RECONFIGURE" =~ ^[Yy]$ ]]; then
            echo "👍 You're all set!"
            exit 0
        fi
    fi
    
    echo ""
    echo "Choose authentication method:"
    echo "1) AWS SSO (Recommended - browser-based)"
    echo "2) Access Keys (IAM user credentials)"
    echo "3) Check current authentication status"
    echo "4) Exit"
    echo ""
    
    read -p "Enter your choice (1-4): " CHOICE
    
    case $CHOICE in
        1)
            sso_login
            ;;
        2)
            access_key_login
            ;;
        3)
            check_auth
            ;;
        4)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            main
            ;;
    esac
    
    echo ""
    echo "🎯 Testing authentication..."
    if check_auth; then
        echo ""
        echo "🎉 Success! You're now authenticated with AWS."
        echo ""
        echo "💡 Next steps:"
        echo "   - Run 'export AWS_PROFILE=terraform' to use this profile"
        echo "   - Run 'npm run deploy' to deploy your infrastructure"
        echo "   - Run 'aws configure list' to see current configuration"
    else
        echo "❌ Authentication failed. Please try again."
        exit 1
    fi
}

# Run the main function
main