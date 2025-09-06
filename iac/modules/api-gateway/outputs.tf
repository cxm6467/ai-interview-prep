# API Gateway Module Outputs

output "api_id" {
  description = "API Gateway REST API ID"
  value       = aws_api_gateway_rest_api.backend_api.id
}

output "api_url" {
  description = "API Gateway endpoint URL"
  value       = "https://${aws_api_gateway_rest_api.backend_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
}

output "custom_api_url" {
  description = "Custom API domain URL (if configured)"
  value       = var.api_domain_name != "" ? "https://${var.api_domain_name}" : "https://${aws_api_gateway_rest_api.backend_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
}

output "api_arn" {
  description = "API Gateway ARN"
  value       = aws_api_gateway_rest_api.backend_api.arn
}

output "api_execution_arn" {
  description = "API Gateway execution ARN"
  value       = aws_api_gateway_rest_api.backend_api.execution_arn
}

output "api_name" {
  description = "API Gateway name"
  value       = aws_api_gateway_rest_api.backend_api.name
}

