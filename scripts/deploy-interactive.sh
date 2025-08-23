#!/bin/bash

# Interactive Deployment Script with Dry Run Support
# Provides a guided deployment experience with safety checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "iac" ]; then
    echo -e "${RED}❌ Error: Must be run from the project root directory${NC}"
    exit 1
fi

# Banner
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    🚀 AI Interview Prep                       ║"
echo "║                  Interactive Deployment                       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    local missing_tools=()
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        missing_tools+=("AWS CLI v2")
    fi
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("Terraform")
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing_tools+=("Docker")
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("Node.js")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required tools:${NC}"
        for tool in "${missing_tools[@]}"; do
            echo "   - $tool"
        done
        exit 1
    fi
    
    echo -e "${GREEN}✅ All required tools are installed${NC}"
}

# Check AWS authentication
check_aws_auth() {
    echo -e "${BLUE}🔐 Checking AWS authentication...${NC}"
    
    if aws sts get-caller-identity &> /dev/null; then
        echo -e "${GREEN}✅ AWS authentication successful${NC}"
        echo -e "${CYAN}Current identity:${NC}"
        aws sts get-caller-identity --output table
    else
        echo -e "${YELLOW}⚠️  AWS not authenticated${NC}"
        read -p "Would you like to authenticate now? (y/N): " AUTH_NOW
        if [[ "$AUTH_NOW" =~ ^[Yy]$ ]]; then
            ./scripts/aws-login.sh
        else
            echo -e "${RED}❌ AWS authentication required for deployment${NC}"
            exit 1
        fi
    fi
}

# Check environment variables
check_env_vars() {
    echo -e "${BLUE}🔧 Checking environment variables...${NC}"
    
    if [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${YELLOW}⚠️  OPENAI_API_KEY not set${NC}"
        read -s -p "Enter your OpenAI API key: " OPENAI_API_KEY
        echo
        export OPENAI_API_KEY
    else
        echo -e "${GREEN}✅ OPENAI_API_KEY is set${NC}"
    fi
    
    if [ -z "$AWS_PROFILE" ]; then
        echo -e "${YELLOW}⚠️  AWS_PROFILE not set, using default${NC}"
    else
        echo -e "${GREEN}✅ AWS_PROFILE: $AWS_PROFILE${NC}"
    fi
}

# Show current infrastructure state
show_current_state() {
    echo -e "${BLUE}📊 Checking current infrastructure state...${NC}"
    
    cd iac
    
    if [ ! -f ".terraform/terraform.tfstate" ] && [ ! -f "terraform.tfstate" ]; then
        echo -e "${YELLOW}⚠️  No Terraform state found - this will be a fresh deployment${NC}"
        terraform init
    else
        echo -e "${GREEN}✅ Terraform state exists${NC}"
        
        # Show current resources
        echo -e "${CYAN}Current resources:${NC}"
        if terraform show -json 2>/dev/null | jq -r '.values.root_module.resources[]?.address' 2>/dev/null | head -10; then
            echo "  (showing first 10 resources)"
        else
            echo "  Unable to parse state (might be empty or corrupted)"
        fi
    fi
    
    cd ..
}

# Main deployment menu
main_menu() {
    echo ""
    echo -e "${PURPLE}🎯 What would you like to do?${NC}"
    echo ""
    echo "1) 🔍 Dry Run (Plan only - see what changes would be made)"
    echo "2) 🚀 Full Deploy (Build Docker + Deploy Infrastructure)"
    echo "3) 📋 Plan with Details (Detailed change analysis)"
    echo "4) 🐳 Docker Build Only (Build image without deploying)"
    echo "5) 🏗️  Infrastructure Only (Deploy without rebuilding Docker)"
    echo "6) 📊 Show Current State (View deployed resources)"
    echo "7) 🔄 Refresh State (Update Terraform state from AWS)"
    echo "8) 💥 Destroy Infrastructure (Plan destruction)"
    echo "9) 💀 Destroy Infrastructure (Execute destruction)"
    echo "10) ❌ Exit"
    echo ""
    
    read -p "Enter your choice (1-10): " CHOICE
    
    case $CHOICE in
        1)
            dry_run_deployment
            ;;
        2)
            full_deployment
            ;;
        3)
            detailed_plan
            ;;
        4)
            docker_build_only
            ;;
        5)
            infrastructure_only
            ;;
        6)
            show_detailed_state
            ;;
        7)
            refresh_state
            ;;
        8)
            plan_destroy
            ;;
        9)
            execute_destroy
            ;;
        10)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please try again.${NC}"
            main_menu
            ;;
    esac
}

