#!/bin/bash

# Bootstrap Terraform S3 Backend
# 🏠 LOCAL DEVELOPMENT ONLY
#
# This script creates the S3 bucket needed for Terraform state management.
# For CI/CD deployments, use GitHub Actions workflows instead.
# See .github/workflows/deploy.yml for production deployments.
#
set -e

# Configuration
AWS_REGION="us-east-1"
BUCKET_NAME="ai-interview-prep-terraform-state"
PROJECT_NAME="ai-interview-prep"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Bootstrapping Terraform Backend${NC}"
echo -e "${BLUE}==============================${NC}"
echo ""
echo -e "Bucket: ${YELLOW}$BUCKET_NAME${NC}"
echo -e "Region: ${YELLOW}$AWS_REGION${NC}"
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

# Create S3 bucket if it doesn't exist
echo -e "${BLUE}Creating S3 bucket for Terraform state...${NC}"
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo -e "${GREEN}✓ S3 bucket '$BUCKET_NAME' already exists${NC}"
else
    # Create bucket
    if [ "$AWS_REGION" = "us-east-1" ]; then
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION"
    else
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION" \
            --create-bucket-configuration LocationConstraint="$AWS_REGION"
    fi
    
    # Enable versioning
    aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" \
        --versioning-configuration Status=Enabled
    
    # Enable encryption
    aws s3api put-bucket-encryption --bucket "$BUCKET_NAME" \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }]
        }'
    
    # Block public access
    aws s3api put-public-access-block --bucket "$BUCKET_NAME" \
        --public-access-block-configuration \
        BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
    
    # Add tags
    aws s3api put-bucket-tagging --bucket "$BUCKET_NAME" \
        --tagging 'TagSet=[
            {Key=Project,Value='$PROJECT_NAME'},
            {Key=Purpose,Value=TerraformState},
            {Key=ManagedBy,Value=Bootstrap}
        ]'
    
    echo -e "${GREEN}✓ S3 bucket '$BUCKET_NAME' created and configured${NC}"
fi

echo ""
echo -e "${GREEN}✓ Terraform backend bootstrap completed successfully!${NC}"
echo ""
echo -e "${BLUE}Backend Configuration:${NC}"
echo -e "  bucket  = \"$BUCKET_NAME\""
echo -e "  region  = \"$AWS_REGION\""
echo -e "  encrypt = true"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Your Terraform configurations are already set up to use this backend"
echo -e "2. Run: ${GREEN}terraform init${NC} in your environment directory"
echo -e "3. Deploy infrastructure: ${GREEN}./scripts/deploy-infrastructure.sh -e dev${NC}"
echo ""