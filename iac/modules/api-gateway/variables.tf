variable "api_name" {
  description = "Name of the API Gateway"
  type        = string
}

variable "lambda_function_name" {
  description = "Name of the Lambda function to integrate with"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name for the API"
  type        = string
  default     = null
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate for custom domain"
  type        = string
  default     = null
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for DNS record"
  type        = string
  default     = null
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "$default"
}

variable "throttling_burst_limit" {
  description = "API Gateway throttling burst limit"
  type        = number
  default     = 500
}

variable "throttling_rate_limit" {
  description = "API Gateway throttling rate limit"
  type        = number
  default     = 1000
}

variable "enable_access_logs" {
  description = "Enable API Gateway access logs"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "cors_configuration" {
  description = "CORS configuration for the API"
  type = object({
    allow_credentials = bool
    allow_headers     = list(string)
    allow_methods     = list(string)
    allow_origins     = list(string)
    expose_headers    = list(string)
    max_age          = number
  })
  default = {
    allow_credentials = false
    allow_headers     = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins     = ["*"]
    expose_headers    = []
    max_age          = 300
  }
}

# IAM and Security Variables
variable "lambda_qualifier" {
  description = "Lambda function qualifier (version or alias)"
  type        = string
  default     = null
}

variable "enable_waf" {
  description = "Enable WAF protection for API Gateway"
  type        = bool
  default     = false
}

variable "enable_custom_authorizer" {
  description = "Enable custom Lambda authorizer"
  type        = bool
  default     = false
}

variable "authorizer_lambda_arn" {
  description = "ARN of the Lambda function to use as authorizer"
  type        = string
  default     = null
}