provider "aws" {
  region = var.aws_region
  # In local development, use the terraform profile
  # In CI/CD, AWS credentials will be provided via environment variables
}

# Local values for domain configuration
locals {
  full_domain = var.environment == "development" ? "dev.${var.subdomain}.${var.domain_name}" : "${var.subdomain}.${var.domain_name}"
}

# Import existing resources to avoid EntityAlreadyExists errors
import {
  to = aws_ecr_repository.lambda_repo
  id = "ai-interview-prep-development"
}

import {
  to = aws_iam_role.lambda_exec_role
  id = "ai-interview-prep-development-lambda-role"
}

import {
  to = aws_iam_policy.lambda_policy
  id = "arn:aws:iam::276362266002:policy/ai-interview-prep-development-lambda-policy"
}

import {
  to = aws_cloudwatch_log_group.lambda_logs
  id = "/aws/lambda/ai-interview-prep-development"
}

import {
  to = aws_lambda_function.ai_handler
  id = "ai-interview-prep-development"
}

import {
  to = aws_apigatewayv2_domain_name.api_domain[0]
  id = "dev.ai-ip.chrismarasco.io"
}

# Check if API Gateway API exists and import if needed
# Based on existing APIs, likely using one of the development APIs
import {
  to = aws_apigatewayv2_api.api_gw
  id = "26d8r5k3sg"  # Most recent ai-interview-prep-development-api
}

# ECR Repository to store the Docker Image
resource "aws_ecr_repository" "lambda_repo" {
  name = "${var.app_name}-${var.environment}"

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# IAM Role and Policy for Lambda execution
resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.app_name}-${var.environment}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name = "${var.app_name}-${var.environment}-lambda-policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.app_name}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# The Lambda Function itself, deployed from the ECR image
resource "aws_lambda_function" "ai_handler" {
  function_name = "${var.app_name}-${var.environment}"
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.lambda_repo.repository_url}:latest"
  role          = aws_iam_role.lambda_exec_role.arn
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory

  environment {
    variables = {
      OPENAI_API_KEY = var.openai_api_key
      ENVIRONMENT    = var.environment
      DEBUG          = var.environment == "development" ? "true" : "false"
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda_logs]

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# API Gateway to expose the Lambda function via HTTP
resource "aws_apigatewayv2_api" "api_gw" {
  name          = "${var.app_name}-${var.environment}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["content-type", "x-amz-date", "authorization", "x-api-key"]
    allow_methods     = ["*"]
    allow_origins     = ["*"]
    expose_headers    = []
    max_age           = 300
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# Integration between API Gateway and Lambda
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.api_gw.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.ai_handler.invoke_arn
  integration_method = "POST"
}

# The route that triggers the Lambda function
resource "aws_apigatewayv2_route" "api_route" {
  api_id    = aws_apigatewayv2_api.api_gw.id
  route_key = "POST /"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# The deployment stage for the API
resource "aws_apigatewayv2_stage" "api_stage" {
  api_id      = aws_apigatewayv2_api.api_gw.id
  name        = "$default"
  auto_deploy = true
}

# Permission for API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ai_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api_gw.execution_arn}/*"
}

# Data source to get the existing hosted zone
data "aws_route53_zone" "main" {
  count = var.create_route53_records ? 1 : 0
  name  = var.domain_name
}

# SSL Certificate for the custom domain
resource "aws_acm_certificate" "api_cert" {
  count             = var.create_route53_records ? 1 : 0
  domain_name       = local.full_domain
  validation_method = "DNS"

  subject_alternative_names = var.environment == "development" ? [] : ["www.${local.full_domain}"]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# Route 53 record for certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = var.create_route53_records ? {
    for dvo in aws_acm_certificate.api_cert[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main[0].zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "api_cert" {
  count                   = var.create_route53_records ? 1 : 0
  certificate_arn         = aws_acm_certificate.api_cert[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# Custom domain for API Gateway
resource "aws_apigatewayv2_domain_name" "api_domain" {
  count       = var.create_route53_records ? 1 : 0
  domain_name = local.full_domain

  domain_name_configuration {
    certificate_arn = aws_acm_certificate_validation.api_cert[0].certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

# API Gateway domain mapping
resource "aws_apigatewayv2_api_mapping" "api_mapping" {
  count       = var.create_route53_records ? 1 : 0
  api_id      = aws_apigatewayv2_api.api_gw.id
  domain_name = aws_apigatewayv2_domain_name.api_domain[0].id
  stage       = aws_apigatewayv2_stage.api_stage.id
}

# Route 53 A record for the API
resource "aws_route53_record" "api_record" {
  count   = var.create_route53_records ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = local.full_domain
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.api_domain[0].domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api_domain[0].domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}