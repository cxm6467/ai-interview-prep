#!/bin/bash

# AI Interview Prep - Infrastructure Deployment Script
# 🏠 LOCAL DEVELOPMENT ONLY  
#
# This script is intended for local development and testing.
# For CI/CD deployments, use GitHub Actions workflows instead.
# See .github/workflows/deploy.yml for production deployments.
#
set -e

# Default values
ENVIRONMENT="dev"
ACTION="plan"
AUTO_APPROVE=false

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
    echo "  -e, --environment ENVIRONMENT   Environment to deploy (dev, staging, prod) [default: dev]"
    echo "  -a, --action ACTION            Action to perform (plan, apply, destroy) [default: plan]"
    echo "  -y, --auto-approve             Auto-approve apply/destroy actions"
    echo "  -h, --help                     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e dev -a plan              # Plan dev environment changes"
    echo "  $0 -e dev -a apply -y          # Apply dev environment changes with auto-approval"
    echo "  $0 -e prod -a destroy          # Destroy prod environment (requires manual confirmation)"
    echo ""
    echo "Environment Variables:"
    echo "  OPENAI_API_KEY                 OpenAI API key (required)"
    echo "  AWS_PROFILE                    AWS profile to use (optional)"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--action)
            ACTION="$2"
            shift 2
            ;;
        -y|--auto-approve)
            AUTO_APPROVE=true
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

# Validate action
if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
    echo -e "${RED}Error: Invalid action '$ACTION'. Must be one of: plan, apply, destroy${NC}"
    exit 1
fi

# Check required environment variables
if [[ -z "$OPENAI_API_KEY" ]]; then
    echo -e "${RED}Error: OPENAI_API_KEY environment variable is required${NC}"
    exit 1
fi

# Set working directory
TERRAFORM_DIR="iac/environments/$ENVIRONMENT"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$PROJECT_ROOT/$TERRAFORM_DIR"

echo -e "${BLUE}AI Interview Prep - Infrastructure Deployment${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Action: ${YELLOW}$ACTION${NC}"
echo -e "Working Directory: ${YELLOW}$WORK_DIR${NC}"
echo -e "Auto-approve: ${YELLOW}$AUTO_APPROVE${NC}"
echo ""

# Check if working directory exists
if [[ ! -d "$WORK_DIR" ]]; then
    echo -e "${RED}Error: Infrastructure environment directory '$WORK_DIR' does not exist${NC}"
    exit 1
fi

cd "$WORK_DIR"

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

# Initialize Terraform
echo -e "${BLUE}Initializing Terraform...${NC}"
terraform init

# Validate Terraform configuration
echo -e "${BLUE}Validating Terraform configuration...${NC}"
terraform validate
echo -e "${GREEN}✓ Terraform configuration is valid${NC}"
echo ""

# Perform the requested action
case $ACTION in
    plan)
        echo -e "${BLUE}Running Terraform plan...${NC}"
        terraform plan -var="openai_api_key=$OPENAI_API_KEY"
        ;;
    apply)
        echo -e "${BLUE}Running Terraform apply...${NC}"
        if [[ "$AUTO_APPROVE" == "true" ]]; then
            terraform apply -auto-approve -var="openai_api_key=$OPENAI_API_KEY"
        else
            terraform apply -var="openai_api_key=$OPENAI_API_KEY"
        fi
        
        if [[ $? -eq 0 ]]; then
            echo ""
            echo -e "${GREEN}✓ Infrastructure deployed successfully!${NC}"
            echo ""
            echo -e "${BLUE}Deployment URLs:${NC}"
            terraform output
        fi
        ;;
    destroy)
        echo -e "${YELLOW}WARNING: This will destroy all resources in the $ENVIRONMENT environment!${NC}"
        if [[ "$AUTO_APPROVE" != "true" ]]; then
            read -p "Are you sure you want to continue? (yes/no): " -r
            if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
                echo "Aborted."
                exit 0
            fi
        fi
        
        echo -e "${BLUE}Running Terraform destroy...${NC}"
        if [[ "$AUTO_APPROVE" == "true" ]]; then
            terraform destroy -auto-approve -var="openai_api_key=$OPENAI_API_KEY"
        else
            terraform destroy -var="openai_api_key=$OPENAI_API_KEY"
        fi
        
        if [[ $? -eq 0 ]]; then
            echo ""
            echo -e "${GREEN}✓ Infrastructure destroyed successfully!${NC}"
        fi
        ;;
esac

echo ""
echo -e "${GREEN}Deployment script completed!${NC}"