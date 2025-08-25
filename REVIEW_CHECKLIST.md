# 🔍 PR Review Checklist

## 🎯 Key Things to Validate

### ✅ Hard-coded ID Elimination
- [ ] Search for any remaining hard-coded IDs: `grep -r "Z09619741MD1JY4BVC74L\|o5a8c9umc8\|44r3y4\|276362266002" iac/`
- [ ] Verify all imports use variables: Check `iac/main.tf` import blocks
- [ ] Confirm dynamic resource naming: All resources use `${var.app_name}-${var.environment}` pattern

### ✅ Configuration Flexibility
- [ ] Review `iac/variables.tf` for comprehensive variable definitions
- [ ] Check `iac/data-sources.tf` for proper resource detection logic
- [ ] Validate `terraform.tfvars.example` includes all necessary variables

### ✅ GitHub Actions Workflow
- [ ] Review `.github/workflows/terraform-management.yml` for:
  - [ ] Proper OIDC authentication setup
  - [ ] Plan/apply/destroy workflow logic
  - [ ] PR comment integration
  - [ ] Manual workflow dispatch options
  - [ ] Environment-specific configurations

### ✅ Terraform Best Practices
- [ ] Run `terraform validate` - should pass without errors
- [ ] Run `terraform init` - should initialize successfully  
- [ ] Check for duplicate resources or data sources
- [ ] Verify import blocks reference existing data sources

### ✅ Security Review
- [ ] No hard-coded secrets or sensitive values
- [ ] All AWS account references use `data.aws_caller_identity.current.account_id`
- [ ] IAM permissions follow principle of least privilege
- [ ] Environment isolation maintained

### ✅ Backward Compatibility
- [ ] Existing resource functionality preserved
- [ ] No breaking changes to resource naming conventions
- [ ] Migration path clear for existing deployments

## 🚨 Red Flags to Watch For
- Hard-coded AWS account IDs, zone IDs, or resource IDs
- Missing variable definitions for configurable values
- Shell script dependencies (should be eliminated)
- Overly permissive IAM policies
- Missing error handling in workflows

## 💡 Bonus Points
- [ ] Clear documentation and examples
- [ ] Comprehensive variable descriptions
- [ ] Good error handling and user feedback
- [ ] Environment-agnostic configuration
- [ ] Modern Terraform practices (data sources, locals, etc.)

---
**This PR modernizes our entire infrastructure codebase - take time to review thoroughly!**