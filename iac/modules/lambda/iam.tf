# Additional IAM policies for specific Lambda function requirements

# ECR access policy for Lambda (if Lambda needs to pull images)
resource "aws_iam_policy" "lambda_ecr_policy" {
  count       = var.enable_ecr_access ? 1 : 0
  name        = "${var.function_name}-ecr-policy"
  description = "IAM policy for Lambda ECR access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECRRepositoryAccess"
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
        Resource = aws_ecr_repository.lambda_repo.arn
      },
      {
        Sid    = "ECRTokenAccess"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
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

resource "aws_iam_role_policy_attachment" "lambda_ecr_policy_attachment" {
  count      = var.enable_ecr_access ? 1 : 0
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_ecr_policy[0].arn
}

# Systems Manager Parameter Store access (for secrets management)
resource "aws_iam_policy" "lambda_ssm_policy" {
  count       = var.enable_ssm_access ? 1 : 0
  name        = "${var.function_name}-ssm-policy"
  description = "IAM policy for Lambda SSM Parameter Store access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SSMParameterAccess"
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = [
          "arn:aws:ssm:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:parameter/${var.function_name}/*",
          "arn:aws:ssm:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:parameter/shared/*"
        ]
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_ssm_policy_attachment" {
  count      = var.enable_ssm_access ? 1 : 0
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_ssm_policy[0].arn
}

# AWS Secrets Manager access (for API keys and sensitive data)
resource "aws_iam_policy" "lambda_secrets_policy" {
  count       = var.enable_secrets_manager_access ? 1 : 0
  name        = "${var.function_name}-secrets-policy"
  description = "IAM policy for Lambda Secrets Manager access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerAccess"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          "arn:aws:secretsmanager:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:secret:${var.function_name}/*",
          "arn:aws:secretsmanager:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:secret:shared/*"
        ]
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_secrets_policy_attachment" {
  count      = var.enable_secrets_manager_access ? 1 : 0
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_secrets_policy[0].arn
}

# CloudWatch Metrics custom policy (if Lambda needs to publish custom metrics)
resource "aws_iam_policy" "lambda_metrics_policy" {
  count       = var.enable_custom_metrics ? 1 : 0
  name        = "${var.function_name}-metrics-policy"
  description = "IAM policy for Lambda custom metrics"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchMetricsAccess"
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = [
              "AWS/Lambda",
              "${var.function_name}/Custom"
            ]
          }
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_metrics_policy_attachment" {
  count      = var.enable_custom_metrics ? 1 : 0
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_metrics_policy[0].arn
}

# Enhanced Lambda execution role with proper trust policy
resource "aws_iam_role" "lambda_execution_role_enhanced" {
  count = var.use_enhanced_execution_role ? 1 : 0
  name  = "${var.function_name}-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "LambdaAssumeRole"
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })

  # Inline policy for basic execution
  inline_policy {
    name = "basic-execution"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Sid    = "BasicExecution"
          Effect = "Allow"
          Action = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream", 
            "logs:PutLogEvents"
          ]
          Resource = [
            "arn:aws:logs:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.function_name}",
            "arn:aws:logs:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.function_name}:*"
          ]
        }
      ]
    })
  }

  tags = var.tags
}