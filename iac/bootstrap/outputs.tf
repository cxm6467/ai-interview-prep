# Output the role ARN for use in GitHub Actions
output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions OIDC role"
  value       = aws_iam_role.github_actions.arn
}

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC provider"
  value       = aws_iam_openid_connect_provider.github.arn
}