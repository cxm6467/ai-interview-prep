# CI/CD Setup Guide

This guide explains how to set up automated deployments for the AI Interview Prep application using GitHub Actions.

## 🏗️ Architecture Overview

- **Local Environment**: Development with `npm run dev` (backend: `node local-server.js`)
- **Dev Environment**: Deployed on merge to `develop` branch → `dev.ai-ip.chrismarasco.io`
- **Production Environment**: Deployed on merge to `main` branch → `ai-ip.chrismarasco.io`

## 📋 Prerequisites

### 1. AWS Account Setup
- AWS account with appropriate permissions
- Route53 hosted zone for `chrismarasco.io`
- S3 bucket for Terraform state: `ai-interview-prep-terraform-state`

### 2. GitHub Repository Setup
You need to configure the following secrets and environments in your GitHub repository.

## 🔐 GitHub Secrets Configuration

### Repository Secrets
Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these **Repository secrets**:
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
OPENAI_API_KEY=your-openai-api-key
```

### GitHub Environments

Create two environments in GitHub (Settings → Environments):

#### 1. `development` Environment
- **Environment name**: `development`
- **Deployment branches**: `develop` 
- **Environment secrets**: None (uses repository secrets)

#### 2. `production` Environment  
- **Environment name**: `production`
- **Deployment branches**: `main`
- **Environment secrets**: None (uses repository secrets)
- **Environment protection rules** (recommended):
  - ✅ Required reviewers (1-2 people)
  - ✅ Wait timer (5-10 minutes)

## 🚀 Deployment Workflows

### Development Deployment (`develop` branch)
```yaml
Trigger: Push to develop branch
Environment: development
Domain: dev.ai-ip.chrismarasco.io
API: api.dev.ai-ip.chrismarasco.io
```

**Workflow steps**:
1. Build Docker image → Push to ECR
2. Build React frontend (dev config)
3. Deploy infrastructure with Terraform
4. Upload frontend to S3
5. Invalidate CloudFront cache

### Production Deployment (`main` branch)
```yaml
Trigger: Push to main branch  
Environment: production
Domain: ai-ip.chrismarasco.io
API: api.ai-ip.chrismarasco.io
```

**Workflow steps**:
1. Build Docker image → Push to ECR
2. Build React frontend (prod config) 
3. Deploy infrastructure with Terraform
4. Upload frontend to S3
5. Invalidate CloudFront cache

## 📁 Environment Structure

```
iac/environments/
├── dev/           # Development environment
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tf
└── prod/          # Production environment
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── terraform.tf
```

## ⚙️ Environment Differences

| Feature | Development | Production |
|---------|------------|------------|
| Domain | `dev.ai-ip.chrismarasco.io` | `ai-ip.chrismarasco.io` |
| API Domain | `api.dev.ai-ip.chrismarasco.io` | `api.ai-ip.chrismarasco.io` |
| Lambda Memory | 512 MB | 1024 MB |
| Lambda Timeout | 60s | 30s |
| Lambda Concurrency | 5 | 50 |
| CloudFront Price Class | PriceClass_100 | PriceClass_All |
| Debug Mode | `true` | `false` |
| CORS Origins | Dev domain + localhost | Production domain only |
| Log Retention | 7 days | 30 days |
| API Rate Limits | 100/200 | 1000/2000 |

## 🔄 Deployment Process

### Initial Setup
1. **Create Terraform State Bucket**:
   ```bash
   aws s3 mb s3://ai-interview-prep-terraform-state --region us-east-1
   ```

2. **Enable versioning and encryption**:
   ```bash
   aws s3api put-bucket-versioning \
     --bucket ai-interview-prep-terraform-state \
     --versioning-configuration Status=Enabled
   
   aws s3api put-bucket-encryption \
     --bucket ai-interview-prep-terraform-state \
     --server-side-encryption-configuration '{
       "Rules": [{
         "ApplyServerSideEncryptionByDefault": {
           "SSEAlgorithm": "AES256"
         }
       }]
     }'
   ```

### Development Deployment
1. Create/push to `develop` branch
2. GitHub Actions automatically deploys to development
3. Access at: https://dev.ai-ip.chrismarasco.io

### Production Deployment  
1. Create PR from `develop` → `main`
2. After review/approval, merge to `main`
3. GitHub Actions automatically deploys to production  
4. Access at: https://ai-ip.chrismarasco.io

## 🛠️ Manual Deployment

If needed, you can deploy manually:

### Development
```bash
cd iac/environments/dev
terraform init
terraform plan -var="openai_api_key=your-key"
terraform apply
```

### Production
```bash
cd iac/environments/prod  
terraform init
terraform plan -var="openai_api_key=your-key"
terraform apply
```

## 🔍 Monitoring & Debugging

### CloudWatch Logs
- Lambda logs: `/aws/lambda/ai-interview-prep-{env}`
- API Gateway logs: `/aws/apigateway/ai-interview-prep-{env}-api`

### GitHub Actions Logs
- View workflow runs in GitHub Actions tab
- Check individual job logs for troubleshooting

### AWS Resources
Each environment creates isolated resources:
- ECR repositories: `ai-interview-prep-{env}`
- Lambda functions: `ai-interview-prep-{env}`
- S3 buckets: `ai-interview-prep-{env}-frontend`
- CloudFront distributions: Separate per environment

## 🔒 Security Notes

1. **IAM Permissions**: Use least privilege for GitHub Actions IAM user
2. **Secrets Management**: Store sensitive values in GitHub Secrets
3. **Environment Protection**: Enable branch protection and required reviews for production
4. **State File Security**: S3 bucket with versioning and encryption enabled

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda Container Images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)