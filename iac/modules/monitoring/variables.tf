# Monitoring Module Variables

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "lambda_function_name" {
  description = "Lambda function name to monitor"
  type        = string
}

variable "api_gateway_name" {
  description = "API Gateway name to monitor"
  type        = string
}

variable "cloudfront_distribution_id" {
  description = "CloudFront distribution ID to monitor (optional)"
  type        = string
  default     = ""
}

variable "lambda_error_threshold" {
  description = "Lambda error count threshold for alarm"
  type        = number
  default     = 5
}

variable "lambda_duration_threshold" {
  description = "Lambda duration threshold in milliseconds"
  type        = number
  default     = 25000
}

variable "api_4xx_error_threshold" {
  description = "API Gateway 4XX error count threshold"
  type        = number
  default     = 10
}

variable "api_5xx_error_threshold" {
  description = "API Gateway 5XX error count threshold"
  type        = number
  default     = 5
}

variable "cloudfront_error_threshold" {
  description = "CloudFront error rate threshold (percentage)"
  type        = number
  default     = 5
}


variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}