# IAM roles and policies for API Gateway

# Service-linked role for API Gateway is managed automatically by AWS

# Resource-based policy for Lambda function (more secure than IAM role)
resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id           = "AllowExecutionFromAPIGateway-${var.api_name}"
  action                 = "lambda:InvokeFunction"
  function_name          = var.lambda_function_name
  principal              = "apigateway.amazonaws.com"
  source_arn            = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
  qualifier             = var.lambda_qualifier
  
  # Add conditions for additional security
  source_account = data.aws_caller_identity.current.account_id
}

# WAF Web ACL association IAM role
resource "aws_iam_role" "waf_association_role" {
  count = var.enable_waf ? 1 : 0
  name  = "${var.api_name}-waf-association-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "WAFAssumeRole"
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "wafv2.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })

  tags = var.tags
}

# Policy for WAF to access API Gateway
resource "aws_iam_policy" "waf_api_gateway_policy" {
  count       = var.enable_waf ? 1 : 0
  name        = "${var.api_name}-waf-api-gateway-policy"
  description = "Policy for WAF to access API Gateway"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "WAFAPIGatewayAccess"
        Effect = "Allow"
        Action = [
          "apigateway:GET",
          "apigateway:PUT",
          "apigateway:POST",
          "apigateway:DELETE"
        ]
        Resource = [
          aws_apigatewayv2_api.api.arn,
          "${aws_apigatewayv2_api.api.arn}/*"
        ]
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

resource "aws_iam_role_policy_attachment" "waf_api_gateway" {
  count      = var.enable_waf ? 1 : 0
  role       = aws_iam_role.waf_association_role[0].name
  policy_arn = aws_iam_policy.waf_api_gateway_policy[0].arn
}

# Custom authorizer role (if using Lambda authorizers)
resource "aws_iam_role" "api_gateway_authorizer_role" {
  count = var.enable_custom_authorizer ? 1 : 0
  name  = "${var.api_name}-authorizer-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AuthorizerAssumeRole"
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

# Policy for API Gateway to invoke authorizer Lambda
resource "aws_iam_policy" "api_gateway_authorizer_policy" {
  count       = var.enable_custom_authorizer ? 1 : 0
  name        = "${var.api_name}-authorizer-policy"
  description = "Policy for API Gateway to invoke Lambda authorizer"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "InvokeLambdaAuthorizer"
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = var.authorizer_lambda_arn
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "api_gateway_authorizer" {
  count      = var.enable_custom_authorizer ? 1 : 0
  role       = aws_iam_role.api_gateway_authorizer_role[0].name
  policy_arn = aws_iam_policy.api_gateway_authorizer_policy[0].arn
}

# Data sources for IAM conditions
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}