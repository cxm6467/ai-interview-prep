# Variables for AWS connection

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

# Note: AWS credentials should come from:
# 1. Environment variables (for GitHub Actions)
# 2. AWS CLI profile (for local development)  
# 3. IAM role (for EC2/Lambda)
# Never hardcode credentials in Terraform files!