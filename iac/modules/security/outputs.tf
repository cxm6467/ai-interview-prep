output "certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = aws_acm_certificate_validation.cert.certificate_arn
}

output "route53_zone_id" {
  description = "ID of the Route 53 hosted zone"
  value       = data.aws_route53_zone.main.zone_id
}

output "domain_validation_options" {
  description = "Domain validation options for the certificate"
  value       = aws_acm_certificate.cert.domain_validation_options
}

# IAM Role outputs
output "api_gateway_cloudwatch_role_arn" {
  description = "ARN of the API Gateway CloudWatch role"
  value       = aws_iam_role.api_gateway_cloudwatch_role.arn
}

output "route53_cert_validation_role_arn" {
  description = "ARN of the Route53 certificate validation role"
  value       = aws_iam_role.route53_cert_validation_role.arn
}

output "cross_account_deploy_role_arn" {
  description = "ARN of the cross-account deployment role (if enabled)"
  value       = var.enable_cross_account_access ? aws_iam_role.cross_account_deploy_role[0].arn : null
}