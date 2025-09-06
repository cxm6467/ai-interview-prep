# Production Environment Outputs

output "api_gateway_url" {
  description = "API Gateway endpoint URL (custom domain if configured)"
  value       = module.api_gateway.custom_api_url
}

output "cloudfront_distribution_url" {
  description = "Frontend URL (custom domain if configured)"
  value       = module.s3_cloudfront.custom_domain_url
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.s3_cloudfront.cloudfront_distribution_id
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = module.s3_cloudfront.s3_bucket_name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.lambda.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = module.lambda.function_arn
}

output "deployment_info" {
  description = "All deployment information"
  value = {
    api_url            = module.api_gateway.custom_api_url
    frontend_url       = module.s3_cloudfront.custom_domain_url
    s3_bucket          = module.s3_cloudfront.s3_bucket_name
    lambda_function    = module.lambda.function_name
    cloudfront_dist_id = module.s3_cloudfront.cloudfront_distribution_id
  }
}