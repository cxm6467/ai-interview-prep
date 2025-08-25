terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # S3 backend for remote state storage
  backend "s3" {
    bucket         = "ai-interview-prep-terraform-state-276362266002"
    key            = "ai-interview-prep/prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ai-interview-prep-terraform-state-lock"
  }
}