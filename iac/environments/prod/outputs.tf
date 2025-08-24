# Lambda outputs
output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = module.lambda.function_name
}

output "lambda_function_url" {
  description = "Lambda function URL (direct access)"
  value       = module.lambda.function_url
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.lambda.ecr_repository_url
}

# API Gateway outputs
output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.stage_invoke_url
}

output "custom_domain_url" {
  description = "Custom domain URL"
  value       = module.api_gateway.custom_domain_url
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = module.api_gateway.api_id
}

# Security outputs
output "ssl_certificate_arn" {
  description = "SSL certificate ARN"
  value       = module.security.certificate_arn
}

# Environment info
output "environment" {
  description = "Environment name"
  value       = local.environment
}

output "full_domain" {
  description = "Full domain name"
  value       = local.full_domain
}

# Frontend outputs
output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = module.frontend.bucket_name
}

output "frontend_cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = module.frontend.cloudfront_domain_name
}

output "frontend_url" {
  description = "Frontend website URL"
  value       = module.frontend.website_url
}

# API endpoints summary
output "api_endpoints" {
  description = "Available API endpoints"
  value = {
    health_check = "${module.api_gateway.custom_domain_url}/"
    analyze      = "${module.api_gateway.custom_domain_url}/analyze"
    direct_post  = "${module.api_gateway.custom_domain_url}/"
    lambda_url   = module.lambda.function_url
  }
}

# Complete application URLs
output "application_urls" {
  description = "Complete application access points"
  value = {
    frontend = module.frontend.website_url
    api      = module.api_gateway.custom_domain_url
  }
}