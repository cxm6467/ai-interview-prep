# API Gateway Configuration for Backend Lambda

# Get current AWS account ID and region
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Construct Lambda ARNs to avoid dependency cycles
locals {
  main_lambda_arn = "arn:aws:lambda:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:function:${var.lambda_function_name}"
  chat_lambda_arn = "arn:aws:lambda:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:function:${var.chat_lambda_function_name}"
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "backend_api" {
  name        = "${local.name_prefix}-api"
  description = "API Gateway for AI Interview Prep backend"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  binary_media_types = [
    "application/pdf",
    "application/octet-stream",
    "image/*",
    "audio/*",
    "video/*"
  ]

  tags = local.common_tags
}

# Chat API Gateway Resource
resource "aws_api_gateway_resource" "chat" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  parent_id   = aws_api_gateway_rest_api.backend_api.root_resource_id
  path_part   = "chat"
}

# Analyze API Gateway Resource
resource "aws_api_gateway_resource" "analyze" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  parent_id   = aws_api_gateway_rest_api.backend_api.root_resource_id
  path_part   = "analyze"
}

# API Gateway Resource (proxy for all other paths)
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  parent_id   = aws_api_gateway_rest_api.backend_api.root_resource_id
  path_part   = "{proxy+}"
}

# API Gateway Method for Chat resource
resource "aws_api_gateway_method" "chat" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  resource_id   = aws_api_gateway_resource.chat.id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Method for Analyze resource
resource "aws_api_gateway_method" "analyze" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  resource_id   = aws_api_gateway_resource.analyze.id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Method for ANY on proxy resource
resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

# API Gateway Method for root resource
resource "aws_api_gateway_method" "root" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  resource_id   = aws_api_gateway_rest_api.backend_api.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

# Lambda Integration for Chat resource (routes to Chat Lambda)
resource "aws_api_gateway_integration" "lambda_chat" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.chat.id
  http_method = aws_api_gateway_method.chat.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${local.chat_lambda_arn}/invocations"
}

# Lambda Integration for Analyze resource (routes to Main Lambda)
resource "aws_api_gateway_integration" "lambda_analyze" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.analyze.id
  http_method = aws_api_gateway_method.analyze.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${local.main_lambda_arn}/invocations"
}

# Lambda Integration for proxy resource (routes to Main Lambda)
resource "aws_api_gateway_integration" "lambda_proxy" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${local.main_lambda_arn}/invocations"
}

# Lambda Integration for root resource
resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_rest_api.backend_api.root_resource_id
  http_method = aws_api_gateway_method.root.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:lambda:path/2015-03-31/functions/${local.main_lambda_arn}/invocations"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "backend_api" {
  depends_on = [
    aws_api_gateway_integration.lambda_chat,
    aws_api_gateway_integration.lambda_analyze,
    aws_api_gateway_integration.lambda_proxy,
    aws_api_gateway_integration.lambda_root,
    aws_api_gateway_integration.chat_options,
    aws_api_gateway_integration.analyze_options,
    aws_api_gateway_integration.proxy_options,
    aws_api_gateway_integration.root_options,
  ]

  rest_api_id = aws_api_gateway_rest_api.backend_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.chat.id,
      aws_api_gateway_method.chat.id,
      aws_api_gateway_integration.lambda_chat.id,
      aws_api_gateway_resource.analyze.id,
      aws_api_gateway_method.analyze.id,
      aws_api_gateway_integration.lambda_analyze.id,
      aws_api_gateway_resource.proxy.id,
      aws_api_gateway_method.proxy.id,
      aws_api_gateway_integration.lambda_proxy.id,
      aws_api_gateway_method.root.id,
      aws_api_gateway_integration.lambda_root.id,
      aws_api_gateway_method.chat_options.id,
      aws_api_gateway_integration.chat_options.id,
      aws_api_gateway_method.analyze_options.id,
      aws_api_gateway_integration.analyze_options.id,
      aws_api_gateway_method.proxy_options.id,
      aws_api_gateway_integration.proxy_options.id,
      aws_api_gateway_method.root_options.id,
      aws_api_gateway_integration.root_options.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage (simplified - no access logging to avoid CloudWatch Logs role requirement)
resource "aws_api_gateway_stage" "backend_api" {
  deployment_id = aws_api_gateway_deployment.backend_api.id
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  stage_name    = var.environment

  tags = local.common_tags
}

# CloudWatch logging removed to avoid requiring CloudWatch Logs role in API Gateway account settings

# Lambda Permission for API Gateway to invoke Main Lambda
resource "aws_lambda_permission" "api_gateway_main" {
  statement_id  = "AllowExecutionFromAPIGatewayMain"
  action        = "lambda:InvokeFunction"
  function_name = local.main_lambda_arn
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.backend_api.execution_arn}/*/*"
}

# Lambda Permission for API Gateway to invoke Chat Lambda
resource "aws_lambda_permission" "api_gateway_chat" {
  statement_id  = "AllowExecutionFromAPIGatewayChat"
  action        = "lambda:InvokeFunction"
  function_name = local.chat_lambda_arn
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.backend_api.execution_arn}/*/*"
}

# CORS OPTIONS Method for Chat resource
resource "aws_api_gateway_method" "chat_options" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  resource_id   = aws_api_gateway_resource.chat.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# CORS OPTIONS Method for Analyze resource
resource "aws_api_gateway_method" "analyze_options" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  resource_id   = aws_api_gateway_resource.analyze.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# CORS OPTIONS Method for proxy resource
resource "aws_api_gateway_method" "proxy_options" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# CORS OPTIONS Integration for Chat resource
resource "aws_api_gateway_integration" "chat_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.chat.id
  http_method = aws_api_gateway_method.chat_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# CORS OPTIONS Integration for Analyze resource
