# Provider configuration
provider "aws" {
  region = local.aws_region

  default_tags {
    tags = local.common_tags
  }
}

# Local configuration
locals {
  aws_region  = "us-east-1"
  app_name    = "ai-interview-prep"
  environment = var.environment
  domain_name = "chrismarasco.io"
  subdomain   = "ai-ip"

  # Environment-specific domain configuration
  full_domain = "dev.${local.subdomain}.${local.domain_name}"
  api_domain  = "api.dev.${local.subdomain}.${local.domain_name}"
  
  # Resource naming
  resource_prefix = "${local.app_name}-${local.environment}"
  
  # Common tags
  common_tags = {
    Project     = local.app_name
    Environment = local.environment
    ManagedBy   = "terraform"
    Application = local.app_name
    Domain      = local.full_domain
  }

  # Lambda environment variables
  lambda_environment_variables = {
    OPENAI_API_KEY = var.openai_api_key
    ENVIRONMENT    = local.environment
    DEBUG          = "true"
  }
}

# Security module - SSL certificate
module "security" {
  source = "../../modules/security"

  domain_name                 = local.full_domain
  subject_alternative_names   = [local.api_domain]
  route53_zone_name          = local.domain_name
  tags                       = local.common_tags
}

# Lambda module with enhanced IAM security
module "lambda" {
  source = "../../modules/lambda"

  function_name                   = local.resource_prefix
  image_uri                      = "276362266002.dkr.ecr.us-east-1.amazonaws.com/${local.resource_prefix}@${var.docker_image_tag}"
  timeout                        = var.lambda_timeout
  memory_size                    = var.lambda_memory
  environment_variables          = local.lambda_environment_variables
  log_retention_days            = var.log_retention_days
  reserved_concurrent_executions = var.lambda_reserved_concurrency
  
  # IAM Security Settings
  enable_ecr_access             = false  # Lambda doesn't need ECR access after deployment
  enable_ssm_access            = var.enable_ssm_parameter_access
  enable_secrets_manager_access = var.enable_secrets_manager
  enable_custom_metrics        = true
  use_enhanced_execution_role  = true
  
  tags = local.common_tags
}

# API Gateway module
module "api_gateway" {
  source = "../../modules/api-gateway"

  api_name               = "${local.resource_prefix}-api"
  lambda_function_name   = module.lambda.function_name
  lambda_invoke_arn      = module.lambda.invoke_arn
  domain_name           = local.api_domain
  certificate_arn       = module.security.certificate_arn
  route53_zone_id       = module.security.route53_zone_id
  throttling_burst_limit = var.api_throttling_burst_limit
  throttling_rate_limit  = var.api_throttling_rate_limit
  tags                  = local.common_tags

  cors_configuration = {
    allow_credentials = false
    allow_headers     = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins     = ["https://${local.full_domain}", "http://localhost:5173", "http://localhost:3000"]
    expose_headers    = []
    max_age          = 86400
  }

  depends_on = [module.security, module.lambda]
}

# Frontend module for React app hosting
module "frontend" {
  source = "../../modules/frontend"

  bucket_name       = "${local.resource_prefix}-frontend"
  custom_domain     = local.full_domain
  certificate_arn   = module.security.certificate_arn
  route53_zone_id   = module.security.route53_zone_id
  tags             = local.common_tags

  depends_on = [module.security]
}

# Import blocks for existing resources
import {
  to = module.lambda.aws_cloudwatch_log_group.lambda_logs
  id = "/aws/lambda/ai-interview-prep-dev"
}

import {
  to = module.frontend.aws_s3_bucket.frontend
  id = "ai-interview-prep-dev-frontend"
}