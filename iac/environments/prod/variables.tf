variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "openai_api_key" {
  description = "OpenAI API Key"
  type        = string
  sensitive   = true
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30  # Production: shorter timeout
}

variable "lambda_memory" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 1024  # Production: more memory for performance
}

variable "lambda_reserved_concurrency" {
  description = "Lambda reserved concurrency limit"
  type        = number
  default     = 50  # Production: higher concurrency
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30  # Production: longer retention
}

variable "api_throttling_rate_limit" {
  description = "API Gateway throttling rate limit"
  type        = number
  default     = 1000  # Production: higher limits
}

variable "api_throttling_burst_limit" {
  description = "API Gateway throttling burst limit"
  type        = number
  default     = 2000
}

variable "docker_image_tag" {
  description = "Docker image tag/digest to deploy"
  type        = string
  default     = "latest"
}

variable "enable_ssm_parameter_access" {
  description = "Enable SSM Parameter Store access for Lambda"
  type        = bool
  default     = true  # Production: likely to use SSM for config
}

variable "enable_secrets_manager" {
  description = "Enable AWS Secrets Manager access for Lambda"
  type        = bool
  default     = true  # Production: likely to use Secrets Manager
}

variable "enable_cross_account_access" {
  description = "Enable cross-account access for CI/CD"
  type        = bool
  default     = false
}