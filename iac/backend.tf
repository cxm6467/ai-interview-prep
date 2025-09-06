# Remote State Configuration
# This will be uncommented once S3 bucket is created for state storage

# terraform {
#   backend "s3" {
#     bucket  = "ai-interview-prep-terraform-state"
#     key     = "global/terraform.tfstate"
#     region  = "us-east-1"
#     encrypt = true
#   }
# }