resource "aws_api_gateway_integration" "analyze_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.analyze.id
  http_method = aws_api_gateway_method.analyze_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# CORS OPTIONS Integration for proxy resource
resource "aws_api_gateway_integration" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# CORS OPTIONS Method Response for Chat resource
resource "aws_api_gateway_method_response" "chat_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.chat.id
  http_method = aws_api_gateway_method.chat_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# CORS OPTIONS Method Response for Analyze resource
resource "aws_api_gateway_method_response" "analyze_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.analyze.id
  http_method = aws_api_gateway_method.analyze_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# CORS OPTIONS Method Response for proxy resource
resource "aws_api_gateway_method_response" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# CORS OPTIONS Integration Response for Chat resource
resource "aws_api_gateway_integration_response" "chat_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.chat.id
  http_method = aws_api_gateway_method.chat_options.http_method
  status_code = aws_api_gateway_method_response.chat_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${join(",", var.cors_allowed_origins)}'"
  }
}

# CORS OPTIONS Integration Response for Analyze resource
resource "aws_api_gateway_integration_response" "analyze_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.analyze.id
  http_method = aws_api_gateway_method.analyze_options.http_method
  status_code = aws_api_gateway_method_response.analyze_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${join(",", var.cors_allowed_origins)}'"
  }
}

# CORS OPTIONS Integration Response for proxy resource
resource "aws_api_gateway_integration_response" "proxy_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_options.http_method
  status_code = aws_api_gateway_method_response.proxy_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${join(",", var.cors_allowed_origins)}'"
  }
}

# API Gateway Method Response for Chat endpoint
resource "aws_api_gateway_method_response" "chat_200" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.chat.id
  http_method = aws_api_gateway_method.chat.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# API Gateway Method Response for Analyze endpoint
resource "aws_api_gateway_method_response" "analyze_200" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.analyze.id
  http_method = aws_api_gateway_method.analyze.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# API Gateway Method Response for CORS
resource "aws_api_gateway_method_response" "proxy_200" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# CORS OPTIONS Method for root resource
resource "aws_api_gateway_method" "root_options" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  resource_id   = aws_api_gateway_rest_api.backend_api.root_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# CORS OPTIONS Integration for root resource
resource "aws_api_gateway_integration" "root_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_rest_api.backend_api.root_resource_id
  http_method = aws_api_gateway_method.root_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# CORS OPTIONS Method Response for root resource
resource "aws_api_gateway_method_response" "root_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_rest_api.backend_api.root_resource_id
  http_method = aws_api_gateway_method.root_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# CORS OPTIONS Integration Response for root resource
resource "aws_api_gateway_integration_response" "root_options" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_rest_api.backend_api.root_resource_id
  http_method = aws_api_gateway_method.root_options.http_method
  status_code = aws_api_gateway_method_response.root_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${join(",", var.cors_allowed_origins)}'"
  }
}

resource "aws_api_gateway_method_response" "root_200" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  resource_id = aws_api_gateway_rest_api.backend_api.root_resource_id
  http_method = aws_api_gateway_method.root.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# Route 53 Hosted Zone lookup for API domain
data "aws_route53_zone" "api_domain" {
  count = var.api_domain_name != "" ? 1 : 0
  name  = "chrismarasco.io"
}

# ACM Certificate for API Custom Domain
resource "aws_acm_certificate" "api_cert" {
  count             = var.api_domain_name != "" ? 1 : 0
  domain_name       = var.api_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = local.common_tags
}

# Route 53 Record for API Certificate Validation
resource "aws_route53_record" "api_cert_validation" {
  for_each = var.api_domain_name != "" ? {
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
  zone_id         = var.api_domain_name != "" ? data.aws_route53_zone.api_domain[0].zone_id : null
}

# API Certificate Validation
resource "aws_acm_certificate_validation" "api_cert" {
  count                   = var.api_domain_name != "" ? 1 : 0
  certificate_arn         = var.api_domain_name != "" ? aws_acm_certificate.api_cert[0].arn : null
  validation_record_fqdns = [for record in aws_route53_record.api_cert_validation : record.fqdn]

  timeouts {
    create = "10m"
  }
}

# API Gateway Custom Domain Name
resource "aws_api_gateway_domain_name" "api_domain" {
  count                    = var.api_domain_name != "" ? 1 : 0
  domain_name              = var.api_domain_name
  regional_certificate_arn = var.api_domain_name != "" ? aws_acm_certificate_validation.api_cert[0].certificate_arn : null
  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = local.common_tags
}

# API Gateway Base Path Mapping
resource "aws_api_gateway_base_path_mapping" "api_domain" {
  count       = var.api_domain_name != "" ? 1 : 0
  api_id      = aws_api_gateway_rest_api.backend_api.id
  stage_name  = aws_api_gateway_stage.backend_api.stage_name
  domain_name = var.api_domain_name != "" ? aws_api_gateway_domain_name.api_domain[0].domain_name : null
}

# Route 53 Record for API Gateway Custom Domain
resource "aws_route53_record" "api_domain" {
  count   = var.api_domain_name != "" ? 1 : 0
  zone_id = var.api_domain_name != "" ? data.aws_route53_zone.api_domain[0].zone_id : null
  name    = var.api_domain_name
  type    = "A"

  alias {
    name                   = var.api_domain_name != "" ? aws_api_gateway_domain_name.api_domain[0].regional_domain_name : null
    zone_id                = var.api_domain_name != "" ? aws_api_gateway_domain_name.api_domain[0].regional_zone_id : null
    evaluate_target_health = false
  }
}