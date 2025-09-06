#!/usr/bin/env node

/**
 * @fileoverview Local development server for AI Interview Chat functionality
 * 
 * This server provides a local development environment for the chat Lambda function,
 * running alongside the main analysis server on a different port.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import { handler } from '../lambda/chat-handler';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from 'aws-lambda';
// Simple console logger replacement
const logger = {
  info: (...args: unknown[]) => console.log('[CHAT-SERVER]', ...args),
  error: (...args: unknown[]) => console.error('[CHAT-SERVER]', ...args),
  warn: (...args: unknown[]) => console.warn('[CHAT-SERVER]', ...args),
  startup: (...args: unknown[]) => console.log('[CHAT-SERVER-STARTUP]', ...args),
  network: (...args: unknown[]) => console.log('[CHAT-SERVER-NET]', ...args),
  security: (...args: unknown[]) => console.log('[CHAT-SERVER-SEC]', ...args),
  success: (...args: unknown[]) => console.log('[CHAT-SERVER-SUCCESS]', ...args),
  critical: (...args: unknown[]) => console.error('[CHAT-SERVER-CRIT]', ...args),
  process: (...args: unknown[]) => console.log('[CHAT-SERVER-PROC]', ...args),
  requestStart: (...args: unknown[]) => console.log('[CHAT-SERVER-REQ-START]', ...args),
  requestEnd: (...args: unknown[]) => console.log('[CHAT-SERVER-REQ-END]', ...args),
  serviceError: (...args: unknown[]) => console.error('[CHAT-SERVER-SVC-ERR]', ...args),
  child: (_context: Record<string, unknown>) => logger
};

const app = express();
const PORT: number = Number(process.env.CHAT_PORT) || 8081;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

let isShuttingDown = false;

app.get('/health', (_req: Request, res: Response) => {
  const healthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.ENVIRONMENT || 'local',
    service: 'chat',
    openai_configured: Boolean(process.env.OPENAI_API_KEY)
  };
  res.json(healthResponse);
});

app.post('/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const requestLogger = logger.child({ requestId });
  
  requestLogger.requestStart('POST', '/chat', requestId);
  
  if (isShuttingDown) {
    requestLogger.warn('Chat request rejected - server shutting down', { requestId });
    res.status(503).json({ error: 'Chat server is shutting down' });
    return;
  }

  try {
    const lambdaEvent: APIGatewayProxyEvent = {
      httpMethod: 'POST',
      headers: req.headers as { [key: string]: string },
      multiValueHeaders: {},
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
      isBase64Encoded: false,
      path: '/chat',
      pathParameters: null,
      queryStringParameters: req.query as { [key: string]: string } | null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {
        requestId: Date.now().toString(),
        accountId: 'local',
        apiId: 'local-chat',
        authorizer: {},
        httpMethod: 'POST',
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
          userAgent: req.get('User-Agent') || 'local-chat-server',
          userArn: null
        },
        path: '/chat',
        protocol: 'HTTP/1.1',
        requestTime: new Date().toISOString(),
        requestTimeEpoch: Date.now(),
        resourceId: 'local-chat',
        resourcePath: '/chat',
        stage: 'local'
      },
      resource: '/chat'
    };

    const mockContext = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'local-chat-dev-server',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:local:000000000000:function:local-chat-dev-server',
      memoryLimitInMB: '512',
      awsRequestId: Date.now().toString(),
      logGroupName: '/aws/lambda/local-chat-dev-server',
      logStreamName: new Date().toISOString().slice(0, 10).replace(/-/g, '/') + '/[$LATEST]' + Date.now().toString(),
      getRemainingTimeInMillis: () => 300000,
      done: () => {},
      fail: () => {},
      succeed: () => {}
    };
    
    requestLogger.process('Calling Chat Lambda handler', { requestId });
    const handlerStartTime = Date.now();
    const result: APIGatewayProxyResult = await handler(lambdaEvent, mockContext);
    const handlerDuration = Date.now() - handlerStartTime;
    
    requestLogger.success('Chat Lambda handler completed', { 
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
    requestLogger.requestEnd('POST', '/chat', result.statusCode, totalDuration, requestId);

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    requestLogger.serviceError('Local chat server error', { 
      requestId, 
      duration: `${duration}ms`,
      errorMessage 
    }, undefined, error as Error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: errorMessage
    });
    
    requestLogger.requestEnd('POST', '/chat', 500, duration, requestId);
  }
});

app.options('/chat', (_req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

const server = app.listen(PORT, () => {
  logger.startup('Local chat development server started');
  logger.network(`Chat server listening on http://localhost:${PORT}`);
  logger.info(`Chat health endpoint: http://localhost:${PORT}/health`);
  logger.info(`Chat endpoint: http://localhost:${PORT}/chat`);
  
  if (process.env.OPENAI_API_KEY) {
    logger.security('OpenAI API key configured for chat');
  } else {
    logger.warn('OpenAI API key not configured for chat');
  }
  
  logger.info('Chat environment configuration', {
    environment: process.env.ENVIRONMENT || 'local',
    nodeEnv: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

const gracefulShutdown = () => {
  logger.warn('Received shutdown signal for chat server');
  isShuttingDown = true;
  
  server.close(() => {
    logger.success('Chat server closed gracefully');
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.critical('Forcing chat server shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);