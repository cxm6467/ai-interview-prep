# AWS Setup Guide

This guide will help you set up AWS authentication for deploying your AI Interview Prep application.

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS CLI v2**: Must be installed (the script will check and guide you if not)

## Authentication Methods

### Option 1: AWS SSO (Recommended) 🌟

AWS SSO provides secure, browser-based authentication that's perfect for development work.

```bash
# Run the interactive setup script
npm run aws:login

# Or for quick re-login (after initial setup)
npm run aws:quick-login
```

**What you'll need:**
- SSO start URL (e.g., `https://my-company.awsapps.com/start`)
- SSO region (usually `us-east-1`)
- AWS account ID
- Role name (usually `AdministratorAccess` or similar)

### Option 2: Access Keys

If you don't have SSO set up, you can use IAM user access keys:

```bash
npm run aws:login
# Choose option 2 and enter your access keys
```

## Quick Start

1. **First time setup:**
   ```bash
   npm run aws:login
   ```

2. **Set your AWS profile:**
   ```bash
   export AWS_PROFILE=terraform
   ```

3. **Verify authentication:**
   ```bash
   aws sts get-caller-identity
   ```

4. **Deploy your infrastructure:**
   ```bash
   npm run deploy
   ```

## Browser Authentication Flow

When you run `npm run aws:quick-login`, here's what happens:

1. 🌐 Your default browser opens
2. 🔐 You sign in to your AWS SSO portal
3. ✅ Temporary credentials are automatically configured
4. 🚀 You're ready to deploy!

## Environment Variables

The script automatically sets up a `terraform` profile. To use it:

```bash
export AWS_PROFILE=terraform
```

Or you can set these environment variables manually:
```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=terraform
```

## Troubleshooting

### "Browser didn't open"
- Manually open the URL shown in the terminal
- Or run: `aws sso login --profile terraform`

### "No such profile"
- Run the full setup: `npm run aws:login`
- Choose option 1 to configure SSO

### "Access denied"
- Ensure your AWS user/role has the necessary permissions
- For Terraform, you typically need admin or power user access

### "Session expired"
- Run: `npm run aws:quick-login` to refresh your session
- SSO sessions typically last 8-12 hours

## Security Best Practices

- ✅ Use AWS SSO instead of long-term access keys
- ✅ Use specific IAM roles with minimal required permissions
- ✅ Regularly rotate access keys if you must use them
- ✅ Never commit AWS credentials to version control

## Next Steps

After authentication, you can:

1. **Deploy infrastructure:** `npm run deploy`
2. **Build and deploy:** `npm run docker:deploy`
3. **Destroy resources:** `npm run deploy:destroy`

## AWS CLI Configuration Location

Your AWS configuration is stored in:
- `~/.aws/config` - Profile and SSO settings
- `~/.aws/credentials` - Access keys (if using)

The script creates a `terraform` profile specifically for this project.