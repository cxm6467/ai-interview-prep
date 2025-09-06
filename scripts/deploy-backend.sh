#!/bin/bash

# AI Interview Prep - Backend Deployment Script
# 🏠 LOCAL DEVELOPMENT ONLY
# 
# This script is intended for local development and testing.
# For CI/CD deployments, use GitHub Actions workflows instead.
# See .github/workflows/deploy.yml for production deployments.
#
set -e

# Default values
ENVIRONMENT="dev"
BUILD_ONLY=false

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENVIRONMENT   Environment to deploy to (dev, staging, prod) [default: dev]"
    echo "  -b, --build-only               Only build the backend, don't deploy"
    echo "  -h, --help                     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e dev                      # Build and deploy to dev environment"
    echo "  $0 -e prod -b                  # Only build for production"
    echo ""
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'. Must be one of: dev, staging, prod${NC}"
    exit 1
fi

# Set working directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"
TERRAFORM_DIR="$PROJECT_ROOT/iac/environments/$ENVIRONMENT"
BUILD_DIR="$PROJECT_ROOT/build"

echo -e "${BLUE}AI Interview Prep - Backend Deployment${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Build only: ${YELLOW}$BUILD_ONLY${NC}"
echo ""

# Check if backend directory exists
if [[ ! -d "$BACKEND_DIR" ]]; then
    echo -e "${RED}Error: Backend directory '$BACKEND_DIR' does not exist${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    npm install
fi

# Create build directory
mkdir -p "$BUILD_DIR"

# Build the backend
echo -e "${BLUE}Building backend application...${NC}"

# Compile TypeScript
npx tsc

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ TypeScript compilation completed successfully!${NC}"
else
    echo -e "${RED}✗ TypeScript compilation failed${NC}"
    exit 1
fi

# Create deployment package
echo -e "${BLUE}Creating deployment package...${NC}"

# Create a temporary directory for the deployment package
TEMP_DIR=$(mktemp -d)
PACKAGE_NAME="backend-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S).zip"
PACKAGE_PATH="$BUILD_DIR/$PACKAGE_NAME"

# Copy built files
cp -r dist/* "$TEMP_DIR/"

# Copy package.json and only production dependencies
cp package.json "$TEMP_DIR/"
cd "$TEMP_DIR"
npm install --only=production --no-dev

# Create the zip package
cd "$TEMP_DIR"
zip -r "$PACKAGE_PATH" .

# Clean up temp directory
rm -rf "$TEMP_DIR"

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ Deployment package created: $PACKAGE_NAME${NC}"
else
    echo -e "${RED}✗ Failed to create deployment package${NC}"
    exit 1
fi

# Exit if build-only mode
if [[ "$BUILD_ONLY" == "true" ]]; then
    echo -e "${GREEN}Build completed. Package available at: $PACKAGE_PATH${NC}"
    echo -e "${GREEN}Skipping deployment (build-only mode).${NC}"
    exit 0
fi

# Get Lambda function name from Terraform output
echo -e "${BLUE}Getting deployment information from Terraform...${NC}"
if [[ ! -d "$TERRAFORM_DIR" ]]; then
    echo -e "${RED}Error: Infrastructure environment directory '$TERRAFORM_DIR' does not exist${NC}"
    echo "Please deploy infrastructure first using: ./scripts/deploy-infrastructure.sh -e $ENVIRONMENT -a apply"
    exit 1
fi

cd "$TERRAFORM_DIR"

# Check if Terraform state exists
if [[ ! -f "terraform.tfstate" ]]; then
    echo -e "${RED}Error: No Terraform state found. Please deploy infrastructure first.${NC}"
    echo "Run: ./scripts/deploy-infrastructure.sh -e $ENVIRONMENT -a apply"
    exit 1
fi

# Get Lambda function name
LAMBDA_FUNCTION_NAME=$(terraform output -raw lambda_function_name 2>/dev/null || echo "")

if [[ -z "$LAMBDA_FUNCTION_NAME" ]]; then
    echo -e "${RED}Error: Could not get Lambda function name from Terraform output${NC}"
    echo "Please ensure infrastructure is deployed: ./scripts/deploy-infrastructure.sh -e $ENVIRONMENT -a apply"
    exit 1
fi

echo -e "Lambda Function: ${YELLOW}$LAMBDA_FUNCTION_NAME${NC}"
echo ""

# Check AWS credentials
echo -e "${BLUE}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo -e "${RED}Error: AWS credentials not configured or invalid${NC}"
    echo "Please run: aws configure"
    exit 1
fi

AWS_IDENTITY=$(aws sts get-caller-identity --output text --query 'Arn')
echo -e "${GREEN}✓ AWS credentials valid: $AWS_IDENTITY${NC}"
echo ""

# Deploy to Lambda
echo -e "${BLUE}Deploying backend to Lambda...${NC}"

aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --zip-file "fileb://$PACKAGE_PATH"

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ Backend deployed to Lambda successfully!${NC}"
else
    echo -e "${RED}✗ Failed to deploy backend to Lambda${NC}"
    exit 1
fi

# Wait for update to complete and check status
echo -e "${BLUE}Waiting for Lambda update to complete...${NC}"
sleep 5

UPDATE_STATUS=$(aws lambda get-function \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --query 'Configuration.LastUpdateStatus' \
    --output text)

if [[ "$UPDATE_STATUS" == "Successful" ]]; then
    echo -e "${GREEN}✓ Lambda update completed successfully!${NC}"
elif [[ "$UPDATE_STATUS" == "InProgress" ]]; then
    echo -e "${YELLOW}⏳ Lambda update still in progress...${NC}"
    # Wait a bit more and check again
    sleep 10
    UPDATE_STATUS=$(aws lambda get-function \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --query 'Configuration.LastUpdateStatus' \
        --output text)
    
    if [[ "$UPDATE_STATUS" == "Successful" ]]; then
        echo -e "${GREEN}✓ Lambda update completed successfully!${NC}"
    else
        echo -e "${RED}✗ Lambda update failed or is taking too long${NC}"
        echo -e "${YELLOW}Status: $UPDATE_STATUS${NC}"
        
        # Try to get the reason for failure
        UPDATE_REASON=$(aws lambda get-function \
            --function-name "$LAMBDA_FUNCTION_NAME" \
            --query 'Configuration.LastUpdateStatusReason' \
            --output text 2>/dev/null || echo "Unknown")
        echo -e "${YELLOW}Reason: $UPDATE_REASON${NC}"
    fi
else
    echo -e "${RED}✗ Lambda update failed${NC}"
    echo -e "${YELLOW}Status: $UPDATE_STATUS${NC}"
    
    # Try to get the reason for failure
    UPDATE_REASON=$(aws lambda get-function \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --query 'Configuration.LastUpdateStatusReason' \
        --output text 2>/dev/null || echo "Unknown")
    echo -e "${YELLOW}Reason: $UPDATE_REASON${NC}"
fi

# Get the API URL
API_URL=$(cd "$TERRAFORM_DIR" && terraform output -raw api_gateway_url 2>/dev/null || echo "")

echo ""
echo -e "${GREEN}✓ Backend deployment completed!${NC}"
echo ""
echo -e "${BLUE}API URL:${NC} ${YELLOW}$API_URL${NC}"
echo -e "${BLUE}Package:${NC} ${YELLOW}$PACKAGE_PATH${NC}"
echo ""