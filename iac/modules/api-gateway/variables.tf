# API Gateway Module Variables

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "lambda_function_name" {
  description = "Main Lambda function name"
  type        = string
}

variable "chat_lambda_function_name" {
  description = "Chat Lambda function name"
  type        = string
}

variable "common_tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "api_domain_name" {
  description = "Custom domain name for API Gateway"
  type        = string
  default     = ""
}

variable "cors_allowed_origins" {
  description = "List of allowed CORS origins"
  type        = list(string)
  default     = ["*"]
}

# Local values
locals {
  name_prefix = var.name_prefix
  common_tags = var.common_tags
}