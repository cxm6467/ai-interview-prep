#!/usr/bin/env node

/**
 * Local development server for AI Interview Prep Backend
 * Wraps the Lambda handler in an Express server for local development
 */

const express = require('express');
const cors = require('cors');
const { handler } = require('./consolidated-ai-handler.js');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.ENVIRONMENT || 'local',
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

// Main API endpoint - convert Express request to Lambda event format
app.post('/', async (req, res) => {
  try {
    // Convert Express request to Lambda event format
    const lambdaEvent = {
      httpMethod: 'POST',
      headers: req.headers,
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
      queryStringParameters: req.query,
      pathParameters: null,
      requestContext: {
        requestId: Date.now().toString(),
        stage: 'local',
        path: '/',
        httpMethod: 'POST'
      }
    };

    // Call the Lambda handler
    const result = await handler(lambdaEvent, {
      awsRequestId: Date.now().toString(),
      getRemainingTimeInMillis: () => 30000
    });

    // Convert Lambda response back to Express response
    res.status(result.statusCode);
    
    if (result.headers) {
      Object.keys(result.headers).forEach(key => {
        res.set(key, result.headers[key]);
      });
    }
    
    if (result.body) {
      try {
        const parsedBody = JSON.parse(result.body);
        res.json(parsedBody);
      } catch (e) {
        res.send(result.body);
      }
    } else {
      res.end();
    }

  } catch (error) {
    console.error('❌ Local server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Handle OPTIONS requests
app.options('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Interview Prep Backend running locally`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🔑 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`📁 Environment: ${process.env.ENVIRONMENT || 'local'}`);
  console.log('');
  console.log('📝 API Endpoint: POST http://localhost:' + PORT + '/');
  console.log('📋 Expected payload: { "resumeText": "...", "jobDescription": "..." }');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down local development server...');
  process.exit(0);
});