variable "aws_region" {
  description = "The AWS region to deploy the resources in"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "The deployment environment (development, staging, production)"
  type        = string
  default     = "development"
}

variable "app_name" {
  description = "Application name used for resource naming"
  type        = string
  default     = "ai-interview-prep"
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
  default     = 1024
}

variable "log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 14
}

variable "domain_name" {
  description = "The base domain name (e.g., chrismarasco.io)"
  type        = string
  default     = "chrismarasco.io"
}

variable "subdomain" {
  description = "The subdomain for the application (e.g., ai-ip)"
  type        = string
  default     = "ai-ip"
}

variable "create_route53_records" {
  description = "Whether to create Route 53 records for custom domain"
  type        = bool
  default     = true
}