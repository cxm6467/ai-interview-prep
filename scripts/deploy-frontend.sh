#!/bin/bash

# AI Interview Prep - Frontend Deployment Script  
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
    echo "  -b, --build-only               Only build the frontend, don't deploy"
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
FRONTEND_DIR="$PROJECT_ROOT/apps/frontend"
TERRAFORM_DIR="$PROJECT_ROOT/iac/environments/$ENVIRONMENT"

echo -e "${BLUE}AI Interview Prep - Frontend Deployment${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Build only: ${YELLOW}$BUILD_ONLY${NC}"
echo ""

# Check if frontend directory exists
if [[ ! -d "$FRONTEND_DIR" ]]; then
    echo -e "${RED}Error: Frontend directory '$FRONTEND_DIR' does not exist${NC}"
    exit 1
fi

cd "$FRONTEND_DIR"

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
fi

# Build the frontend
echo -e "${BLUE}Building frontend application...${NC}"
if [[ "$ENVIRONMENT" == "prod" ]]; then
    NODE_ENV=production npm run build
else
    npm run build
fi

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ Frontend build completed successfully!${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

# Exit if build-only mode
if [[ "$BUILD_ONLY" == "true" ]]; then
    echo -e "${GREEN}Build completed. Skipping deployment (build-only mode).${NC}"
    exit 0
fi

# Get S3 bucket name from Terraform output
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

# Get S3 bucket name and CloudFront distribution ID
S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
CLOUDFRONT_DIST_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")

if [[ -z "$S3_BUCKET" ]]; then
    echo -e "${RED}Error: Could not get S3 bucket name from Terraform output${NC}"
    echo "Please ensure infrastructure is deployed: ./scripts/deploy-infrastructure.sh -e $ENVIRONMENT -a apply"
    exit 1
fi

if [[ -z "$CLOUDFRONT_DIST_ID" ]]; then
    echo -e "${RED}Error: Could not get CloudFront distribution ID from Terraform output${NC}"
    echo "Please ensure infrastructure is deployed: ./scripts/deploy-infrastructure.sh -e $ENVIRONMENT -a apply"
    exit 1
fi

echo -e "S3 Bucket: ${YELLOW}$S3_BUCKET${NC}"
echo -e "CloudFront Distribution: ${YELLOW}$CLOUDFRONT_DIST_ID${NC}"
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

# Deploy to S3
echo -e "${BLUE}Deploying frontend to S3...${NC}"
cd "$FRONTEND_DIR"

aws s3 sync dist/ "s3://$S3_BUCKET/" --delete --exact-timestamps

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ Frontend deployed to S3 successfully!${NC}"
else
    echo -e "${RED}✗ Failed to deploy frontend to S3${NC}"
    exit 1
fi

# Invalidate CloudFront cache
echo -e "${BLUE}Invalidating CloudFront cache...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DIST_ID" \
    --paths "/*" \
    --output text \
    --query 'Invalidation.Id')

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ CloudFront invalidation created: $INVALIDATION_ID${NC}"
    echo -e "${YELLOW}Note: It may take a few minutes for the invalidation to complete.${NC}"
else
    echo -e "${RED}✗ Failed to create CloudFront invalidation${NC}"
    echo -e "${YELLOW}The deployment was successful, but cache may need manual clearing.${NC}"
fi

# Get the frontend URL
FRONTEND_URL=$(cd "$TERRAFORM_DIR" && terraform output -raw cloudfront_distribution_url 2>/dev/null || echo "")

echo ""
echo -e "${GREEN}✓ Frontend deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}Frontend URL:${NC} ${YELLOW}$FRONTEND_URL${NC}"
echo ""