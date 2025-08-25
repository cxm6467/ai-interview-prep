# Step 1: Hello World Terraform Configuration
# This is the simplest possible Terraform configuration to test installation

terraform {
  # Specify minimum Terraform version
  required_version = ">= 1.0"
}

# A simple local value to test Terraform syntax
locals {
  greeting = "Hello from Terraform!"
  timestamp = timestamp()
}

# Output to verify everything works
output "greeting" {
  description = "Simple greeting to verify Terraform works"
  value = local.greeting
}

output "current_time" {
  description = "Current timestamp when Terraform runs"
  value = local.timestamp
}