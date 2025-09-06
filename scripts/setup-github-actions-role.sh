#!/bin/bash

# Setup GitHub Actions IAM Role
# This script creates the IAM role needed for GitHub Actions OIDC authentication

set -e

# Configuration
AWS_REGION="us-east-1"
ROLE_NAME="ai-interview-prep-github-actions-role"
GITHUB_REPO="cxm6467/ai-interview-prep"
OIDC_PROVIDER_URL="https://token.actions.githubusercontent.com"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up GitHub Actions IAM Role${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""
echo -e "Role Name: ${YELLOW}$ROLE_NAME${NC}"
echo -e "GitHub Repo: ${YELLOW}$GITHUB_REPO${NC}"
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
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --output text --query 'Account')
echo -e "${GREEN}✓ AWS credentials valid: $AWS_IDENTITY${NC}"
echo -e "${GREEN}✓ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
echo ""

# Check if GitHub OIDC provider exists
echo -e "${BLUE}Checking GitHub OIDC provider...${NC}"
if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ GitHub OIDC provider already exists${NC}"
else
    echo -e "${YELLOW}Creating GitHub OIDC provider...${NC}"
    
    # Get GitHub's thumbprint
    THUMBPRINT="6938fd4d98bab03faadb97b34396831e3780aea1"
    
    aws iam create-open-id-connect-provider \
        --url "$OIDC_PROVIDER_URL" \
        --client-id-list "sts.amazonaws.com" \
        --thumbprint-list "$THUMBPRINT" \
        --tags Key=Project,Value=ai-interview-prep Key=ManagedBy,Value=Script
    
    echo -e "${GREEN}✓ GitHub OIDC provider created${NC}"
fi

# Create trust policy
TRUST_POLICY=$(cat << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
EOF
)

# Check if role exists
echo -e "${BLUE}Checking IAM role...${NC}"
if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ IAM role '$ROLE_NAME' already exists${NC}"
    
    # Update trust policy
    echo -e "${BLUE}Updating trust policy...${NC}"
    aws iam update-assume-role-policy --role-name "$ROLE_NAME" --policy-document "$TRUST_POLICY"
    echo -e "${GREEN}✓ Trust policy updated${NC}"
else
    echo -e "${YELLOW}Creating IAM role...${NC}"
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document "$TRUST_POLICY" \
        --description "GitHub Actions OIDC role for ai-interview-prep project" \
        --tags Key=Project,Value=ai-interview-prep Key=ManagedBy,Value=Script
    
    echo -e "${GREEN}✓ IAM role '$ROLE_NAME' created${NC}"
fi

# Attach policy
echo -e "${BLUE}Attaching IAM policy...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POLICY_FILE="$SCRIPT_DIR/../iac/github-actions-iam-policy.json"

if [ ! -f "$POLICY_FILE" ]; then
    echo -e "${RED}Error: Policy file not found at $POLICY_FILE${NC}"
    exit 1
fi

aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "ai-interview-prep-deployment-policy" \
    --policy-document file://"$POLICY_FILE"

echo -e "${GREEN}✓ IAM policy attached${NC}"

# Get role ARN
ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${ROLE_NAME}"

echo ""
echo -e "${GREEN}✓ GitHub Actions IAM role setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Role ARN:${NC} ${YELLOW}$ROLE_ARN${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Go to your GitHub repository settings"
echo -e "2. Navigate to Settings > Secrets and variables > Actions"
echo -e "3. Add a new repository secret:"
echo -e "   Name: ${GREEN}AWS_ROLE_ARN${NC}"
echo -e "   Value: ${GREEN}$ROLE_ARN${NC}"
echo -e "4. Add your OpenAI API key:"
echo -e "   Name: ${GREEN}OPENAI_API_KEY${NC}"
echo -e "   Value: ${GREEN}sk-your-openai-api-key-here${NC}"
echo ""
echo -e "${YELLOW}After adding these secrets, you can run deployments!${NC}"
echo ""