# IAM roles and policies for enhanced security

# Service role for API Gateway CloudWatch logging
resource "aws_iam_role" "api_gateway_cloudwatch_role" {
  name = "api-gateway-cloudwatch-${replace(var.domain_name, ".", "-")}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "APIGatewayAssumeRole"
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Policy for API Gateway to write to CloudWatch
resource "aws_iam_policy" "api_gateway_cloudwatch_policy" {
  name        = "api-gateway-cloudwatch-${replace(var.domain_name, ".", "-")}"
  description = "Policy for API Gateway CloudWatch access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchLogsAccess"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents"
        ]
        Resource = [
          "arn:aws:logs:*:*:log-group:/aws/apigateway/*"
        ]
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "api_gateway_cloudwatch" {
  role       = aws_iam_role.api_gateway_cloudwatch_role.name
  policy_arn = aws_iam_policy.api_gateway_cloudwatch_policy.arn
}

# Route53 management role for certificate validation
resource "aws_iam_role" "route53_cert_validation_role" {
  name = "route53-cert-validation-${replace(var.domain_name, ".", "-")}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ACMAssumeRole"
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "acm.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Policy for Route53 record management during certificate validation
resource "aws_iam_policy" "route53_cert_validation_policy" {
  name        = "route53-cert-validation-${replace(var.domain_name, ".", "-")}"
  description = "Policy for Route53 certificate validation"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Route53RecordAccess"
        Effect = "Allow"
        Action = [
          "route53:GetChange",
          "route53:ChangeResourceRecordSets"
        ]
        Resource = [
          "arn:aws:route53:::hostedzone/${data.aws_route53_zone.main.zone_id}",
          "arn:aws:route53:::change/*"
        ]
      },
      {
        Sid    = "Route53ListAccess"
        Effect = "Allow"
        Action = [
          "route53:ListHostedZones",
          "route53:ListResourceRecordSets"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:RequestedRegion" = data.aws_region.current.id
          }
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "route53_cert_validation" {
  role       = aws_iam_role.route53_cert_validation_role.name
  policy_arn = aws_iam_policy.route53_cert_validation_policy.arn
}

# Get current AWS region and account for IAM conditions
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

# Cross-account access role (for CI/CD or multi-account setup)
resource "aws_iam_role" "cross_account_deploy_role" {
  count = var.enable_cross_account_access ? 1 : 0
  name  = "cross-account-deploy-${replace(var.domain_name, ".", "-")}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CrossAccountAssumeRole"
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          AWS = var.trusted_account_ids
        }
        Condition = {
          StringEquals = {
            "sts:ExternalId" = var.external_id
          }
          IpAddress = {
            "aws:SourceIp" = var.allowed_source_ips
          }
        }
      }
    ]
  })

  tags = var.tags
}

# Deployment policy for cross-account access
resource "aws_iam_policy" "cross_account_deploy_policy" {
  count       = var.enable_cross_account_access ? 1 : 0
  name        = "cross-account-deploy-${replace(var.domain_name, ".", "-")}"
  description = "Policy for cross-account deployment access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "LambdaManagement"
        Effect = "Allow"
        Action = [
          "lambda:GetFunction",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:PublishVersion",
          "lambda:CreateAlias",
          "lambda:UpdateAlias"
        ]
        Resource = [
          "arn:aws:lambda:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:function:*${var.domain_name}*"
        ]
      },
      {
        Sid    = "ECRAccess"
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = [
          "arn:aws:ecr:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:repository/*${replace(var.domain_name, ".", "-")}*"
        ]
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "cross_account_deploy" {
  count      = var.enable_cross_account_access ? 1 : 0
  role       = aws_iam_role.cross_account_deploy_role[0].name
  policy_arn = aws_iam_policy.cross_account_deploy_policy[0].arn
}