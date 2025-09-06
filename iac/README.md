# AI Interview Prep - Terraform Infrastructure

This directory contains a robust, production-ready Terraform configuration for deploying the AI Interview Prep application to AWS with environment-specific configurations and automated CI/CD.

## Architecture

The infrastructure includes:

- **Lambda Function**: Backend API running Node.js
- **API Gateway**: REST API endpoint for the Lambda function
- **S3 Bucket**: Static website hosting for the React frontend
- **CloudFront**: CDN distribution for the S3 hosted frontend
- **CloudWatch**: Logging for Lambda and API Gateway
- **IAM**: Roles and policies for secure access

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** version >= 1.0 installed
3. **OpenAI API key** for the application functionality

### AWS CLI Setup

Make sure your AWS CLI is configured with credentials that have permissions to create:
- Lambda functions
- API Gateway APIs
- S3 buckets
- CloudFront distributions
- IAM roles and policies
- CloudWatch log groups

```bash
aws configure
# OR
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

## Folder Structure

```
iac/
├── modules/                    # Reusable Terraform modules
│   ├── lambda/                # Lambda function module
│   ├── s3-cloudfront/         # S3 + CloudFront module
│   └── api-gateway/           # API Gateway module
├── environments/              # Environment-specific configurations
│   ├── dev/                   # Development environment
│   ├── staging/               # Staging environment (future)
│   └── prod/                  # Production environment (future)
├── backend.tf                 # Remote state configuration (commented)
├── terraform.tfvars.example   # Example configuration
└── README.md                  # This file
```

## Quick Start

### Using Deployment Scripts (Recommended)

1. **Deploy infrastructure:**
   ```bash
   # Set your OpenAI API key
   export OPENAI_API_KEY="sk-your-openai-api-key-here"
   
   # Deploy to dev environment
   ./scripts/deploy-infrastructure.sh -e dev -a apply -y
   ```

2. **Deploy frontend:**
   ```bash
   ./scripts/deploy-frontend.sh -e dev
   ```

3. **Deploy backend:**
   ```bash
   ./scripts/deploy-backend.sh -e dev
   ```

### Manual Deployment

1. **Navigate to environment directory:**
   ```bash
   cd iac/environments/dev
   ```

2. **Copy and edit variables file:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your OpenAI API key
   ```

3. **Initialize and deploy:**
   ```bash
   terraform init
   terraform plan -var="openai_api_key=$OPENAI_API_KEY"
   terraform apply -var="openai_api_key=$OPENAI_API_KEY"
   ```

## Configuration Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `aws_region` | AWS region for resources | `us-east-1` | No |
| `environment` | Environment name (dev/staging/prod) | `dev` | No |
| `project_name` | Name of the project | `ai-interview-prep` | No |
| `openai_api_key` | OpenAI API key | `""` | Yes |
| `lambda_timeout` | Lambda function timeout (seconds) | `30` | No |
| `lambda_memory_size` | Lambda function memory (MB) | `512` | No |
| `domain_name` | Custom domain for frontend | `""` | No |

## Outputs

After deployment, Terraform will output:

- `api_gateway_url`: Backend API endpoint
- `cloudfront_distribution_url`: Frontend application URL
- `s3_bucket_name`: S3 bucket name for frontend files
- `lambda_function_name`: Lambda function name
- `deployment_info`: All key deployment information

## Deployment Process

### Backend Deployment

The Lambda function initially deploys with a placeholder that returns mock data. To deploy your actual backend code:

1. Build your backend application
2. Create a deployment package (ZIP file)
3. Update the Lambda function:
   ```bash
   aws lambda update-function-code \
     --function-name $(terraform output -raw lambda_function_name) \
     --zip-file fileb://your-backend-package.zip
   ```

### Frontend Deployment

Deploy your React frontend to the S3 bucket:

1. Build your React application:
   ```bash
   npm run build
   ```

2. Sync to S3:
   ```bash
   aws s3 sync dist/ s3://$(terraform output -raw s3_bucket_name)/ --delete
   ```

3. Invalidate CloudFront cache:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id $(terraform output -raw cloudfront_distribution_id) \
     --paths "/*"
   ```

## Environment Variables

The Lambda function is configured with these environment variables:

- `NODE_ENV`: Set to the environment name
- `LOG_LEVEL`: Logging level (INFO, DEBUG, etc.)
- `OPENAI_API_KEY`: Your OpenAI API key

## Security Considerations

- The S3 bucket is configured with public access blocked
- CloudFront uses Origin Access Control (OAC) to access S3 securely
- Lambda function has minimal IAM permissions
- All resources are tagged for cost tracking and management

## Cost Estimation

For a development environment with moderate usage:

- **Lambda**: ~$0.20/million requests + $0.00001667/GB-second
- **API Gateway**: ~$3.50/million API calls
- **S3**: ~$0.023/GB storage + $0.0004/1000 requests
- **CloudFront**: ~$0.085/GB data transfer (first 10TB)

Estimated monthly cost for dev environment: **$5-20/month**

## Troubleshooting

### Common Issues

1. **AWS credentials not configured**
   ```bash
   aws configure list
   ```

2. **Insufficient permissions**
   - Ensure your AWS user/role has the necessary permissions
   - Check CloudTrail logs for access denied errors

3. **Lambda function cold starts**
   - Consider increasing memory size for faster cold starts
   - Implement warming strategies if needed

4. **CORS issues**
   - The API Gateway is configured with CORS headers
   - Verify the Lambda function returns proper CORS headers

### Logs

- **Lambda logs**: Check CloudWatch logs at `/aws/lambda/{function-name}`
- **API Gateway logs**: Check CloudWatch logs at `/aws/apigateway/{api-name}`

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

⚠️ **Warning**: This will permanently delete all resources and data.

## Next Steps

1. Set up automated deployment pipeline (GitHub Actions, etc.)
2. Configure custom domain name with SSL certificate
3. Add monitoring and alerting
4. Set up staging and production environments
5. Implement backup and disaster recovery strategies