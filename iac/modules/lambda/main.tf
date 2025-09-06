# Lambda Module - Main Configuration for Container-Based Lambda Functions

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# IAM Role for Lambda Functions (shared)
resource "aws_iam_role" "lambda_role" {
  name = "${var.name_prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# IAM Policy for Lambda Function
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.name_prefix}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
    ]
  })
}

# Attach basic execution role to Lambda
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

# CloudWatch Log Groups for both Lambda Functions
resource "aws_cloudwatch_log_group" "main_lambda_logs" {
  name              = "/aws/lambda/${var.name_prefix}-main-api"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "chat_lambda_logs" {
  name              = "/aws/lambda/${var.name_prefix}-chat-api"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# ECR Repository for Main Lambda Docker Images
resource "aws_ecr_repository" "main_lambda_repo" {
  name                 = "${var.name_prefix}-lambda-main"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = var.tags
}

# ECR Repository for Chat Lambda Docker Images
resource "aws_ecr_repository" "chat_lambda_repo" {
  name                 = "${var.name_prefix}-lambda-chat"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = var.tags
}

# ECR Lifecycle Policies
resource "aws_ecr_lifecycle_policy" "main_lambda_repo_lifecycle" {
  repository = aws_ecr_repository.main_lambda_repo.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus     = "tagged"
        tagPrefixList = ["v"]
        countType     = "imageCountMoreThan"
        countNumber   = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "chat_lambda_repo_lifecycle" {
  repository = aws_ecr_repository.chat_lambda_repo.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus     = "tagged"
        tagPrefixList = ["v"]
        countType     = "imageCountMoreThan"
        countNumber   = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}

# ECR Repository Policies
resource "aws_ecr_repository_policy" "main_lambda_repo_policy" {
  repository = aws_ecr_repository.main_lambda_repo.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "MainLambdaECRImageRetrievalPolicy"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = [
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
        Condition = {
          StringLike = {
            "aws:sourceArn" = "arn:aws:lambda:*:*:function:${var.name_prefix}-main-api"
          }
        }
      }
    ]
  })
}

resource "aws_ecr_repository_policy" "chat_lambda_repo_policy" {
  repository = aws_ecr_repository.chat_lambda_repo.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ChatLambdaECRImageRetrievalPolicy"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = [
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
        Condition = {
          StringLike = {
            "aws:sourceArn" = "arn:aws:lambda:*:*:function:${var.name_prefix}-chat-api"
          }
        }
      }
    ]
  })
}

# Get current AWS account ID and region
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}



# Main API Lambda Function
resource "aws_lambda_function" "backend_api" {
  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.main_lambda_logs,
  ]

  function_name = "${var.name_prefix}-main-api"
  role          = aws_iam_role.lambda_role.arn
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  # Use container image instead of zip package
  package_type = "Image"
  image_uri    = "${aws_ecr_repository.main_lambda_repo.repository_url}:latest"

  environment {
    variables = merge(var.environment_variables, {
      NODE_ENV = var.environment
    })
  }

  # Architecture for Lambda (arm64 or x86_64)
  architectures = [var.lambda_architecture]


  # Reserved concurrency to prevent runaway costs
  reserved_concurrent_executions = var.reserved_concurrency >= 0 ? var.reserved_concurrency : null

  tags = var.tags
}

# Chat API Lambda Function
resource "aws_lambda_function" "chat_api" {
  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.chat_lambda_logs,
  ]

  function_name = "${var.name_prefix}-chat-api"
  role          = aws_iam_role.lambda_role.arn
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  # Use container image instead of zip package
  package_type = "Image"
  image_uri    = "${aws_ecr_repository.chat_lambda_repo.repository_url}:latest"

  # Architecture for Lambda (arm64 or x86_64)
  architectures = [var.lambda_architecture]

  environment {
    variables = merge(var.environment_variables, {
      NODE_ENV = var.environment
    })
  }


  # Reserved concurrency to prevent runaway costs
  reserved_concurrent_executions = var.reserved_concurrency >= 0 ? var.reserved_concurrency : null

  tags = var.tags
}





# Legacy single Lambda metric filters for transition compatibility
# These will be managed by existing CloudWatch log groups until fully transitioned

# Legacy Lambda Error Metric Filter (for old backend-api)
# Disabled - old log group was manually deleted during transition
resource "aws_cloudwatch_log_metric_filter" "legacy_lambda_errors" {
  count = 0

  name           = "${var.name_prefix}-lambda-errors"
  log_group_name = "/aws/lambda/${var.name_prefix}-backend-api"
  pattern        = "[timestamp, requestId, level=\"ERROR\", ...]"

  metric_transformation {
    name      = "LambdaErrors"
    namespace = "${var.name_prefix}/Lambda"
    value     = "1"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# Legacy Lambda Duration Metric Filter (for old backend-api)
# Disabled - old log group was manually deleted during transition
resource "aws_cloudwatch_log_metric_filter" "legacy_lambda_duration" {
  count = 0

  name           = "${var.name_prefix}-lambda-duration"
  log_group_name = "/aws/lambda/${var.name_prefix}-backend-api"
  pattern        = "[timestamp, requestId, level=\"INFO\", message=\"REPORT\", ...]"

  metric_transformation {
    name      = "LambdaDuration"
    namespace = "${var.name_prefix}/Lambda"
    value     = "1"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# Note: Docker images are built and pushed by GitHub Actions before Terraform runs
# This removes the complex null_resource provisioners and makes the pipeline cleaner
