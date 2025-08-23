terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Remote state backend - update with your actual backend configuration
  backend "s3" {
    bucket = "ai-interview-prep-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
    
    # Optional: Enable state locking with DynamoDB
    # dynamodb_table = "terraform-state-lock"
    # encrypt        = true
  }
}