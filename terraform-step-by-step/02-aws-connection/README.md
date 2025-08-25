# Step 2: AWS Connection

## Goal
Test AWS provider setup and verify connectivity to AWS.

## What This Does
- Configures the AWS provider
- Uses data sources to test AWS API access
- Displays your AWS account information

## Prerequisites
- Step 1 completed successfully
- AWS CLI installed and configured
- AWS credentials available (see setup options below)

## AWS Credentials Setup

### Option 1: Local Development (Recommended for testing)
```bash
# Install AWS CLI
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# Configure with temporary credentials
aws configure
# Enter your AWS Access Key ID, Secret, and region
```

### Option 2: Environment Variables (For automation)
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_SESSION_TOKEN="your-session-token"  # If using temporary credentials
```

### Option 3: Use Existing Role (If available)
If you have the GitHub Actions role already set up, you can use it locally by:
1. Assuming the role via AWS CLI
2. Using the temporary credentials

## Instructions

### 1. Set up AWS credentials (choose one option above)

### 2. Test AWS CLI connectivity
```bash
aws sts get-caller-identity
```
Expected: Shows your account ID, user ARN, etc.

### 3. Initialize Terraform
```bash
cd terraform-step-by-step/02-aws-connection
terraform init
```
Expected: Downloads AWS provider

### 4. Validate Configuration  
```bash
terraform validate
```

### 5. Plan (Test AWS API Access)
```bash
terraform plan
```
Expected: Shows plan with data source reads, no resources to create

### 6. Apply (Safe - Only Reads Data)
```bash
terraform apply
```
Expected: Shows your AWS account ID, region, and user ARN

## Success Criteria
- ✅ Terraform can connect to AWS
- ✅ Outputs show correct AWS account information
- ✅ No permission errors

## Troubleshooting

### "No valid credential sources found"
- Check AWS credentials are configured
- Try `aws sts get-caller-identity` first

### Permission errors
- Verify AWS user/role has basic read permissions
- Check AWS region is correct

## Next Step
`03-simple-s3` - Deploy your first AWS resource