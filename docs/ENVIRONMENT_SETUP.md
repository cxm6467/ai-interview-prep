# 🔧 Environment Setup Guide

Complete guide for setting up local development and CI/CD environments with proper AWS authentication.

## 🚀 Quick Start (Local Development)

1. **Initialize environment:**
   ```bash
   npm run setup:init
   ```

2. **Configure your API key:**
   ```bash
   # Edit the .env file
   vim .env
   # Add: OPENAI_API_KEY=sk-your-key-here
   ```

3. **Authenticate with AWS:**
   ```bash
   npm run aws:login
   ```

4. **Validate setup:**
   ```bash
   npm run setup:env
   ```

5. **Deploy to development:**
   ```bash
   npm run deploy:dev
   ```

## 📁 Environment Files

### `.env.example`
Template file with all available configuration options and documentation.

### `.env`
Your personal configuration file (created from `.env.example`). **Never commit this file!**

### `.env.development`
Development environment defaults (committed to repo).

### `.env.production`
Production environment configuration.

## 🔑 Environment Variables

### Required Variables
```bash
# OpenAI API Key (required for AI functionality)
OPENAI_API_KEY=sk-your-openai-api-key-here

# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=terraform  # For local development
```

### Optional Variables
```bash
# Environment Settings
ENVIRONMENT=development
APP_NAME=ai-interview-prep
DEBUG=false

# Terraform Settings
LAMBDA_TIMEOUT=120
LAMBDA_MEMORY=1024
LOG_RETENTION_DAYS=14

# Development Settings
LOCAL_API_URL=http://localhost:8080
VITE_PORT=5173
```

## 🏗️ Local Development Setup

### Method 1: Automatic Setup
```bash
# Initialize everything
npm run setup:init

# Edit .env file (add your OPENAI_API_KEY)
vim .env

# Authenticate with AWS
npm run aws:login

# Validate and deploy
npm run setup:env
npm run deploy:dev
```

### Method 2: Manual Setup
```bash
# Copy environment template
cp .env.example .env

# Add your API keys to .env
echo "OPENAI_API_KEY=sk-your-key-here" >> .env

# Configure AWS (interactive)
npm run aws:login

# Validate configuration
npm run setup:env validate
```

## 🌍 Multiple Environments

Deploy to specific environments:

```bash
# Development (default)
npm run deploy:dev
npm run deploy:dry-run  # Development dry run

# Production
npm run deploy:prod
ENVIRONMENT=production npm run deploy:dry-run
```

### Environment Differences

| Setting | Development | Production |
|---------|-------------|------------|
| `DEBUG` | `true` | `false` |
| `LAMBDA_MEMORY` | `512MB` | `1024MB` |
| `LOG_RETENTION` | `7 days` | `30 days` |
| Resource Names | `app-dev` | `app` |

## 🤖 GitHub Actions Authentication

GitHub Actions supports two authentication methods:

### Method 1: OIDC (Recommended) 🏆

**Benefits:**
- ✅ No long-term credentials stored in GitHub
- ✅ Automatic credential rotation
- ✅ Enhanced security with temporary tokens
- ✅ Fine-grained permissions

**Setup:**
1. **One-time OIDC setup:**
   - Go to repository Actions
   - Run "Setup AWS OIDC (One-time)" workflow
   - Provide your AWS Account ID

2. **Add repository variables:**
   ```
   Settings → Secrets and variables → Actions → Variables
   
   AWS_ROLE_ARN = arn:aws:iam::YOUR_ACCOUNT:role/GitHubActions-ai-interview-prep
   AWS_REGION = us-east-1
   APP_NAME = ai-interview-prep
   ```

3. **Add repository secrets:**
   ```
   Settings → Secrets and variables → Actions → Secrets
   
   OPENAI_API_KEY = sk-your-openai-key
   ```

### Method 2: Access Keys (Alternative)

