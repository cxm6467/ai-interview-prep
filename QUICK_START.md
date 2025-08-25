# 🚀 Quick Start Guide

## Before You Begin

### 1. Verify GitHub Secrets
Go to your GitHub repo: **Settings → Secrets and variables → Actions**

Check these exist:
- ✅ `AWS_ROLE_ARN` (format: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`)  
- ✅ `OPENAI_API_KEY` (format: `sk-...`)

### 2. Install Tools Locally

**Terraform CLI**:
```bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

**AWS CLI**:
```bash
# macOS  
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Verify Installation**:
```bash
terraform --version  # Should show v1.x.x
aws --version        # Should show aws-cli/2.x.x
```

## 🎯 Start Here: Step 1

```bash
cd terraform-step-by-step/01-hello-world
cat README.md  # Read the instructions
terraform init # Initialize Terraform
terraform apply # Test basic functionality
```

**Expected Result**: Terraform outputs a greeting and timestamp

## 🔗 Next Steps

1. **Step 1**: `01-hello-world` - Test Terraform installation ← **START HERE**
2. **Step 2**: `02-aws-connection` - Connect to AWS
3. **Step 3**: `03-simple-s3` - Deploy first resource
4. Continue through `terraform-step-by-step/` directories

## 📚 Documentation References

Each step includes links to official documentation. Key resources:
- [Terraform AWS Get Started](https://developer.hashicorp.com/terraform/tutorials/aws-get-started)
- [AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Configuration Language](https://developer.hashicorp.com/terraform/language)

---
**🎉 Ready to begin! Start with Step 1 above.**