# 🏗️ Step-by-Step Terraform AWS Setup Plan

## 📋 Prerequisites (Already Available)
- ✅ GitHub repository: `cxm6467/ai-interview-prep`
- ✅ AWS Role ARN secret configured in GitHub
- ✅ OpenAI API key secret configured in GitHub
- ✅ Local development environment

## 🎯 Phase 1: Foundation Setup

### Step 1: Verify Existing Secrets
**Goal**: Confirm we have the necessary secrets in GitHub
**Documentation**: [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

**Tasks**:
- [ ] Verify `AWS_ROLE_ARN` secret exists
- [ ] Verify `OPENAI_API_KEY` secret exists
- [ ] Document the AWS account ID and region we're targeting

### Step 2: Local Terraform Setup
**Goal**: Install and configure Terraform locally
**Documentation**: [Terraform Installation Guide](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)

**Tasks**:
- [ ] Install Terraform CLI
- [ ] Verify installation with `terraform --version`
- [ ] Install AWS CLI
- [ ] Configure AWS credentials locally (for development)

### Step 3: Learn Terraform Basics
**Goal**: Understand core Terraform concepts
**Documentation**: [Terraform Language Documentation](https://developer.hashicorp.com/terraform/language)

**Key Concepts to Learn**:
- [ ] Providers and Resources
- [ ] Variables and Outputs
- [ ] State Management
- [ ] Configuration Syntax

## 🎯 Phase 2: Basic AWS Connection

### Step 4: Create Minimal Terraform Configuration
**Goal**: Create the simplest possible Terraform setup
**Documentation**: [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

**Tasks**:
- [ ] Create `main.tf` with AWS provider
- [ ] Create `variables.tf` for inputs
- [ ] Create `outputs.tf` for results
- [ ] Create `terraform.tfvars.example`

### Step 5: Test AWS Connectivity
**Goal**: Verify Terraform can connect to AWS
**Documentation**: [AWS Provider Configuration](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration)

**Tasks**:
- [ ] Run `terraform init`
- [ ] Run `terraform plan` with minimal config
- [ ] Verify AWS permissions work

### Step 6: Deploy First Simple Resource
**Goal**: Successfully deploy one AWS resource
**Documentation**: [Terraform AWS Get Started](https://developer.hashicorp.com/terraform/tutorials/aws-get-started)

**Tasks**:
- [ ] Create an S3 bucket (simple, safe resource)
- [ ] Run `terraform plan`
- [ ] Run `terraform apply`
- [ ] Verify resource exists in AWS Console
- [ ] Run `terraform destroy` to clean up

## 🎯 Phase 3: Application-Specific Resources

### Step 7: ECR Repository
**Goal**: Set up container registry for Lambda
**Documentation**: [Terraform AWS ECR](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_repository)

**Tasks**:
- [ ] Add ECR repository resource
- [ ] Configure repository lifecycle policy
- [ ] Test with `terraform plan` and `apply`

### Step 8: Lambda Function
**Goal**: Deploy Lambda function from ECR image
**Documentation**: [Terraform AWS Lambda](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function)

**Tasks**:
- [ ] Create Lambda IAM role and policies
- [ ] Add Lambda function resource
- [ ] Configure environment variables (OpenAI key)
- [ ] Test deployment

### Step 9: API Gateway
**Goal**: Expose Lambda via HTTP API
**Documentation**: [Terraform AWS API Gateway v2](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_api)

**Tasks**:
- [ ] Create API Gateway HTTP API
- [ ] Configure routes to Lambda
- [ ] Set up CORS if needed
- [ ] Test API endpoints

## 🎯 Phase 4: Frontend & DNS (Optional)

### Step 10: S3 + CloudFront
**Goal**: Host frontend application
**Documentation**: [Terraform AWS S3](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket) / [CloudFront](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution)

**Tasks**:
- [ ] Create S3 bucket for frontend
- [ ] Configure CloudFront distribution
- [ ] Set up proper bucket policies

### Step 11: Route53 & SSL
**Goal**: Custom domain with HTTPS
**Documentation**: [Terraform AWS Route53](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) / [ACM](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate)

**Tasks**:
- [ ] Create SSL certificate
- [ ] Configure Route53 DNS records
- [ ] Update CloudFront to use custom domain

## 🎯 Phase 5: State Management & Automation

### Step 12: Remote State
**Goal**: Secure Terraform state management
**Documentation**: [Terraform S3 Backend](https://developer.hashicorp.com/terraform/language/settings/backends/s3)

**Tasks**:
- [ ] Create S3 bucket for state
- [ ] Create DynamoDB table for locking
- [ ] Configure backend configuration
- [ ] Migrate local state to remote

### Step 13: GitHub Actions (Simple)
**Goal**: Basic deployment automation
**Documentation**: [GitHub Actions with Terraform](https://developer.hashicorp.com/terraform/tutorials/automation/github-actions)

**Tasks**:
- [ ] Create simple workflow for `terraform plan`
- [ ] Add manual approval for `terraform apply`
- [ ] Test with small changes

## 📚 Reference Documentation

### Essential Reading
1. [Terraform AWS Get Started Tutorial](https://developer.hashicorp.com/terraform/tutorials/aws-get-started)
2. [Terraform Configuration Language](https://developer.hashicorp.com/terraform/language)
3. [AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
4. [Terraform Best Practices](https://developer.hashicorp.com/terraform/cloud-docs/recommended-practices)

### AWS Services Documentation
1. [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
2. [API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/)
3. [ECR User Guide](https://docs.aws.amazon.com/ecr/)
4. [S3 User Guide](https://docs.aws.amazon.com/s3/)

## 🔄 Success Criteria for Each Phase

### Phase 1: Foundation ✅
- Terraform installed and working
- AWS connectivity confirmed
- Basic concepts understood

### Phase 2: Basic AWS ✅  
- Can deploy and destroy simple resources
- Terraform state management working
- AWS permissions validated

### Phase 3: Application ✅
- Lambda function deployed and working
- API Gateway routing requests
- Container images in ECR

### Phase 4: Production Ready ✅
- Frontend hosted and accessible
- Custom domain with SSL
- All services integrated

### Phase 5: Automated ✅
- Remote state secure
- Basic CI/CD working
- Reproducible deployments

---

## 📌 Current Status: Phase 1 - Foundation Setup
**Next Action**: Verify existing GitHub secrets