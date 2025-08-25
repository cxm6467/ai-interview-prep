# Dynamic data sources for resource detection and auto-import
# This replaces shell scripts with Terraform-native resource detection

# Current AWS account and region
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Try to find existing Lambda function
data "aws_lambda_function" "existing" {
  function_name = "${var.app_name}-${var.environment}"

  # This will fail if function doesn't exist, and that's okay
  depends_on = []

  lifecycle {
    postcondition {
      condition     = self.function_name == "${var.app_name}-${var.environment}"
      error_message = "Lambda function name mismatch"
    }
  }

  # Optional - only try if we want to import existing resources
  count = var.import_existing_resources ? 1 : 0
}

# Try to find existing ECR repository
data "aws_ecr_repository" "existing" {
  name = "${var.app_name}-${var.environment}"

  count = var.import_existing_resources ? 1 : 0
}

# Try to find existing IAM role
data "aws_iam_role" "existing" {
  name = "${var.app_name}-${var.environment}-lambda-role"

  count = var.import_existing_resources ? 1 : 0
}

# Try to find existing IAM policy
data "aws_iam_policy" "existing" {
  name = "${var.app_name}-${var.environment}-lambda-policy"

  count = var.import_existing_resources ? 1 : 0
}

# Try to find existing CloudWatch log group
data "aws_cloudwatch_log_group" "existing" {
  name = "/aws/lambda/${var.app_name}-${var.environment}"

  count = var.import_existing_resources ? 1 : 0
}

# Find Route53 hosted zone dynamically
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false

  count = var.create_route53_records ? 1 : 0
}

# Note: AWS doesn't provide data sources for API Gateway v2 domain names or APIs
# So we'll rely on the import blocks and external resource detection instead
# 
# Alternative approach: use aws CLI commands in local-exec when needed
# or rely on the Terraform import blocks with known resource IDs

# ACM certificate for the domain
data "aws_acm_certificate" "existing" {
  domain   = "*.${local.full_domain}"
  statuses = ["ISSUED"]

  count = var.create_route53_records ? 1 : 0
}

# Local values for conditional resource creation
locals {
  # Determine if we should create or import resources
  lambda_exists = var.import_existing_resources && length(data.aws_lambda_function.existing) > 0
  ecr_exists    = var.import_existing_resources && length(data.aws_ecr_repository.existing) > 0
  role_exists   = var.import_existing_resources && length(data.aws_iam_role.existing) > 0
  policy_exists = var.import_existing_resources && length(data.aws_iam_policy.existing) > 0
  logs_exist    = var.import_existing_resources && length(data.aws_cloudwatch_log_group.existing) > 0
  domain_exists = false # Will be determined by import blocks

  # API Gateway IDs will be provided via variables when importing
  api_gateway_id = var.existing_api_gateway_id != "" ? var.existing_api_gateway_id : null

  # Domain configuration
  full_domain = var.environment == "development" ? "dev.${var.subdomain}.${var.domain_name}" : "${var.subdomain}.${var.domain_name}"
  api_domain  = "api.${local.full_domain}"

  # Zone ID from detected hosted zone
  hosted_zone_id = var.create_route53_records && length(data.aws_route53_zone.main) > 0 ? data.aws_route53_zone.main[0].zone_id : var.hosted_zone_id
}

# Output detected information for debugging
output "detected_resources" {
  description = "Summary of detected existing resources"
  value = {
    lambda_exists = local.lambda_exists
    ecr_exists    = local.ecr_exists
    role_exists   = local.role_exists
    policy_exists = local.policy_exists
    logs_exist    = local.logs_exist
    domain_exists = local.domain_exists

    # IDs of detected resources
    api_gateway_id = local.api_gateway_id
    hosted_zone_id = local.hosted_zone_id

    # Account and region info
    account_id = data.aws_caller_identity.current.account_id
    region     = data.aws_region.current.id
  }
}