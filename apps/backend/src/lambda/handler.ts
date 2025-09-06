/**
 * @fileoverview AWS Lambda handler for AI-powered interview preparation analysis
 * 
 * This module provides the main entry point for the Lambda function that processes
 * resume and job description data to generate comprehensive interview preparation
 * materials including ATS score analysis, technical questions, and behavioral questions.
 */

import { type RequestBody, type PartialAnalysisResult, ContentType } from '@cxm6467/ai-interview-prep-types';
import { openApiSpec } from '../shared/openapi-spec';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext
} from 'aws-lambda';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  createCacheableSuccessResponse,
  createOptionsResponse, 
  createHealthResponse,
  generateComprehensiveAnalysis,
  generatePartialAnalysis,
  parseAnalysisComponents,
  progressStore,
  HTTP_STATUS,
  CACHE_HEADERS,
  PIIScrubber,
  CacheUtils
} from '../shared/utils';
import { setRequestContext } from '../shared/utils/openai-client';

/**
 * Type definitions for better type safety
 */
interface LoggerContext {
  requestId?: string;
  analysisId?: string;
  [key: string]: unknown;
}

interface Logger {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  requestStart: (...args: unknown[]) => void;
  requestEnd: (...args: unknown[]) => void;
  network: (...args: unknown[]) => void;
  ai: (...args: unknown[]) => void;
  success: (...args: unknown[]) => void;
  critical: (...args: unknown[]) => void;
  child: (context: LoggerContext) => Logger;
}

// Simple logging replacement with all needed methods
const createLogger = (context?: LoggerContext): Logger => ({
  info: (...args: unknown[]) => console.log('[INFO]', ...args, context),
  error: (...args: unknown[]) => console.error('[ERROR]', ...args, context),
  warn: (...args: unknown[]) => console.warn('[WARN]', ...args, context),
  debug: (...args: unknown[]) => console.debug('[DEBUG]', ...args, context),
  requestStart: (...args: unknown[]) => console.log('[REQUEST_START]', ...args, context),
  requestEnd: (...args: unknown[]) => console.log('[REQUEST_END]', ...args, context),
  network: (...args: unknown[]) => console.log('[NETWORK]', ...args, context),
  ai: (...args: unknown[]) => console.log('[AI]', ...args, context),
  success: (...args: unknown[]) => console.log('[SUCCESS]', ...args, context),
  critical: (...args: unknown[]) => console.error('[CRITICAL]', ...args, context),
  child: (childContext: LoggerContext) => createLogger({ ...context, ...childContext })
});

const logger: Logger = createLogger();

/**
 * Generate Swagger UI HTML page
 * Creates a complete HTML page with Swagger UI for API documentation
 */
function generateSwaggerUI(apiSpec: any, baseUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Interview Prep API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.10.5/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.10.5/favicon-16x16.png" sizes="16x16" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
    .swagger-ui .topbar {
      background-color: #2d3748;
    }
    .swagger-ui .topbar .download-url-wrapper input[type=text] {
      border: 2px solid #4a90e2;
    }
    .swagger-ui .topbar .download-url-wrapper .download-url-button {
      background: #4a90e2;
    }
  </style>
</head>

<body>
  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.js" charset="UTF-8"> </script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
  <script>
    window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(apiSpec, null, 2)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // Ensure requests go to the correct base URL
          if (request.url.startsWith('/')) {
            request.url = '${baseUrl}' + request.url;
          }
          return request;
        },
        responseInterceptor: function(response) {
          return response;
        },
        validatorUrl: null,
        showRequestHeaders: true,
        showCommonExtensions: true,
        defaultModelRendering: 'example'
      });
      // End Swagger UI call region

      window.ui = ui;
    };
  </script>
