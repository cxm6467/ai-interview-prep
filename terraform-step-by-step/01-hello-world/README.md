# Step 1: Hello World

## Goal
Test that Terraform is installed and working correctly.

## What This Does
- Creates a minimal Terraform configuration
- Uses only built-in functions (no cloud providers)
- Tests basic Terraform commands

## Prerequisites
- Terraform CLI installed

## Instructions

### 1. Install Terraform
Follow: https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli

### 2. Test Installation
```bash
terraform --version
```
Expected: `Terraform v1.x.x`

### 3. Initialize Terraform
```bash
cd terraform-step-by-step/01-hello-world
terraform init
```
Expected: `Terraform has been successfully initialized!`

### 4. Validate Configuration
```bash
terraform validate
```
Expected: `Success! The configuration is valid.`

### 5. Check Plan
```bash
terraform plan
```
Expected: Shows plan with no changes (no resources to create)

### 6. Apply (Safe - No Cloud Resources)
```bash
terraform apply
```
Expected: Shows output values for greeting and timestamp

### 7. Clean Up
```bash
terraform destroy
```
Expected: Nothing to destroy (no resources were created)

## Success Criteria
- ✅ All commands run without errors
- ✅ Outputs display greeting and timestamp
- ✅ Ready to move to Step 2

## Next Step
`02-aws-connection` - Set up AWS provider