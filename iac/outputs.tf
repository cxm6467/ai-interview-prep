output "api_gateway_url" {
  description = "The URL of the API Gateway endpoint"
  value       = aws_apigatewayv2_api.api_gw.api_endpoint
}

output "custom_domain_url" {
  description = "The custom domain URL (if Route 53 is configured)"
  value       = var.create_route53_records ? "https://${local.full_domain}" : null
}

output "full_domain" {
  description = "The full domain name for this environment"
  value       = local.full_domain
}