# Dry run deployment
dry_run_deployment() {
    echo -e "${YELLOW}🔍 Running deployment dry run (plan only)...${NC}"
    echo ""
    echo -e "${CYAN}This will show you exactly what changes would be made without applying them.${NC}"
    echo ""
    
    cd iac
    echo -e "${BLUE}📋 Generating Terraform plan...${NC}"
    
    if terraform plan -var="openai_api_key=$OPENAI_API_KEY" -out=tfplan; then
        echo ""
        echo -e "${GREEN}✅ Plan generated successfully!${NC}"
        echo ""
        echo -e "${CYAN}Plan summary:${NC}"
        terraform show -no-color tfplan | grep -E "^(Plan:|#|~|+|-|\s+#)" | head -20
        echo ""
        
        read -p "Would you like to save this plan and apply it later? (y/N): " SAVE_PLAN
        if [[ "$SAVE_PLAN" =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}💾 Plan saved as 'tfplan' - you can apply it with: terraform apply tfplan${NC}"
        else
            rm -f tfplan
            echo -e "${YELLOW}🗑️  Plan discarded${NC}"
        fi
    else
        echo -e "${RED}❌ Plan failed! Please check the errors above.${NC}"
    fi
    
    cd ..
    post_action_menu
}

# Full deployment
full_deployment() {
    echo -e "${GREEN}🚀 Starting full deployment...${NC}"
    echo ""
    
    # Build Docker image first
    echo -e "${BLUE}🐳 Building Docker image...${NC}"
    if docker build -f iac/Dockerfile apps/backend -t consolidated-ai-handler:latest; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
    else
        echo -e "${RED}❌ Docker build failed!${NC}"
        post_action_menu
        return
    fi
    
    # Deploy infrastructure
    echo ""
    echo -e "${BLUE}🏗️  Deploying infrastructure...${NC}"
    cd iac
    
    # Run plan first for confirmation
    echo -e "${CYAN}📋 Generating plan for review...${NC}"
    if terraform plan -var="openai_api_key=$OPENAI_API_KEY" -out=tfplan; then
        echo ""
        echo -e "${YELLOW}⚠️  About to apply the above changes.${NC}"
        read -p "Continue with deployment? (y/N): " CONFIRM_DEPLOY
        
        if [[ "$CONFIRM_DEPLOY" =~ ^[Yy]$ ]]; then
            if terraform apply tfplan; then
                echo ""
                echo -e "${GREEN}🎉 Deployment successful!${NC}"
                
                # Get API Gateway URL
                API_URL=$(terraform output -raw api_gateway_url 2>/dev/null || echo "Not available")
                echo -e "${CYAN}📡 API Gateway URL: ${API_URL}${NC}"
                
                echo ""
                echo -e "${YELLOW}📝 Next steps:${NC}"
                echo "1. Update apps/frontend/src/services/aiAnalysis.ts with the API URL above"
                echo "2. Build and deploy the frontend: npm run build:frontend"
                echo "3. Test the API endpoint"
            else
                echo -e "${RED}❌ Deployment failed!${NC}"
            fi
        else
            echo -e "${YELLOW}🚫 Deployment cancelled${NC}"
        fi
        
        rm -f tfplan
    else
        echo -e "${RED}❌ Planning failed!${NC}"
    fi
    
    cd ..
    post_action_menu
}

# Detailed plan
detailed_plan() {
    echo -e "${BLUE}📋 Running detailed plan analysis...${NC}"
    
    cd iac
    terraform plan -detailed-exitcode -var="openai_api_key=$OPENAI_API_KEY"
    local exit_code=$?
    
    echo ""
    case $exit_code in
        0)
            echo -e "${GREEN}✅ No changes needed - infrastructure is up to date${NC}"
            ;;
        1)
            echo -e "${RED}❌ Plan failed with errors${NC}"
            ;;
        2)
            echo -e "${YELLOW}📝 Changes detected - infrastructure will be modified${NC}"
            ;;
    esac
    
    cd ..
    post_action_menu
}

