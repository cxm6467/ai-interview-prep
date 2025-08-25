# Output the role ARN for use in GitHub Actions
output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions OIDC role"
  value       = aws_iam_role.github_actions.arn
}

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC provider"
  value       = aws_iam_openid_connect_provider.github.arn
}

# S3 backend configuration outputs
output "terraform_state_bucket_name" {
  description = "Name of the S3 bucket for storing Terraform state"
  value       = aws_s3_bucket.terraform_state.id
}

output "terraform_state_bucket_arn" {
  description = "ARN of the S3 bucket for storing Terraform state"
  value       = aws_s3_bucket.terraform_state.arn
}

output "terraform_dynamodb_table_name" {
  description = "Name of the DynamoDB table for Terraform state locking"
  value       = aws_dynamodb_table.terraform_state_lock.id
}

output "terraform_backend_config" {
  description = "Backend configuration for Terraform environments"
  value = {
    bucket         = aws_s3_bucket.terraform_state.id
    region         = data.aws_region.current.name
    dynamodb_table = aws_dynamodb_table.terraform_state_lock.id
    encrypt        = true
  }
}