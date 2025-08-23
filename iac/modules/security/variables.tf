variable "domain_name" {
  description = "Domain name for SSL certificate"
  type        = string
}

variable "subject_alternative_names" {
  description = "Additional domain names for the certificate"
  type        = list(string)
  default     = []
}

variable "route53_zone_name" {
  description = "Route 53 hosted zone name"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "certificate_transparency_logging_preference" {
  description = "Certificate transparency logging preference"
  type        = string
  default     = "ENABLED"
  
  validation {
    condition     = contains(["ENABLED", "DISABLED"], var.certificate_transparency_logging_preference)
    error_message = "Certificate transparency logging preference must be either ENABLED or DISABLED."
  }
}

# IAM Security Variables
variable "enable_cross_account_access" {
  description = "Enable cross-account access role for CI/CD"
  type        = bool
  default     = false
}

variable "trusted_account_ids" {
  description = "List of AWS account IDs trusted for cross-account access"
  type        = list(string)
  default     = []
}

variable "external_id" {
  description = "External ID for cross-account role assumption"
  type        = string
  default     = ""
  sensitive   = true
}

variable "allowed_source_ips" {
  description = "List of allowed source IP ranges for cross-account access"
  type        = list(string)
  default     = []
}