</body>
</html>
  `.trim();
}

/**
 * Parses and validates the JSON request body from API Gateway
 * 
 * @param body - Raw request body string from API Gateway event
 * @param requestId - Unique request identifier for logging
 * @returns Either a successful parse result with data or an error response
 */
function parseRequestBody(body: string | null, isBase64Encoded: boolean, requestId: string): 
  | { success: true; data: RequestBody } 
  | { success: false; response: APIGatewayProxyResult } {
  
  if (!body) {
    logger.warn('Request received without body', { requestId });
    return {
      success: false,
      response: createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Request body is required')
    };
  }

  try {
    logger.debug('Parsing request body', { requestId, bodyLength: body.length, isBase64Encoded });
    
    // Decode base64 if necessary
    let actualBody = body;
    if (isBase64Encoded) {
      logger.debug('Decoding base64 encoded body', { requestId });
      actualBody = Buffer.from(body, 'base64').toString('utf-8');
    }
    
    const data = JSON.parse(actualBody) as RequestBody;
    logger.debug('Request body parsed successfully', { requestId, hasResumeText: Boolean(data.resumeText), hasJobDescription: Boolean(data.jobDescription) });
    return { success: true, data };
  } catch (e) {
    logger.error('Failed to parse request body JSON', { requestId, bodyPreview: body.substring(0, 100) }, undefined, e as Error);
    return {
      success: false,
      response: createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Invalid JSON in request body', `Unexpected token '${body.charAt(0)}', "${body.substring(0, 10)}"... is not valid JSON`)
    };
  }
}

/**
 * Main AWS Lambda handler function for processing interview preparation requests
 * 
 * Handles HTTP requests to analyze resumes against job descriptions and generate:
 * - ATS (Applicant Tracking System) compatibility scores
 * - Technical interview questions
 * - Behavioral interview questions
 * - Skills gap analysis
 * - Interview preparation recommendations
 * 
 * @param event - API Gateway proxy event containing HTTP request data
 * @param context - Lambda execution context with runtime information
 * @returns API Gateway proxy response with analysis results or error details
 */
export const handler = async function(
  event: APIGatewayProxyEvent, 
  context: LambdaContext
): Promise<APIGatewayProxyResult> {
  const requestId = context.awsRequestId;
  const startTime = Date.now();
  
  // Create child logger with request context
  const requestLogger = logger.child({
    requestId,
    functionName: context.functionName,
    httpMethod: event.httpMethod,
    path: event.path
  });

  // Set request context for OpenAI layer logging
  setRequestContext(requestId, {
    functionName: context.functionName,
    httpMethod: event.httpMethod,
    path: event.path
  });

  requestLogger.info('Lambda function invoked', { functionName: context.functionName, requestId });
  requestLogger.requestStart(event.httpMethod, event.path, requestId);

  try {
    if (event.httpMethod === 'OPTIONS') {
      requestLogger.network('CORS preflight request handled', { requestId });
      const response = createOptionsResponse();
      requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
      return response;
    }

    if (event.httpMethod === 'GET') {
      // Check if this is a progress check request
      const pathParts = event.path.split('/');
      if (pathParts.length >= 3 && pathParts[pathParts.length - 2] === 'progress') {
        const analysisId = pathParts[pathParts.length - 1];
        requestLogger.info('Progress check request', { requestId, analysisId });
        
        const progress = await progressStore.getProgress(analysisId);
        if (!progress) {
          const response = createErrorResponse(HTTP_STATUS.NOT_FOUND, 'Analysis not found');
          requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
          return response;
        }
        
        const response = createSuccessResponse({
          success: true,
          data: progress,
          timestamp: new Date().toISOString()
        });
        requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
        return response;
      }
      
      // Root endpoint - Smart environment-based serving
      // Development: Swagger UI for browsers, JSON for programmatic access
      // Production: JSON API info by default, docs available at /docs
      if (event.path === '/' || event.path === '') {
        const isDevelopment = process.env.NODE_ENV === 'development' || 
                             process.env.NODE_ENV === 'develop' ||
                             process.env.NODE_ENV === 'local' ||
                             !process.env.NODE_ENV;
        
        const acceptHeader = event.headers?.['Accept'] || event.headers?.['accept'] || '';
        const userAgent = event.headers?.['User-Agent'] || event.headers?.['user-agent'] || '';
        
        // Check for explicit format override
        const formatParam = event.queryStringParameters?.format;
        const forceJson = formatParam === 'json';
        const forceDocs = formatParam === 'docs';
        
        // Determine if client wants HTML (browser) or JSON (programmatic)
        const isBrowser = userAgent.toLowerCase().includes('mozilla') || 
                         userAgent.toLowerCase().includes('chrome') || 
                         userAgent.toLowerCase().includes('safari') ||
                         userAgent.toLowerCase().includes('edge');
        
        const wantsHtml = !forceJson && (
          forceDocs ||
          acceptHeader.includes('text/html') || 
          (acceptHeader.includes('*/*') && isBrowser)
        );
        
        requestLogger.info('Root endpoint request', { 
          requestId, 
          isDevelopment, 
          wantsHtml, 
          acceptHeader: acceptHeader.substring(0, 50),
          userAgent: userAgent.substring(0, 50),
          formatParam 
        });
        
        // In development with browsers, serve Swagger UI at root for easy access
        if (isDevelopment && wantsHtml && !forceJson) {
          requestLogger.info('Serving Swagger UI at root (development mode)', { requestId });
          
          const baseUrl = `https://${event.headers?.['Host'] || event.headers?.['host'] || 'localhost:8080'}`;
          const swaggerHtml = generateSwaggerUI(openApiSpec, baseUrl);
          
          const response: APIGatewayProxyResult = {
            statusCode: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=300', // Shorter cache in development
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
            },
            body: swaggerHtml
          };
          
          requestLogger.success('Swagger UI served at root successfully', { requestId });
          requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
          return response;
        }
        
        // In production, redirect browsers to /docs for better UX
        if (wantsHtml && !forceJson) {
          requestLogger.info('Redirecting browser to /docs in production', { requestId });
          
          const host = event.headers?.['Host'] || event.headers?.['host'] || 'api.ai-ip.chrismarasco.io';
          const protocol = host.includes('localhost') ? 'http' : 'https';
          const redirectUrl = `${protocol}://${host}/docs`;
          
          const response: APIGatewayProxyResult = {
            statusCode: 302,
            headers: {
              'Location': redirectUrl,
              'Cache-Control': 'public, max-age=300',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
            },
            body: JSON.stringify({
              message: 'Redirecting to API documentation',
              location: redirectUrl
            })
          };
          
          requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
          return response;
        }
        
        // Default: Serve JSON API info for programmatic access
        requestLogger.info('Serving JSON API info', { requestId });
        
        const host = event.headers?.['Host'] || event.headers?.['host'] || 'api.ai-ip.chrismarasco.io';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
        
        const response = createSuccessResponse({
          success: true,
          message: 'AI Interview Prep API',
          version: '1.0.0',
          environment: isDevelopment ? 'development' : 'production',
          documentation: {
            interactive: `${baseUrl}/docs`,
            openapi: `${baseUrl}/openapi.json`,
            root_ui: isDevelopment ? `${baseUrl}/?format=docs` : `${baseUrl}/docs`
          },
          endpoints: {
            analyze: 'POST /analyze - Analyze resume and job description',
            chat: 'POST /chat - Interactive interview coaching',
            docs: 'GET /docs - API documentation (Swagger UI)',
            openapi: 'GET /openapi.json - OpenAPI specification'
          },
          usage: {
            json_format: `${baseUrl}/?format=json`,
            docs_format: `${baseUrl}/?format=docs`,
            note: 'Browsers are redirected to /docs. Use ?format=json to force JSON response.'
          },
          timestamp: new Date().toISOString()
        });
        
        requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
        return response;
      }
      
      // Documentation endpoint - serve Swagger UI
      if (event.path === '/docs') {
        requestLogger.info('Swagger UI documentation request', { requestId });

        const baseUrl = `https://${event.headers?.['Host'] || 'api.ai-ip.chrismarasco.io'}`;
        const swaggerHtml = generateSwaggerUI(openApiSpec, baseUrl);
        
        const response: APIGatewayProxyResult = {
          statusCode: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
          },
          body: swaggerHtml
        };
        
        requestLogger.success('Swagger UI served successfully', { requestId });
        requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
        return response;
      }
      
      // OpenAPI spec endpoint
      if (event.path === '/openapi.json' || event.path === '/swagger.json') {
        requestLogger.info('OpenAPI spec request', { requestId });
        const response = createSuccessResponse(openApiSpec);
        // Override content type for OpenAPI spec
        response.headers = {
          ...response.headers,
          'Content-Type': 'application/json'
        };
        requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
        return response;
      }
      
      // Default health check for other GET requests
      requestLogger.info('Health check request', { requestId });
      const response = createHealthResponse();
      requestLogger.success('Health check completed', { requestId, status: 'healthy' });
      requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
      return response;
    }

    if (event.httpMethod !== 'POST') {
      requestLogger.warn('Invalid HTTP method', { requestId, method: event.httpMethod });
      const response = createErrorResponse(HTTP_STATUS.METHOD_NOT_ALLOWED, 'Method Not Allowed');
      requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
      return response;
    }

    // Only accept POST requests on /analyze endpoint for analysis
    if (event.path !== '/analyze') {
      requestLogger.warn('POST request to invalid endpoint', { requestId, path: event.path });
      const response = createErrorResponse(HTTP_STATUS.NOT_FOUND, 'Endpoint not found. Use POST /analyze for resume analysis.');
      requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
      return response;
    }

    // Parse and validate request
    const requestBody = parseRequestBody(event.body, event.isBase64Encoded || false, requestId);
    if (!requestBody.success) {
      requestLogger.requestEnd(event.httpMethod, event.path, requestBody.response.statusCode, Date.now() - startTime, requestId);
      return requestBody.response;
    }

    const { resumeText, jobDescription } = requestBody.data;

    if (!resumeText || !jobDescription) {
      requestLogger.warn('Missing required parameters', { 
        requestId, 
        hasResumeText: Boolean(resumeText), 
        hasJobDescription: Boolean(jobDescription)
      });
      const response = createErrorResponse(
        HTTP_STATUS.BAD_REQUEST, 
        'Missing required parameters: resumeText and jobDescription are required'
      );
      requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
      return response;
    }

    // Scrub PII from input data before processing
    requestLogger.info('Scrubbing PII from input data', { requestId });
    const piiScrubStartTime = Date.now();
    
    const resumeScrubResult = PIIScrubber.scrub(resumeText, ContentType.RESUME);
    const jobScrubResult = PIIScrubber.scrub(jobDescription, ContentType.JOB_DESCRIPTION);
    
    const piiScrubDuration = Date.now() - piiScrubStartTime;
    
    // Log PII scrubbing results for security auditing
    requestLogger.info('PII scrubbing completed', {
      requestId,
      duration: `${piiScrubDuration}ms`,
      resumePII: {
        itemsFound: resumeScrubResult.piiItemsFound,
        categories: resumeScrubResult.piiCategories,
        hasCritical: resumeScrubResult.hasCriticalPII
      },
      jobPII: {
        itemsFound: jobScrubResult.piiItemsFound,
        categories: jobScrubResult.piiCategories,
        hasCritical: jobScrubResult.hasCriticalPII
      }
    });

    // Use scrubbed text for processing
    const scrubbedResumeText = resumeScrubResult.scrubbedText;
    const scrubbedJobDescription = jobScrubResult.scrubbedText;

    // Parse analysis components from query parameters
    const requestedComponents = parseAnalysisComponents(event.queryStringParameters);
    const isPartialAnalysis = requestedComponents.length > 0;
    const analysisType = isPartialAnalysis ? requestedComponents.join(',') : 'comprehensive';

    // Check cache first (only for safe, scrubbed data)
    const cachedAnalysis = CacheUtils.getCachedAnalysisResult(
      resumeScrubResult,
      jobScrubResult,
      analysisType
    );

    if (cachedAnalysis) {
      requestLogger.ai('Analysis result found in cache', { 
        requestId,
        analysisType,
        cacheStats: CacheUtils.getCacheStats()
      });
      
      const response = createCacheableSuccessResponse({
        success: true,
        data: cachedAnalysis,
        timestamp: new Date().toISOString()
      }, CACHE_HEADERS.MEDIUM_CACHE);
      
      // Add cache hit header
      response.headers = {
        ...response.headers,
        'X-Cache': 'HIT'
      };
      
      const totalDuration = Date.now() - startTime;
      requestLogger.success('Cached request completed successfully', { requestId, totalDuration: `${totalDuration}ms` });
      requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, totalDuration, requestId);
      return response;
    }

    // Log input analysis (using scrubbed data lengths)
    requestLogger.ai('Starting AI analysis with PII-scrubbed data', { 
      requestId, 
      originalResumeLength: resumeText.length,
      scrubbedResumeLength: scrubbedResumeText.length,
      originalJobLength: jobDescription.length,
      scrubbedJobLength: scrubbedJobDescription.length,
      isPartialAnalysis,
      requestedComponents: isPartialAnalysis ? requestedComponents : 'all',
      cacheStats: CacheUtils.getCacheStats()
    });

    // Perform AI analysis (full or partial) using scrubbed data
    const analysisStartTime = Date.now();
    const analysis = isPartialAnalysis
      ? await generatePartialAnalysis(scrubbedResumeText, scrubbedJobDescription, requestedComponents)
      : await generateComprehensiveAnalysis(scrubbedResumeText, scrubbedJobDescription);
    const analysisDuration = Date.now() - analysisStartTime;
    
    // Log results differently for partial vs full analysis
    if (isPartialAnalysis) {
      const partialAnalysis = analysis as PartialAnalysisResult;
      requestLogger.ai('Partial AI analysis completed successfully', { 
        requestId, 
        analysisDuration: `${analysisDuration}ms`,
        requestedComponents: partialAnalysis.requestedComponents,
        includedComponents: partialAnalysis.includedComponents,
        atsScore: partialAnalysis.atsScore?.score
      });
    } else {
      requestLogger.ai('Full AI analysis completed successfully', { 
        requestId, 
        analysisDuration: `${analysisDuration}ms`,
        atsScore: analysis.atsScore?.score,
        technicalQuestionCount: analysis.technicalQuestions?.length,
        behavioralQuestionCount: analysis.behavioralQuestions?.length
      });
    }
    
    // Cache the analysis result for future requests
    const cacheStored = CacheUtils.cacheAnalysisResult(
      resumeScrubResult,
      jobScrubResult,
      analysis,
      analysisType,
      3600 // 1 hour TTL
    );
    
    requestLogger.info('Analysis caching completed', {
      requestId,
      cached: cacheStored,
      cacheStats: CacheUtils.getCacheStats()
    });
    
    const response = createCacheableSuccessResponse({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    }, CACHE_HEADERS.MEDIUM_CACHE); // Cache for 1 hour since AI analysis is expensive and results are deterministic
    
    // Add cache miss header
    response.headers = {
      ...response.headers,
      'X-Cache': 'MISS'
    };
    
    const totalDuration = Date.now() - startTime;
    requestLogger.success('Request completed successfully', { requestId, totalDuration: `${totalDuration}ms` });
    requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, totalDuration, requestId);
    requestLogger.success('Lambda function completed', { functionName: context.functionName, requestId, totalDuration });
    
    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    requestLogger.critical('Unhandled error in Lambda handler', { 
      requestId, 
      duration: `${duration}ms`,
      errorMessage 
    }, undefined, error as Error);
    
    const response = createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal Server Error', errorMessage);
    requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, duration, requestId);
    
    return response;
  }
};