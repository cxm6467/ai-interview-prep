# Production Environment Configuration

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket  = "ai-interview-prep-terraform-state"
    key     = "environments/prod/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

# Provider for us-east-1 (required for ACM certificates used with CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# Lambda Module
module "lambda" {
  source = "../../modules/lambda"

  name_prefix        = local.name_prefix
  environment        = var.environment
  lambda_runtime     = var.lambda_runtime
  lambda_timeout     = var.lambda_timeout
  lambda_memory_size = var.lambda_memory_size
  log_retention_days = var.log_retention_days
  environment_variables = {
    OPENAI_API_KEY = var.openai_api_key
    LOG_LEVEL      = var.log_level
  }
  tags = local.common_tags
}

# S3 and CloudFront Module
module "s3_cloudfront" {
  source = "../../modules/s3-cloudfront"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  name_prefix            = local.name_prefix
  environment            = var.environment
  domain_name            = "ai-ip.chrismarasco.io"
  cloudfront_price_class = var.cloudfront_price_class
  s3_force_destroy       = var.s3_force_destroy
  common_tags            = local.common_tags
}

# API Gateway Module
module "api_gateway" {
  source = "../../modules/api-gateway"

  name_prefix               = local.name_prefix
  environment               = var.environment
  lambda_function_name      = "${local.name_prefix}-main-api"
  chat_lambda_function_name = "${local.name_prefix}-chat-api"
  api_domain_name           = "api.ai-ip.chrismarasco.io"
  cors_allowed_origins      = ["https://ai-ip.chrismarasco.io"]
  common_tags               = local.common_tags
}

# CloudWatch logs are included in Lambda module - no additional monitoring needed