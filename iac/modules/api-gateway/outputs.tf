output "api_id" {
  description = "ID of the API Gateway"
  value       = aws_apigatewayv2_api.api.id
}

output "api_endpoint" {
  description = "URL of the API Gateway endpoint"
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "custom_domain_name" {
  description = "Custom domain name (if configured)"
  value       = var.domain_name
}

output "custom_domain_url" {
  description = "Custom domain URL (if configured)"
  value       = var.domain_name != null ? "https://${var.domain_name}" : null
}

output "stage_name" {
  description = "Name of the API Gateway stage"
  value       = aws_apigatewayv2_stage.stage.name
}

output "execution_arn" {
  description = "Execution ARN of the API Gateway"
  value       = aws_apigatewayv2_api.api.execution_arn
}

output "stage_invoke_url" {
  description = "URL to invoke the API stage"
  value       = aws_apigatewayv2_stage.stage.invoke_url
}