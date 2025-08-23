# 🔍 Dry Run Guide

This guide covers all the ways to run Terraform in "dry run" mode to see what changes would be made without actually applying them.

## Why Use Dry Runs?

- 🛡️ **Safety First**: See exactly what will change before making it permanent
- 📊 **Impact Assessment**: Understand the scope of changes
- 💰 **Cost Planning**: Estimate infrastructure costs before deployment
- 🔍 **Debugging**: Troubleshoot issues without affecting live resources
- 📝 **Documentation**: Generate change reports for reviews

## 🚀 Quick Start

### Simplest Dry Run
```bash
npm run deploy:dry-run
```

### Interactive Dry Run (Recommended)
```bash
npm run deploy:interactive
# Choose option 1: "Dry Run (Plan only)"
```

## 📋 Local Dry Run Commands

### Basic Dry Run Options
```bash
# Standard plan (shows what would change)
npm run deploy:plan

# Alias for the above
npm run deploy:dry-run

# Detailed plan with exit codes
npm run deploy:plan:detailed

# Plan destruction (see what would be deleted)
npm run deploy:destroy:dry-run

# Docker build + plan (without deploying)
npm run docker:deploy:dry-run
```

### Advanced Terraform Commands
```bash
# Initialize Terraform (safe to run anytime)
npm run tf:init

# Validate configuration (syntax check)
npm run tf:validate

# Format Terraform files
npm run tf:format

# Refresh state from AWS (see current state)
npm run tf:refresh
```

## 🎯 Interactive Deployment Script

The interactive script (`npm run deploy:interactive`) provides a guided experience:

### Available Options:
1. **🔍 Dry Run** - Plan only, see changes without applying
2. **📋 Plan with Details** - Detailed change analysis with exit codes
3. **📊 Show Current State** - View what's currently deployed
4. **🔄 Refresh State** - Update state from AWS
5. **💥 Plan Destroy** - See what would be deleted
6. **🚀 Full Deploy** - Build and deploy (with confirmation)

### Example Session:
```bash
npm run deploy:interactive

# Output:
╔═══════════════════════════════════════════════════════════════╗
║                    🚀 AI Interview Prep                       ║
║                  Interactive Deployment                       ║
╚═══════════════════════════════════════════════════════════════╝

🔍 Checking prerequisites...
✅ All required tools are installed

🔐 Checking AWS authentication...
✅ AWS authentication successful

📊 Checking current infrastructure state...
✅ Terraform state exists

🎯 What would you like to do?
1) 🔍 Dry Run (Plan only - see what changes would be made)
...

Enter your choice: 1
```

## 🤖 GitHub Actions Dry Runs

### Automatic Dry Runs
- **Pull Requests**: Automatically run on PRs affecting backend/infrastructure
- **Workflow**: `terraform-plan.yml` runs comprehensive planning

### Manual Dry Runs
Navigate to **Actions** → **Deploy Backend** → **Run workflow**:
- ✅ Check "Dry run only"
- Choose environment (staging/production)
- Select "plan" as terraform action

### Manual Planning Workflow
Navigate to **Actions** → **Terraform Plan (Dry Run)** → **Run workflow**:
- Choose environment
- Select plan type (apply/destroy)
- Enable detailed output

## 📊 Understanding Plan Output

### Plan Symbols
```
+ create     - Resource will be created
~ update     - Resource will be modified in-place
-/+ replace  - Resource will be destroyed and recreated
- destroy    - Resource will be destroyed
```

### Exit Codes (when using `deploy:plan:detailed`)
```
0 = No changes needed (infrastructure up to date)
1 = Plan failed with errors
2 = Changes detected (plan successful, changes ready)
```

### Example Plan Output
```hcl
Terraform will perform the following actions:

  # aws_lambda_function.ai_handler will be updated in-place
  ~ resource "aws_lambda_function" "ai_handler" {
      id            = "consolidated-ai-handler"
    ~ image_uri     = "123456789012.dkr.ecr.us-east-1.amazonaws.com/consolidated-ai-handler:v1" -> "123456789012.dkr.ecr.us-east-1.amazonaws.com/consolidated-ai-handler:latest"
      # (15 unchanged attributes hidden)
    }

Plan: 0 to add, 1 to change, 0 to destroy.
```

## 🔒 Security Analysis in Dry Runs

