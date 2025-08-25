# Step 2: AWS Connection Test
# Test AWS provider setup and connectivity

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
  
  # For local development, you can use:
  # profile = "default"  # AWS CLI profile
  
  # For GitHub Actions, credentials come from environment
  # (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN)
}

# Data source to test AWS connectivity
data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# Test that we can read from AWS
output "aws_account_id" {
  description = "AWS Account ID we're connected to"
  value = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  description = "AWS Region we're using"  
  value = data.aws_region.current.name
}

output "aws_user_arn" {
  description = "ARN of the AWS user/role we're using"
  value = data.aws_caller_identity.current.arn
}