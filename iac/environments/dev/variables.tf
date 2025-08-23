# Environment-specific variables
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "openai_api_key" {
  description = "The OpenAI API key to be used as an environment variable"
  type        = string
  sensitive   = true
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 120
}

variable "lambda_memory" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 512
}

variable "log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 7
}

variable "lambda_reserved_concurrency" {
  description = "Reserved concurrency for Lambda function"
  type        = number
  default     = 10
}

# API Gateway specific variables
variable "api_throttling_burst_limit" {
  description = "API Gateway throttling burst limit"
  type        = number
  default     = 100
}

variable "api_throttling_rate_limit" {
  description = "API Gateway throttling rate limit"  
  type        = number
  default     = 200
}

# Docker image configuration
variable "docker_image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "sha256:053372a5fda47ee16953259513079b519e19a91a18c7dc9b09ad6dab9af574ed"
}

# Security and IAM variables
variable "enable_ssm_parameter_access" {
  description = "Enable Systems Manager Parameter Store access for Lambda"
  type        = bool
  default     = false
}

variable "enable_secrets_manager" {
  description = "Enable AWS Secrets Manager access for Lambda"
  type        = bool
  default     = false
}

variable "enable_cross_account_access" {
  description = "Enable cross-account access roles for CI/CD"
  type        = bool
  default     = false
}