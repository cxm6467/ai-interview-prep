# 🔐 GitHub Secrets Verification Checklist

## Required Secrets

### 1. AWS_ROLE_ARN
**Purpose**: AWS IAM role for GitHub Actions OIDC authentication
**Format**: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`
**Example**: `arn:aws:iam::276362266002:role/ai-interview-prep-development-github-actions`

**To verify**:
- [ ] Go to GitHub repo → Settings → Secrets and variables → Actions
- [ ] Confirm `AWS_ROLE_ARN` exists
- [ ] Note the AWS account ID from the ARN

### 2. OPENAI_API_KEY  
**Purpose**: OpenAI API access for the application
**Format**: `sk-...` (OpenAI API key format)

**To verify**:
- [ ] Confirm `OPENAI_API_KEY` exists in GitHub secrets
- [ ] Verify it starts with `sk-` prefix

## Additional Information Needed

### AWS Account Details
From the `AWS_ROLE_ARN`, extract:
- **Account ID**: `____________` (12 digits from ARN)
- **Region**: `us-east-1` (assumed, verify in AWS Console)
- **Role Name**: `________________________`

### Bootstrap Resources
Check if these exist in AWS Console:
- [ ] S3 bucket for Terraform state: `ai-interview-prep-terraform-state-ACCOUNT_ID`
- [ ] DynamoDB table for state locking: `ai-interview-prep-terraform-state-lock`
- [ ] IAM role for GitHub Actions: (from ARN above)

## Next Steps After Verification
1. ✅ Confirm secrets exist
2. 🔧 Set up local AWS CLI with temporary credentials
3. 🏗️ Create minimal Terraform configuration
4. 🧪 Test AWS connectivity

---
**Status**: Waiting for secret verification