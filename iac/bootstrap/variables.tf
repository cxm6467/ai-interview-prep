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

variable "github_repository" {
  description = "GitHub repository in the format owner/repo-name (e.g., cxm6467/ai-interview-prep)"
  type        = string
  default     = "cxm6467/ai-interview-prep"
}