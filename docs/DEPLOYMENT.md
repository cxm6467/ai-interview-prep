# Deployment Guide

This guide covers both local and CI/CD deployment options for the AI Interview Prep application.

## 🚀 Quick Start

### Local Deployment

1. **Authenticate with AWS:**
   ```bash
   npm run aws:login
   # Follow the interactive prompts for SSO setup
   ```

2. **Set environment variables:**
   ```bash
   export AWS_PROFILE=terraform
   export OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Deploy everything:**
   ```bash
   npm run docker:deploy
   ```

### GitHub Actions Deployment

Push to your repository and GitHub Actions will automatically deploy based on the branch:
- `develop` branch → Staging environment
- `main` branch → Production environment

## 📦 Deployment Options

### 1. Backend Only

**Local:**
```bash
# Plan first (recommended)
npm run deploy:plan

# Deploy backend infrastructure
npm run deploy
```

**GitHub Actions:**
- Push changes to `apps/backend/` or `iac/` directories
- Or manually trigger the "Deploy Backend" workflow

### 2. Frontend Only

**Local:**
```bash
# Build frontend
npm run build:frontend

# Deploy to S3 (requires S3 bucket setup)
aws s3 sync apps/frontend/dist/ s3://your-bucket-name/ --delete
```

**GitHub Actions:**
- Push changes to `apps/frontend/` directory
- Or manually trigger the "Deploy Frontend" workflow

### 3. Full Stack (Recommended)

**Local:**
```bash
npm run docker:deploy
```

**GitHub Actions:**
- Push to `main` branch
- Or manually trigger the "Deploy Full Stack" workflow

## 🔧 Prerequisites

### Local Development

1. **Required Tools:**
   - AWS CLI v2
   - Docker
   - Terraform >= 1.6.0
   - Node.js >= 18

2. **AWS Permissions:**
   Your AWS user/role needs permissions for:
   - ECR (Elastic Container Registry)
   - Lambda functions
   - API Gateway
   - IAM roles and policies
   - CloudWatch logs

3. **Environment Variables:**
   ```bash
   export AWS_PROFILE=terraform        # Set after running aws:login
   export OPENAI_API_KEY=sk-xxx...     # Your OpenAI API key
   export AWS_REGION=us-east-1         # Optional, defaults to us-east-1
   ```

### GitHub Actions (CI/CD)

1. **Repository Secrets:**
   ```
   AWS_ACCESS_KEY_ID          # AWS access key for CI/CD
   AWS_SECRET_ACCESS_KEY      # AWS secret key for CI/CD
   OPENAI_API_KEY             # Your OpenAI API key
   ```

2. **Repository Variables:**
   ```
   AWS_REGION                 # AWS region (default: us-east-1)
   S3_STAGING_BUCKET          # S3 bucket for staging frontend
   S3_PRODUCTION_BUCKET       # S3 bucket for production frontend
   CLOUDFRONT_STAGING_ID      # CloudFront distribution ID for staging
   CLOUDFRONT_PRODUCTION_ID   # CloudFront distribution ID for production
   STAGING_DOMAIN             # Staging domain name
   PRODUCTION_DOMAIN          # Production domain name
   ```

## 🎯 Terraform Authentication

### Local (AWS CLI Profile)
Terraform automatically uses your AWS CLI profile:
```bash
export AWS_PROFILE=terraform
terraform plan  # Uses the terraform profile
```

### CI/CD (Environment Variables)
GitHub Actions sets these automatically:
```bash
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
```

## 📋 Available Commands

### Local Development
```bash
# AWS Authentication
npm run aws:login           # Interactive AWS setup
npm run aws:quick-login     # Quick browser SSO login

# Building
npm run build              # Build both frontend and backend
npm run build:frontend     # Build frontend only
npm run build:backend      # Build backend only

# Dry Run / Planning (RECOMMENDED)
npm run deploy:dry-run      # See what would change (plan only)
npm run deploy:plan         # Same as above
npm run deploy:plan:detailed # Detailed plan with exit codes
npm run deploy:destroy:dry-run # See what would be destroyed
npm run docker:deploy:dry-run  # Build + plan without deploying
npm run deploy:interactive  # Guided deployment with dry run options

# Terraform Operations
npm run tf:init            # Initialize Terraform
npm run tf:validate        # Validate Terraform configuration
npm run tf:format          # Format Terraform files
npm run tf:refresh         # Refresh state from AWS
npm run deploy             # Apply Terraform changes
npm run deploy:destroy     # Destroy infrastructure

# Docker
npm run docker:build       # Build Docker image
npm run docker:deploy      # Build image and deploy

# Linting
npm run lint              # Lint frontend code
npm run lint:fix          # Fix linting issues
```

### GitHub Actions Workflows

1. **Continuous Integration (`ci.yml`)**
   - Runs on all pushes and PRs
   - Lints, builds, validates Terraform
   - Security scanning
   - Docker build testing

2. **Deploy Backend (`deploy-backend.yml`)**
   - Triggered by changes to backend/iac
   - Builds and pushes Docker image
   - Deploys infrastructure with Terraform

3. **Deploy Frontend (`deploy-frontend.yml`)**
   - Triggered by changes to frontend
   - Builds and deploys to S3/CloudFront

4. **Deploy Full Stack (`deploy-full-stack.yml`)**
   - Triggered by pushes to main
   - Deploys backend first, then frontend with API URL

## 🔄 Deployment Flow

### Full Stack Deployment

1. **Backend Deployment:**
   - Build Docker image
   - Push to Amazon ECR
   - Deploy Lambda function via Terraform
   - Create/update API Gateway
   - Output API Gateway URL

2. **Frontend Deployment:**
   - Update source code with API Gateway URL
   - Build React application
   - Deploy to S3
   - Invalidate CloudFront cache

### Separate Deployments

**Backend Only:**
- Useful for API updates that don't affect frontend
- Faster deployment (no frontend build)

**Frontend Only:**
- Useful for UI changes that don't require backend updates
- Requires existing backend deployment

## 🚨 Troubleshooting

### Common Issues

1. **"No terraform profile found"**
   ```bash
   npm run aws:login  # Set up AWS authentication
   ```

2. **"Session expired"**
   ```bash
   npm run aws:quick-login  # Refresh SSO session
   ```

3. **Docker build fails**
   ```bash
   # Check if Docker is running
   docker --version
   docker ps
   ```

4. **Terraform permission denied**
   - Ensure AWS user has proper permissions
   - Check AWS_PROFILE is set correctly

5. **API Gateway URL not updating**
   - Check if backend deployment completed successfully
   - Verify Terraform outputs are working

### Debug Commands

```bash
# Check AWS authentication
aws sts get-caller-identity

# Check Terraform state
cd iac && terraform show

# Check Docker image
docker images | grep consolidated-ai-handler

# Check API Gateway URL
cd iac && terraform output api_gateway_url
```

## 🏗️ Infrastructure Overview

The application deploys:

1. **ECR Repository** - Stores Docker images
2. **Lambda Function** - Runs the AI backend
3. **API Gateway** - Exposes HTTP endpoints
4. **IAM Roles** - Permissions for Lambda
5. **CloudWatch Logs** - Application logs

Optional (for frontend):
6. **S3 Bucket** - Static website hosting
7. **CloudFront** - CDN distribution

## 📊 Monitoring

After deployment, monitor your application:

- **CloudWatch Logs**: Lambda function logs
- **API Gateway Metrics**: Request counts, errors, latency
- **CloudFront Metrics**: Cache hit rates, origin requests

Access these through the AWS Console or CLI:
```bash
aws logs describe-log-groups
aws apigateway get-rest-apis
```