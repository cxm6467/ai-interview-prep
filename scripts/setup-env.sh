#!/bin/bash

# Environment Setup Script
# Handles environment variable loading and validation

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Default environment
ENVIRONMENT=${ENVIRONMENT:-development}

echo -e "${CYAN}🔧 AI Interview Prep - Environment Setup${NC}"
echo -e "${CYAN}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Function to load environment file
load_env_file() {
    local env_file=$1
    if [ -f "$env_file" ]; then
        echo -e "${GREEN}✅ Loading $env_file${NC}"
        set -a  # automatically export all variables
        source "$env_file"
        set +a
    else
        echo -e "${YELLOW}⚠️  $env_file not found${NC}"
        return 1
    fi
}

# Function to create .env from example if it doesn't exist
create_env_if_missing() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  .env file not found${NC}"
        if [ -f ".env.example" ]; then
            echo -e "${BLUE}📝 Creating .env from .env.example${NC}"
            cp .env.example .env
            echo -e "${YELLOW}⚠️  Please edit .env file and add your API keys${NC}"
            return 1
        else
            echo -e "${RED}❌ .env.example not found${NC}"
            return 1
        fi
    fi
}

# Function to validate required environment variables
validate_required_vars() {
    local missing_vars=()
    
    # Check required variables
    if [ -z "$OPENAI_API_KEY" ]; then
        missing_vars+=("OPENAI_API_KEY")
    fi
    
    # Warn about AWS credentials
    if [ -z "$AWS_PROFILE" ] && [ -z "$AWS_ACCESS_KEY_ID" ]; then
        echo -e "${YELLOW}⚠️  Neither AWS_PROFILE nor AWS_ACCESS_KEY_ID is set${NC}"
        echo -e "${YELLOW}   Run 'npm run aws:login' to configure AWS authentication${NC}"
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        for var in "${missing_vars[@]}"; do
            echo -e "${RED}   - $var${NC}"
        done
        return 1
    fi
    
    return 0
}

# Function to auto-detect AWS account ID
detect_aws_account() {
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        echo -e "${BLUE}🔍 Detecting AWS account ID...${NC}"
        if command -v aws &> /dev/null; then
            AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
            if [ -n "$AWS_ACCOUNT_ID" ]; then
                echo -e "${GREEN}✅ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
                export AWS_ACCOUNT_ID
            else
                echo -e "${YELLOW}⚠️  Could not detect AWS account ID${NC}"
            fi
        fi
    fi
}

# Function to show current environment status
show_env_status() {
    echo -e "${CYAN}📊 Environment Status:${NC}"
    echo "  Environment: ${ENVIRONMENT:-not set}"
    echo "  App Name: ${APP_NAME:-not set}"
    echo "  AWS Region: ${AWS_REGION:-not set}"
    echo "  AWS Profile: ${AWS_PROFILE:-not set}"
    echo "  AWS Account ID: ${AWS_ACCOUNT_ID:-not detected}"
    echo "  OpenAI API Key: ${OPENAI_API_KEY:+✅ Set}${OPENAI_API_KEY:-❌ Not set}"
    echo "  Debug Mode: ${DEBUG:-false}"
    echo ""
    echo "  🌐 Domain Configuration:"
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "  Custom Domain: dev.${SUBDOMAIN:-ai-ip}.${DOMAIN_NAME:-chrismarasco.io}"
    else
        echo "  Custom Domain: ${SUBDOMAIN:-ai-ip}.${DOMAIN_NAME:-chrismarasco.io}"
    fi
    echo "  Route 53 Records: ${CREATE_ROUTE53_RECORDS:-true}"
    echo ""
}

# Function to export environment for child processes
export_env() {
    # Export common variables
    export ENVIRONMENT
    export APP_NAME
    export AWS_REGION
    export AWS_PROFILE
    export AWS_ACCOUNT_ID
    export OPENAI_API_KEY
    export DEBUG
    export LAMBDA_TIMEOUT
    export LAMBDA_MEMORY
    export LOG_RETENTION_DAYS
    
    # Export TF_VAR_ variables for Terraform
    export TF_VAR_aws_region="$AWS_REGION"
    export TF_VAR_environment="$ENVIRONMENT"
    export TF_VAR_app_name="$APP_NAME"
    export TF_VAR_openai_api_key="$OPENAI_API_KEY"
    export TF_VAR_lambda_timeout="${LAMBDA_TIMEOUT:-120}"
    export TF_VAR_lambda_memory="${LAMBDA_MEMORY:-1024}"
    export TF_VAR_log_retention_days="${LOG_RETENTION_DAYS:-14}"
    export TF_VAR_domain_name="${DOMAIN_NAME:-chrismarasco.io}"
    export TF_VAR_subdomain="${SUBDOMAIN:-ai-ip}"
    export TF_VAR_create_route53_records="${CREATE_ROUTE53_RECORDS:-true}"
}

# Main function
main() {
    local action="${1:-validate}"
    
    case "$action" in
        "validate")
            # Load environment files in order
            load_env_file ".env.${ENVIRONMENT}" || true
            create_env_if_missing || exit 1
            load_env_file ".env" || exit 1
            
            # Validate and detect
            detect_aws_account
            show_env_status
            
            if validate_required_vars; then
                echo -e "${GREEN}✅ Environment validation passed${NC}"
                export_env
            else
                echo -e "${RED}❌ Environment validation failed${NC}"
                echo ""
                echo -e "${BLUE}💡 Quick setup:${NC}"
                echo "  1. Copy .env.example to .env: cp .env.example .env"
                echo "  2. Edit .env and add your OPENAI_API_KEY"
                echo "  3. Run AWS authentication: npm run aws:login"
                exit 1
            fi
            ;;
            
        "init")
            echo -e "${BLUE}🚀 Initializing environment...${NC}"
            if [ ! -f ".env" ]; then
                cp .env.example .env
                echo -e "${GREEN}✅ Created .env from template${NC}"
            fi
            
            if [ ! -f ".env.${ENVIRONMENT}" ]; then
                echo -e "${YELLOW}⚠️  Environment file .env.${ENVIRONMENT} not found${NC}"
                echo "Using default .env file only"
            fi
            
            echo -e "${CYAN}📝 Next steps:${NC}"
            echo "  1. Edit .env file and add your OPENAI_API_KEY"
            echo "  2. Run: npm run aws:login"
            echo "  3. Run: npm run setup:env validate"
            ;;
            
        "show")
            load_env_file ".env.${ENVIRONMENT}" || true
            load_env_file ".env" || true
            show_env_status
            ;;
            
        "export")
            # Used by other scripts to load environment
            load_env_file ".env.${ENVIRONMENT}" || true
            load_env_file ".env" || true
            export_env
            ;;
            
        *)
            echo "Usage: $0 {validate|init|show|export}"
            echo ""
            echo "Commands:"
            echo "  validate  - Validate and load environment (default)"
            echo "  init      - Initialize environment files"
            echo "  show      - Show current environment status"
            echo "  export    - Load and export environment variables"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"