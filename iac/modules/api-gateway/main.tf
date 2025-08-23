# CloudWatch Log Group for API Gateway access logs
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  count             = var.enable_access_logs ? 1 : 0
  name              = "/aws/apigateway/${var.api_name}"
  retention_in_days = 14

  tags = var.tags
}

# API Gateway HTTP API
resource "aws_apigatewayv2_api" "api" {
  name          = var.api_name
  protocol_type = "HTTP"
  description   = "HTTP API for ${var.api_name}"

  cors_configuration {
    allow_credentials = var.cors_configuration.allow_credentials
    allow_headers     = var.cors_configuration.allow_headers
    allow_methods     = var.cors_configuration.allow_methods
    allow_origins     = var.cors_configuration.allow_origins
    expose_headers    = var.cors_configuration.expose_headers
    max_age          = var.cors_configuration.max_age
  }

  tags = var.tags
}

# Lambda Integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_invoke_arn
  integration_method = "POST"
  
  request_parameters = {
    "overwrite:header.x-api-gateway-request-id" = "$context.requestId"
  }
}

# Health check route (GET /)
resource "aws_apigatewayv2_route" "health_check" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Main API route (POST /)
resource "aws_apigatewayv2_route" "api_route_post" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Analysis route (POST /analyze)
resource "aws_apigatewayv2_route" "analyze_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /analyze"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Options route for CORS preflight
resource "aws_apigatewayv2_route" "options_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "OPTIONS /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "stage" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = var.stage_name
  auto_deploy = true

  dynamic "access_log_settings" {
    for_each = var.enable_access_logs ? [1] : []
    content {
      destination_arn = aws_cloudwatch_log_group.api_gateway_logs[0].arn
      format = jsonencode({
        requestId      = "$context.requestId"
        ip            = "$context.identity.sourceIp"
        caller        = "$context.identity.caller"
        user          = "$context.identity.user"
        requestTime   = "$context.requestTime"
        httpMethod    = "$context.httpMethod"
        resourcePath  = "$context.resourcePath"
        status        = "$context.status"
        protocol      = "$context.protocol"
        responseLength = "$context.responseLength"
        error         = {
          message      = "$context.error.message"
          messageString = "$context.error.messageString"
        }
        integrationError = {
          message      = "$context.integration.error"
          status       = "$context.integration.status"
          latency      = "$context.integration.latency"
          requestId    = "$context.integration.requestId"
        }
      })
    }
  }

  default_route_settings {
    throttling_burst_limit = var.throttling_burst_limit
    throttling_rate_limit  = var.throttling_rate_limit
    detailed_metrics_enabled = true
  }

  tags = var.tags
}

# Lambda permissions are managed in iam.tf

# Custom Domain (optional)
resource "aws_apigatewayv2_domain_name" "domain" {
  count       = var.domain_name != null ? 1 : 0
  domain_name = var.domain_name

  domain_name_configuration {
    certificate_arn = var.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  tags = var.tags

  depends_on = [var.certificate_arn]
}

# API Mapping for custom domain
resource "aws_apigatewayv2_api_mapping" "domain_mapping" {
  count       = var.domain_name != null ? 1 : 0
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.domain[0].id
  stage       = aws_apigatewayv2_stage.stage.id
}

# Route 53 A record for custom domain
resource "aws_route53_record" "api_domain" {
  count   = var.domain_name != null && var.route53_zone_id != null ? 1 : 0
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.domain[0].domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.domain[0].domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}