# Lambda Module Outputs

# Main API Lambda outputs
output "function_name" {
  description = "Main Lambda function name"
  value       = aws_lambda_function.backend_api.function_name
}

output "function_arn" {
  description = "Main Lambda function ARN"
  value       = aws_lambda_function.backend_api.arn
}

output "invoke_arn" {
  description = "Main Lambda function invoke ARN"
  value       = aws_lambda_function.backend_api.invoke_arn
}

# Chat API Lambda outputs  
output "chat_function_name" {
  description = "Chat Lambda function name"
  value       = aws_lambda_function.chat_api.function_name
}

output "chat_function_arn" {
  description = "Chat Lambda function ARN"
  value       = aws_lambda_function.chat_api.arn
}

output "chat_invoke_arn" {
  description = "Chat Lambda function invoke ARN"
  value       = aws_lambda_function.chat_api.invoke_arn
}

# Shared outputs
output "lambda_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_role.arn
}

output "main_ecr_repository_url" {
  description = "Main Lambda ECR repository URL"
  value       = aws_ecr_repository.main_lambda_repo.repository_url
}

output "chat_ecr_repository_url" {
  description = "Chat Lambda ECR repository URL"
  value       = aws_ecr_repository.chat_lambda_repo.repository_url
}

output "main_ecr_repository_name" {
  description = "Main Lambda ECR repository name"
  value       = aws_ecr_repository.main_lambda_repo.name
}

output "chat_ecr_repository_name" {
  description = "Chat Lambda ECR repository name"
  value       = aws_ecr_repository.chat_lambda_repo.name
}