**Setup:**
1. **Create IAM user** with deployment permissions
2. **Add repository secrets:**
   ```
   AWS_ACCESS_KEY_ID = AKIA...
   AWS_SECRET_ACCESS_KEY = your-secret-key
   OPENAI_API_KEY = sk-your-openai-key
   ```

**Required IAM Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:*",
        "lambda:*",
        "apigateway:*",
        "iam:GetRole",
        "iam:CreateRole",
        "iam:UpdateRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:CreatePolicy",
        "iam:PassRole",
        "logs:*",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🔧 Environment Commands

### Setup Commands
```bash
npm run setup:init          # Initialize environment files
npm run setup:env           # Validate current environment
npm run setup:env show      # Show environment status
npm run setup:env validate  # Validate and load environment
```

### Deployment Commands
```bash
# Environment-specific deployments
npm run deploy:dev          # Deploy to development
npm run deploy:prod         # Deploy to production

# Standard deployments (uses ENVIRONMENT variable)
npm run deploy              # Deploy to current environment
npm run deploy:dry-run      # Dry run for current environment
```

### AWS Authentication
```bash
npm run aws:login           # Interactive AWS setup
npm run aws:quick-login     # Quick browser re-authentication
```

## 🚨 Troubleshooting

### "Environment validation failed"
```bash
# Check what's missing
npm run setup:env show

# Common fixes:
echo "OPENAI_API_KEY=sk-your-key" >> .env
npm run aws:login
```

### "AWS authentication failed"
```bash
# Check current AWS identity
aws sts get-caller-identity

# Re-authenticate
npm run aws:quick-login

# Or full setup
npm run aws:login
```

### "Terraform variable not set"
```bash
# Check environment loading
npm run setup:env show

# Manually load and run
./scripts/setup-env.sh export
cd iac && terraform plan
```

### "Wrong environment deployed"
```bash
# Check current environment
npm run setup:env show

# Deploy to specific environment
ENVIRONMENT=development npm run deploy
```

## 🔒 Security Best Practices

### Local Development
- ✅ Never commit `.env` files
- ✅ Use AWS SSO/profiles instead of access keys
- ✅ Regularly rotate API keys
- ✅ Use different API keys for different environments

### CI/CD
- ✅ Prefer OIDC over access keys
- ✅ Use repository secrets for sensitive data
- ✅ Use repository variables for non-sensitive config
- ✅ Limit IAM permissions to minimum required

### Environment Separation
- ✅ Use different AWS accounts for prod/staging
- ✅ Use different OpenAI API keys per environment
- ✅ Implement environment-specific resource naming
- ✅ Use separate Terraform state files

## 📊 Environment Status Check

Run this command to see your current environment status:

```bash
npm run setup:env show
```

Example output:
```
🔧 AI Interview Prep - Environment Setup
Environment: development

📊 Environment Status:
  Environment: development
  App Name: ai-interview-prep-dev
  AWS Region: us-east-1
  AWS Profile: terraform
  AWS Account ID: 123456789012
  OpenAI API Key: ✅ Set
  Debug Mode: true

✅ Environment validation passed
```

## 🔄 Workflow Integration

The environment system integrates with all deployment workflows:

1. **Local development:** Uses `.env` files and AWS profiles
2. **GitHub Actions:** Uses repository secrets and OIDC
3. **Multiple environments:** Automatic environment detection
4. **Terraform:** All variables passed as `TF_VAR_*` environment variables

This ensures consistent behavior across all deployment methods while maintaining security best practices.

## 💡 Pro Tips

1. **Use environment-specific commands:**
   ```bash
   npm run deploy:dev      # Always deploys to development
   npm run deploy:staging  # Always deploys to staging
   npm run deploy:prod     # Always deploys to production
   ```

2. **Check before deploying:**
   ```bash
   npm run setup:env show  # Verify current environment
   npm run deploy:dry-run  # See what would change
   ```

3. **Quick environment switching:**
   ```bash
   ENVIRONMENT=production npm run deploy:dry-run
   ```

4. **Debug environment issues:**
   ```bash
   DEBUG=true npm run setup:env validate
   ```