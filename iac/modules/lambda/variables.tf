variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "image_uri" {
  description = "ECR image URI for the Lambda function"
  type        = string
}

variable "timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 120
}

variable "memory_size" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 1024
}

variable "environment_variables" {
  description = "Environment variables for the Lambda function"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 14
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "vpc_config" {
  description = "VPC configuration for Lambda function"
  type = object({
    subnet_ids         = list(string)
    security_group_ids = list(string)
  })
  default = null
}

variable "reserved_concurrent_executions" {
  description = "Amount of reserved concurrent executions for this lambda function"
  type        = number
  default     = -1
}

# IAM Access Control Variables
variable "enable_ecr_access" {
  description = "Enable ECR access for Lambda function"
  type        = bool
  default     = false
}

variable "enable_ssm_access" {
  description = "Enable Systems Manager Parameter Store access"
  type        = bool
  default     = false
}

variable "enable_secrets_manager_access" {
  description = "Enable AWS Secrets Manager access"
  type        = bool
  default     = false
}

variable "enable_custom_metrics" {
  description = "Enable custom CloudWatch metrics publishing"
  type        = bool
  default     = false
}

variable "use_enhanced_execution_role" {
  description = "Use enhanced execution role with stricter conditions"
  type        = bool
  default     = false
}

variable "allowed_principals" {
  description = "List of AWS principals allowed to invoke this Lambda"
  type        = list(string)
  default     = []
}