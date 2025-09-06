#!/usr/bin/env node

/**
 * @fileoverview Local development server for AI Interview Preparation backend
 * 
 * This server provides a local development environment that simulates the AWS Lambda
 * and API Gateway infrastructure for testing and development purposes. It wraps the
 * Lambda handler to accept HTTP requests and provides health check endpoints.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import { handler } from '../lambda/handler';
import { Environment, type HealthResponse } from '@cxm6467/ai-interview-prep-types';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';
// Simple console logger replacement
const logger = {
  info: (...args: unknown[]) => console.log('[LOCAL-SERVER]', ...args),
  error: (...args: unknown[]) => console.error('[LOCAL-SERVER]', ...args),
  warn: (...args: unknown[]) => console.warn('[LOCAL-SERVER]', ...args),
  startup: (...args: unknown[]) => console.log('[LOCAL-SERVER-STARTUP]', ...args),
  network: (...args: unknown[]) => console.log('[LOCAL-SERVER-NET]', ...args),
  security: (...args: unknown[]) => console.log('[LOCAL-SERVER-SEC]', ...args),
  success: (...args: unknown[]) => console.log('[LOCAL-SERVER-SUCCESS]', ...args),
  critical: (...args: unknown[]) => console.error('[LOCAL-SERVER-CRIT]', ...args),
  process: (...args: unknown[]) => console.log('[LOCAL-SERVER-PROC]', ...args),
  requestStart: (...args: unknown[]) => console.log('[LOCAL-SERVER-REQ-START]', ...args),
  requestEnd: (...args: unknown[]) => console.log('[LOCAL-SERVER-REQ-END]', ...args),
  serviceError: (...args: unknown[]) => console.error('[LOCAL-SERVER-SVC-ERR]', ...args),
  child: (_context: Record<string, unknown>) => logger
};

const app = express();
const PORT: number = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

let isShuttingDown = false;

app.get('/health', (_req: Request, res: Response) => {
  const healthResponse: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: Environment.DEVELOPMENT,
    openai_configured: Boolean(process.env.OPENAI_API_KEY)
  };
  res.json(healthResponse);
});

// Generic handler function for Lambda routes
async function handleLambdaRequest(req: Request, res: Response, path: string, method: string = 'POST') {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const requestLogger = logger.child({ requestId });
  
  requestLogger.requestStart(method, path, requestId);
  
  if (isShuttingDown) {
    requestLogger.warn('Request rejected - server shutting down', { requestId });
    res.status(503).json({ error: 'Server is shutting down' });
    return;
  }

  try {
    const lambdaEvent: APIGatewayProxyEvent = {
      httpMethod: method,
      headers: req.headers as { [key: string]: string },
      multiValueHeaders: {},
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
      isBase64Encoded: false,
      path: path,
      pathParameters: null,
      queryStringParameters: req.query as { [key: string]: string } | null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {
        requestId: Date.now().toString(),
        accountId: 'local',
        apiId: 'local',
        authorizer: {},
        httpMethod: method,
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
          userAgent: req.get('User-Agent') || 'local-server',
          userArn: null
        },
        path: path,
        protocol: 'HTTP/1.1',
        requestTime: new Date().toISOString(),
        requestTimeEpoch: Date.now(),
        resourceId: 'local',
        resourcePath: path,
        stage: 'local'
      },
      resource: path
    };

    const mockContext = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'local-dev-server',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:local:000000000000:function:local-dev-server',
      memoryLimitInMB: '512',
      awsRequestId: Date.now().toString(),
      logGroupName: '/aws/lambda/local-dev-server',
      logStreamName: new Date().toISOString().slice(0, 10).replace(/-/g, '/') + '/[$LATEST]' + Date.now().toString(),
      getRemainingTimeInMillis: () => 300000,
      done: () => {},
      fail: () => {},
      succeed: () => {}
    };
    
    requestLogger.process('Calling Lambda handler', { requestId });
    const handlerStartTime = Date.now();
    const result: APIGatewayProxyResult = await handler(lambdaEvent, mockContext);
    const handlerDuration = Date.now() - handlerStartTime;
    
    requestLogger.success('Lambda handler completed', { 
      requestId, 
      statusCode: result.statusCode, 
      handlerDuration: `${handlerDuration}ms` 
    });

    res.status(result.statusCode);
    
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          res.setHeader(key, value);
        }
      });
    }
    
    if (result.body) {
      try {
        const parsedBody = JSON.parse(result.body);
        res.json(parsedBody);
      } catch {
        res.send(result.body);
      }
    } else {
      res.end();
    }
    
    const totalDuration = Date.now() - startTime;
    requestLogger.requestEnd(method, path, result.statusCode, totalDuration, requestId);

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    requestLogger.serviceError('Local server error', { 
      requestId, 
      duration: `${duration}ms`,
      errorMessage 
    }, undefined, error as Error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: errorMessage
    });
    
    requestLogger.requestEnd(method, path, 500, duration, requestId);
  }
}

// Root endpoint - API info and health
app.get('/', (req: Request, res: Response) => {
  handleLambdaRequest(req, res, '/', 'GET');
});

app.post('/', (req: Request, res: Response) => {
  handleLambdaRequest(req, res, '/', 'POST');
});

// Analyze endpoint
app.post('/analyze', (req: Request, res: Response) => {
  handleLambdaRequest(req, res, '/analyze', 'POST');
});

// Docs endpoints
app.get('/docs', (req: Request, res: Response) => {
  handleLambdaRequest(req, res, '/docs', 'GET');
});

app.get('/openapi.json', (req: Request, res: Response) => {
  handleLambdaRequest(req, res, '/openapi.json', 'GET');
});

app.get('/swagger.json', (req: Request, res: Response) => {
  handleLambdaRequest(req, res, '/swagger.json', 'GET');
});

app.options('/', (_req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

const server = app.listen(PORT, () => {
  logger.startup('Local development server started');
  logger.network(`Server listening on http://localhost:${PORT}`);
  logger.info(`Health endpoint: http://localhost:${PORT}/health`);
  
  if (process.env.OPENAI_API_KEY) {
    logger.security('OpenAI API key configured');
  } else {
    logger.warn('OpenAI API key not configured');
  }
  
  logger.info('Environment configuration', {
    environment: process.env.ENVIRONMENT || 'local',
    nodeEnv: process.env.NODE_ENV || 'development',
    port: PORT
  });
  
  logger.info('API endpoints available', {
    health: 'GET /health',
    analysis: 'POST /',
    cors: 'OPTIONS /'
  });
});

const gracefulShutdown = () => {
  logger.warn('Received shutdown signal');
  isShuttingDown = true;
  
  server.close(() => {
    logger.success('Server closed gracefully');
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.critical('Forcing server shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);