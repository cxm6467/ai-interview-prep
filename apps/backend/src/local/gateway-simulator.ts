#!/usr/bin/env node

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import { handler } from '../lambda/handler';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext
} from 'aws-lambda';

const app = express();
const PORT: number = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

let isShuttingDown = false;

/**
 * API Gateway Request → Lambda Event Converter
 * Simulates exactly how AWS API Gateway transforms requests to Lambda events
 */
function createLambdaEvent(req: Request, path: string): APIGatewayProxyEvent {
  return {
    httpMethod: req.method,
    headers: Object.entries(req.headers).reduce((acc, [key, value]) => {
      acc[key] = Array.isArray(value) ? value[0] : String(value || '');
      return acc;
    }, {
      'X-Forwarded-For': req.ip || '127.0.0.1',
      'X-Forwarded-Port': PORT.toString(),
      'X-Forwarded-Proto': 'http',
    } as { [key: string]: string }),
    multiValueHeaders: {},
    body: req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : null,
    isBase64Encoded: false,
    path,
    pathParameters: req.params && Object.keys(req.params).length > 0 ? req.params : null,
    queryStringParameters: req.query && Object.keys(req.query).length > 0 ? 
      req.query as { [key: string]: string } : null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      accountId: process.env.AWS_ACCOUNT_ID || 'local-dev',
      apiId: process.env.API_GATEWAY_ID || 'local-api',
      authorizer: {},
      httpMethod: req.method,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: req.ip || '127.0.0.1',
        user: null,
        userAgent: req.get('User-Agent') || 'local-api-gateway',
        userArn: null
      },
      path,
      protocol: 'HTTP/1.1',
      requestTime: new Date().toISOString(),
      requestTimeEpoch: Date.now(),
      resourceId: 'local-resource',
      resourcePath: path,
      stage: process.env.API_STAGE || 'local'
    },
    resource: path
  };
}

/**
 * Lambda Context Simulator
 * Mimics AWS Lambda execution context
 */
function createLambdaContext(requestId: string): LambdaContext {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: process.env.LAMBDA_FUNCTION_NAME || 'ai-interview-prep-local',
    functionVersion: process.env.LAMBDA_VERSION || '$LATEST',
    invokedFunctionArn: process.env.LAMBDA_ARN || 'arn:aws:lambda:us-east-1:000000000000:function:ai-interview-prep-local',
    memoryLimitInMB: process.env.LAMBDA_MEMORY || '512',
    awsRequestId: requestId,
    logGroupName: process.env.LAMBDA_LOG_GROUP || '/aws/lambda/ai-interview-prep-local',
    logStreamName: `${new Date().toISOString().slice(0, 10).replace(/-/g, '/')}/${requestId}`,
    getRemainingTimeInMillis: () => Number(process.env.LAMBDA_TIMEOUT || '300000'),
    done: () => {},
    fail: () => {},
    succeed: () => {}
  };
}

/**
 * Lambda Response → API Gateway Response Converter  
 * Simulates how API Gateway transforms Lambda responses back to HTTP
 */
function sendLambdaResponse(res: Response, lambdaResult: APIGatewayProxyResult) {
  // Set status code
  res.status(lambdaResult.statusCode);
  
  // Set headers (API Gateway behavior)
  if (lambdaResult.headers) {
    Object.entries(lambdaResult.headers).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        res.setHeader(key, String(value));
      }
    });
  }
  
  // Set multi-value headers (API Gateway behavior)
  if (lambdaResult.multiValueHeaders) {
    Object.entries(lambdaResult.multiValueHeaders).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        values.forEach(value => res.append(key, String(value)));
      }
    });
  }
  
  // Send body
  if (lambdaResult.body) {
    if (lambdaResult.isBase64Encoded) {
      const buffer = Buffer.from(lambdaResult.body, 'base64');
      res.send(buffer);
    } else {
      try {
        // Try to parse as JSON for pretty printing in development
        const parsedBody = JSON.parse(lambdaResult.body);
        res.json(parsedBody);
      } catch {
        res.send(lambdaResult.body);
      }
    }
  } else {
    res.end();
  }
}

/**
 * Universal Lambda Handler Route
 * Handles all HTTP methods and paths through Lambda function
 */
app.all('*', async (req: Request, res: Response) => {
  if (isShuttingDown) {
    res.status(503).json({ error: 'Service unavailable - shutting down' });
    return;
  }

  const startTime = Date.now();
  const requestId = `req-${startTime}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`🔄 [${new Date().toISOString()}] ${req.method} ${req.path} (${requestId})`);

  try {
    // Create Lambda event from API Gateway request
    const lambdaEvent = createLambdaEvent(req, req.path);
    const lambdaContext = createLambdaContext(requestId);
    
    // Call Lambda handler (exactly like production)
    const lambdaResult = await handler(lambdaEvent, lambdaContext);
    
    // Transform Lambda response back to HTTP (like API Gateway)
    sendLambdaResponse(res, lambdaResult);
    
    const duration = Date.now() - startTime;
    console.log(`✅ [${new Date().toISOString()}] ${req.method} ${req.path} → ${lambdaResult.statusCode} (${duration}ms)`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${new Date().toISOString()}] ${req.method} ${req.path} → Error (${duration}ms):`, error);
    
    res.status(500).json({
      errorMessage: 'Internal Server Error',
      errorType: 'InternalServerError',
      requestId,
      trace: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Start API Gateway Simulator
 */
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🌩️  ===============================================');
  console.log('🌩️  AWS API Gateway Simulator (Local Development)');
  console.log('🌩️  ===============================================');
  console.log('');
  console.log(`📡 API Gateway: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`⚡ Lambda Handler: Direct execution`);
  console.log(`🔑 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Stage: ${process.env.API_STAGE || 'local'}`);
  console.log('');
  console.log('📋 API Endpoints:');
  console.log('   POST / - AI analysis');
  console.log('   GET /health - Health check');
  console.log('   OPTIONS / - CORS preflight');
  console.log('');
  console.log('💡 This simulates production API Gateway → Lambda flow');
  console.log('');
});

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = () => {
  console.log('');
  console.log('🛑 Received shutdown signal...');
  isShuttingDown = true;
  
  server.close(() => {
    console.log('✅ API Gateway simulator stopped gracefully');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.log('⚠️  Force closing API Gateway simulator');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default app;