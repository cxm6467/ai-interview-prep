# GitHub OIDC Provider and IAM Role for GitHub Actions
# This allows GitHub Actions to authenticate to AWS without storing long-lived credentials

# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}

# GitHub OIDC Identity Provider
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ]

  tags = {
    Name        = "github-actions-oidc"
    Environment = var.environment
    Application = var.app_name
  }
}

# IAM Role for GitHub Actions
resource "aws_iam_role" "github_actions" {
  name = "${var.app_name}-${var.environment}-github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_repository}:*"
          }
        }
      }
    ]
  })

  tags = {
    Name        = "${var.app_name}-${var.environment}-github-actions"
    Environment = var.environment
    Application = var.app_name
  }
}

# Policy for GitHub Actions - ECR and Lambda deployment permissions
resource "aws_iam_policy" "github_actions_policy" {
  name        = "${var.app_name}-${var.environment}-github-actions-policy"
  description = "Policy for GitHub Actions to deploy infrastructure and applications"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # ECR permissions
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchImportImage",
          "ecr:CompleteLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage"
        ]
        Resource = "*"
      },
      # Lambda permissions
      {
        Effect = "Allow"
        Action = [
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:GetFunction",
          "lambda:GetFunctionConfiguration",
          "lambda:PublishVersion"
        ]
        Resource = "arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:function:${var.app_name}-${var.environment}"
      },
      # CloudWatch Logs
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.app_name}-${var.environment}*"
      },
      # S3 for frontend deployment
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.app_name}-${var.environment}-frontend",
          "arn:aws:s3:::${var.app_name}-${var.environment}-frontend/*"
        ]
      },
      # CloudFront invalidation
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = "*"
      },
      # Route 53 permissions for DNS and SSL certificates
      {
        Effect = "Allow"
        Action = [
          "route53:ListHostedZones",
          "route53:GetHostedZone",
          "route53:ChangeResourceRecordSets",
          "route53:GetChange",
          "route53:ListResourceRecordSets"
        ]
        Resource = "*"
      },
      # ACM (SSL Certificate) permissions
      {
        Effect = "Allow"
        Action = [
          "acm:ListCertificates",
          "acm:DescribeCertificate",
          "acm:RequestCertificate",
          "acm:AddTagsToCertificate"
        ]
        Resource = "*"
      },
      # Terraform state and general AWS access
      {
        Effect = "Allow"
        Action = [
          "sts:GetCallerIdentity",
          "iam:GetRole",
          "iam:PassRole"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "${var.app_name}-${var.environment}-github-actions-policy"
    Environment = var.environment
    Application = var.app_name
  }
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "github_actions_policy_attachment" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_actions_policy.arn
}

# Output the role ARN for use in GitHub Actions
output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions OIDC role"
  value       = aws_iam_role.github_actions.arn
}

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC provider"
  value       = aws_iam_openid_connect_provider.github.arn
}