# Docker build only
docker_build_only() {
    echo -e "${BLUE}🐳 Building Docker image only...${NC}"
    
    if docker build -f iac/Dockerfile apps/backend -t consolidated-ai-handler:latest; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
        echo ""
        echo -e "${CYAN}Image details:${NC}"
        docker images | grep consolidated-ai-handler
    else
        echo -e "${RED}❌ Docker build failed!${NC}"
    fi
    
    post_action_menu
}

# Infrastructure only
infrastructure_only() {
    echo -e "${BLUE}🏗️  Deploying infrastructure only (using existing Docker image)...${NC}"
    
    cd iac
    if terraform apply -var="openai_api_key=$OPENAI_API_KEY"; then
        echo -e "${GREEN}✅ Infrastructure deployed successfully${NC}"
        
        # Get API Gateway URL
        API_URL=$(terraform output -raw api_gateway_url 2>/dev/null || echo "Not available")
        echo -e "${CYAN}📡 API Gateway URL: ${API_URL}${NC}"
    else
        echo -e "${RED}❌ Infrastructure deployment failed!${NC}"
    fi
    
    cd ..
    post_action_menu
}

# Show detailed state
show_detailed_state() {
    echo -e "${BLUE}📊 Current infrastructure state:${NC}"
    
    cd iac
    if terraform show; then
        echo ""
        echo -e "${CYAN}Outputs:${NC}"
        terraform output
    else
        echo -e "${YELLOW}⚠️  No state available or state is empty${NC}"
    fi
    
    cd ..
    post_action_menu
}

# Refresh state
refresh_state() {
    echo -e "${BLUE}🔄 Refreshing Terraform state...${NC}"
    
    cd iac
    if terraform refresh -var="openai_api_key=$OPENAI_API_KEY"; then
        echo -e "${GREEN}✅ State refreshed successfully${NC}"
    else
        echo -e "${RED}❌ State refresh failed!${NC}"
    fi
    
    cd ..
    post_action_menu
}

# Plan destroy
plan_destroy() {
    echo -e "${YELLOW}💥 Planning infrastructure destruction...${NC}"
    echo ""
    echo -e "${RED}⚠️  WARNING: This will show what would be DELETED!${NC}"
    echo ""
    
    cd iac
    if terraform plan -destroy -var="openai_api_key=$OPENAI_API_KEY"; then
        echo ""
        echo -e "${YELLOW}📝 This is a PLAN only - no resources were destroyed.${NC}"
    else
        echo -e "${RED}❌ Destroy plan failed!${NC}"
    fi
    
    cd ..
    post_action_menu
}

# Execute destroy
execute_destroy() {
    echo -e "${RED}💀 DESTROYING INFRASTRUCTURE${NC}"
    echo ""
    echo -e "${RED}⚠️  WARNING: This will PERMANENTLY DELETE all infrastructure!${NC}"
    echo -e "${RED}⚠️  This action CANNOT be undone!${NC}"
    echo ""
    
    read -p "Type 'DESTROY' to confirm: " CONFIRM_DESTROY
    if [ "$CONFIRM_DESTROY" != "DESTROY" ]; then
        echo -e "${YELLOW}🚫 Destruction cancelled - exact match required${NC}"
        post_action_menu
        return
    fi
    
    cd iac
    if terraform destroy -var="openai_api_key=$OPENAI_API_KEY"; then
        echo -e "${GREEN}✅ Infrastructure destroyed successfully${NC}"
    else
        echo -e "${RED}❌ Destruction failed!${NC}"
    fi
    
    cd ..
    post_action_menu
}

# Post action menu
post_action_menu() {
    echo ""
    echo -e "${PURPLE}What would you like to do next?${NC}"
    echo "1) 🏠 Return to main menu"
    echo "2) ❌ Exit"
    
    read -p "Enter your choice (1-2): " NEXT_CHOICE
    
    case $NEXT_CHOICE in
        1)
            main_menu
            ;;
        2)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            post_action_menu
            ;;
    esac
}

# Main execution
main() {
    check_prerequisites
    check_aws_auth
    check_env_vars
    show_current_state
    main_menu
}

# Run main function
main