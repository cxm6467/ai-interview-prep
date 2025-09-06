# 🚀 Deployment Guide

This guide covers deploying the AI Interview Prep application to AWS using Terraform and GitHub Actions.

## Prerequisites

### Required Tools
- [AWS CLI](https://aws.amazon.com/cli/) - Configure with appropriate credentials
- [Terraform](https://www.terraform.io/) - Version >= 1.0
- [Node.js](https://nodejs.org/) - Version >= 18.0.0
- [npm](https://npmjs.com/) - Version >= 9.0.0

### Required Secrets
Set these secrets in your GitHub repository:

| Secret | Description | Example |
|--------|-------------|---------|
| `AWS_ROLE_ARN` | AWS IAM Role ARN for GitHub Actions | `arn:aws:iam::123456789012:role/github-actions-role` |
| `OPENAI_API_KEY` | OpenAI API key for AI functionality | `sk-...` |

## 🏗️ Infrastructure Setup

### 1. AWS Account Setup

1. **Create IAM Role for GitHub Actions**
   ```bash
   # Create trust policy for GitHub Actions
   cat > github-actions-trust-policy.json << 'EOF'
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringLike": {
             "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/ai-interview-prep:*"
           }
         }
       }
     ]
   }
   EOF

   # Create the role
   aws iam create-role \
     --role-name github-actions-role \
     --assume-role-policy-document file://github-actions-trust-policy.json

   # Attach necessary policies
   aws iam attach-role-policy \
     --role-name github-actions-role \
     --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
   ```

2. **Set up OIDC Provider (if not exists)**
   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
     --client-id-list sts.amazonaws.com
   ```

### 2. Environment-Specific Deployment

#### Development Environment

1. **Navigate to development environment**
   ```bash
   cd iac/environments/dev
   ```

2. **Initialize Terraform**
   ```bash
   terraform init
   ```

3. **Configure variables** (optional)
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your specific values
   ```

4. **Deploy infrastructure**
   ```bash
   terraform plan
   terraform apply
   ```

#### Production Environment

1. **Navigate to production environment**
   ```bash
   cd iac/environments/prod
   ```

2. **Follow same steps as development**
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

## 🔄 Automated Deployment

### GitHub Actions Workflows

The repository includes automated deployment workflows:

| Workflow | Trigger | Environment | Purpose |
|----------|---------|-------------|---------|
| `deploy-dev.yml` | Push to `develop` | Development | Auto-deploy to dev |
| `deploy-prod.yml` | Push to `main` | Production | Auto-deploy to prod |
| `deploy.yml` | Manual trigger | Any | Manual deployment |

### Manual Deployment Triggers

1. **Deploy to Development**
   - Go to [Actions](../../actions/workflows/deploy-dev.yml)
   - Click "Run workflow"
   - Select `develop` branch

2. **Deploy to Production**
   - Go to [Actions](../../actions/workflows/deploy-prod.yml)
   - Click "Run workflow"
   - Select `main` branch

## 🏃 Local Development Deployment

### Docker Deployment

1. **Build Docker images**
   ```bash
   cd apps/backend
   docker build -f Dockerfile.main -t ai-interview-main .
   docker build -f Dockerfile.chat -t ai-interview-chat .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Manual Local Deployment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build applications**
   ```bash
   npm run build
   ```

3. **Start services**
   ```bash
   # Terminal 1: Backend services
   npm run dev:backend

   # Terminal 2: Frontend
   npm run dev:frontend
   ```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] AWS CLI configured with correct credentials
- [ ] GitHub secrets configured (`AWS_ROLE_ARN`, `OPENAI_API_KEY`)
- [ ] Terraform installed and working
- [ ] All tests passing locally
- [ ] Code reviewed and approved

### Post-Deployment
- [ ] Infrastructure deployed successfully
- [ ] Applications running without errors
- [ ] API endpoints responding correctly
- [ ] Frontend accessible via CloudFront URL
- [ ] SSL certificates valid
- [ ] Monitoring and logs working

## 🔧 Troubleshooting

### Common Issues

#### Terraform State Locking
```bash
# If terraform state is locked
terraform force-unlock LOCK_ID
```

#### IAM Permission Errors
```bash
# Verify your AWS credentials
aws sts get-caller-identity

# Check IAM role permissions
aws iam list-attached-role-policies --role-name github-actions-role
```

#### Docker Build Issues
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -f Dockerfile.main .
```

#### Lambda Function Errors
```bash
# View Lambda logs
aws logs describe-log-groups
aws logs tail /aws/lambda/ai-interview-prep-dev-main-api
```

### Environment-Specific Issues

#### Development Environment
- API URL: Check `terraform output api_gateway_url`
- Frontend URL: Check `terraform output cloudfront_distribution_url`

#### Production Environment
- Ensure proper domain configuration
- Verify SSL certificate status
- Check CloudFront distribution status

## 📊 Monitoring

### CloudWatch Logs
- **Main Lambda**: `/aws/lambda/ai-interview-prep-{env}-main-api`
- **Chat Lambda**: `/aws/lambda/ai-interview-prep-{env}-chat-api`
- **API Gateway**: `/aws/apigateway/ai-interview-prep-{env}`

### Health Checks
- **API Health**: `https://api.{domain}/health`
- **Chat Health**: `https://api.{domain}/chat/health`

### Performance Metrics
- Lambda duration and memory usage
- API Gateway request counts and latency
- CloudFront cache hit ratios
- Error rates and types

## 🔄 Rollback Procedures

### Application Rollback
1. **Identify previous working commit**
   ```bash
   git log --oneline
   ```

2. **Revert to previous version**
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **Trigger re-deployment**
   - Push will automatically trigger deployment
   - Or manually trigger via GitHub Actions

### Infrastructure Rollback
1. **Use Terraform state**
   ```bash
   terraform plan -destroy  # Review changes
   terraform destroy        # If needed
   terraform apply         # Re-apply previous config
   ```

## 🎯 Production Readiness

### Security Checklist
- [ ] Environment variables secured
- [ ] IAM roles follow least privilege
- [ ] API endpoints properly secured
- [ ] CORS configured correctly
- [ ] Input validation implemented
- [ ] Error handling doesn't expose sensitive data

### Performance Checklist
- [ ] Lambda memory optimized
- [ ] CloudFront caching configured
- [ ] API Gateway throttling set
- [ ] Database connections pooled (if applicable)
- [ ] Static assets minified and compressed

### Monitoring Checklist
- [ ] CloudWatch alarms configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Log retention policies set
- [ ] Backup procedures documented

---

For additional help, see the main [README](./README.md) or open an [issue](../../issues).