The GitHub Actions dry run includes security analysis:
- ✅ Checks for properly marked sensitive values
- 🚨 Detects potential hardcoded secrets
- 📊 Reviews IAM permissions and policies
- 💡 Provides security recommendations

## 💰 Cost Estimation

Dry runs include estimated costs:
```
### 💰 Estimated Monthly Costs

| Resource | Estimated Cost |
|----------|----------------|
| Lambda Function | $0-5 (depends on invocations) |
| API Gateway | $0-10 (depends on requests) |
| ECR Repository | $0-1 (storage) |
| CloudWatch Logs | $0-2 (log retention) |

Total Estimated Range: $0-18/month
```

## 🛠️ Advanced Scenarios

### Save and Apply Plans
```bash
# Generate and save a plan
cd iac
terraform plan -var="openai_api_key=$OPENAI_API_KEY" -out=myplan

# Review the saved plan
terraform show myplan

# Apply the specific plan later
terraform apply myplan
```

### Compare Different Configurations
```bash
# Plan with different variable values
terraform plan -var="aws_region=us-west-2" -var="openai_api_key=$OPENAI_API_KEY"

# Plan with variable file
terraform plan -var-file="staging.tfvars"
```

### Target Specific Resources
```bash
# Plan changes to only the Lambda function
terraform plan -target=aws_lambda_function.ai_handler -var="openai_api_key=$OPENAI_API_KEY"

# Plan changes to multiple specific resources
terraform plan -target=aws_lambda_function.ai_handler -target=aws_apigatewayv2_api.api_gw
```

## 📝 Workflow Examples

### Before Major Changes
```bash
# 1. Check current state
npm run tf:refresh

# 2. Run detailed dry run
npm run deploy:plan:detailed

# 3. Review changes carefully
# 4. If satisfied, deploy
npm run deploy
```

### Before Destructive Operations
```bash
# 1. See what would be destroyed
npm run deploy:destroy:dry-run

# 2. Review the destruction plan
# 3. If certain, destroy
npm run deploy:destroy
```

### CI/CD Integration
```bash
# In your CI pipeline, always plan first
npm run deploy:plan

# Check exit code
if [ $? -eq 2 ]; then
  echo "Changes detected, proceeding with deployment"
  npm run deploy
elif [ $? -eq 0 ]; then
  echo "No changes needed"
else
  echo "Plan failed, aborting"
  exit 1
fi
```

## 🚨 Best Practices

### Always Dry Run For:
- ✅ Production deployments
- ✅ Major infrastructure changes
- ✅ Destructive operations
- ✅ New feature deployments
- ✅ Configuration changes

### Review Checklist:
- 📋 Resources being created/modified/destroyed
- 🔒 Security implications of changes
- 💰 Cost impact of new resources
- 📊 Dependencies and order of operations
- 🔄 Rollback strategy if needed

### Save Plans When:
- 📅 Deploying during maintenance windows
- 👥 Changes need approval from team
- 🔄 Multi-step deployments
- 📋 Compliance requirements for change tracking

## 🔧 Troubleshooting Dry Runs

### Common Issues:

**"No changes detected" but you expect changes:**
```bash
# Refresh state first
npm run tf:refresh
npm run deploy:plan
```

**Plan fails with authentication errors:**
```bash
# Check AWS authentication
aws sts get-caller-identity

# Re-authenticate if needed
npm run aws:quick-login
```

**Plan shows unexpected changes:**
```bash
# Check what's actually deployed
npm run tf:refresh

# Compare with your configuration
cd iac && terraform show
```

**Environment variables not set:**
```bash
# Check required variables
echo $OPENAI_API_KEY
echo $AWS_PROFILE

# Set missing variables
export OPENAI_API_KEY=your_key_here
export AWS_PROFILE=terraform
```

## 📊 Interpreting Results

### Green Light (Safe to Deploy):
- ✅ No errors in plan
- ✅ Expected changes only
- ✅ No security warnings
- ✅ Acceptable cost impact

### Yellow Light (Review Needed):
- ⚠️ Unexpected resource changes
- ⚠️ Security recommendations
- ⚠️ Higher than expected costs
- ⚠️ Dependencies on external resources

### Red Light (Do Not Deploy):
- ❌ Plan errors
- ❌ Security issues detected
- ❌ Resources being destroyed unexpectedly
- ❌ Syntax or validation errors

Remember: **Dry runs are free and safe** - use them liberally to understand your infrastructure changes!