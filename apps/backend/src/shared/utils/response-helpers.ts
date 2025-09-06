/**
 * HTTP response helper functions
 * 
 * This module provides standardized response creation functions for
 * AWS Lambda API Gateway responses with consistent formatting and CORS headers.
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { CORS_HEADERS, HTTP_STATUS, CACHE_HEADERS } from './http-constants';
import { generateETag } from './crypto-utils';

/**
 * Create a structured error response
 * 
 * @function createErrorResponse
 * @description Creates a standardized error response with proper HTTP status code,
 * CORS headers, and structured error information including timestamp.
 * 
 * @param {number} statusCode - HTTP status code (400, 404, 500, etc.)
 * @param {string} message - Human-readable error message
 * @param {string|null} [details=null] - Optional additional error details
 * @returns {APIGatewayProxyResult} Formatted Lambda response object
 * 
 * @example
 * ```typescript
 * return createErrorResponse(400, 'Invalid request', 'Missing required field: email');
 * ```
 */
export function createErrorResponse(
  statusCode: number, 
  message: string, 
  details: string | null = null
): APIGatewayProxyResult {
  // Generate a unique error ID for tracking
  const errorId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      error: true,
      message,
      details,
      errorId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'dev',
    }),
  };
}

/**
 * Create a successful response
 * 
 * @function createSuccessResponse
 * @description Creates a standardized success response with HTTP 200 status,
 * CORS headers, and JSON-serialized data payload.
 * 
 * @param {any} data - Response data to be JSON serialized
 * @returns {APIGatewayProxyResult} Formatted Lambda response object
 * 
 * @example
 * ```typescript
 * return createSuccessResponse({
 *   success: true,
 *   data: analysisResult,
 *   timestamp: new Date().toISOString()
 * });
 * ```
 */
export function createSuccessResponse(data: any): APIGatewayProxyResult {
  return {
    statusCode: HTTP_STATUS.OK,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  };
}

/**
 * Create a cacheable successful response with appropriate cache headers
 * 
 * @function createCacheableSuccessResponse
 * @description Creates a standardized success response with caching headers.
 * AI analysis results can be cached since they're deterministic for the same input.
 * 
 * @param {any} data - Response data to be JSON serialized
 * @param {string} cacheType - Cache type from CACHE_HEADERS (default: MEDIUM_CACHE)
 * @returns {APIGatewayProxyResult} Formatted Lambda response object with cache headers
 * 
 * @example
 * ```typescript
 * return createCacheableSuccessResponse(analysisResult, CACHE_HEADERS.LONG_CACHE);
 * ```
 */
export function createCacheableSuccessResponse(
  data: any, 
  cacheType: string = CACHE_HEADERS.MEDIUM_CACHE
): APIGatewayProxyResult {
  return {
    statusCode: HTTP_STATUS.OK,
    headers: {
      ...CORS_HEADERS,
      'Cache-Control': cacheType,
      'ETag': generateETag(data),
      'Vary': 'Accept-Encoding',
      'Last-Modified': new Date().toUTCString()
    },
    body: JSON.stringify(data),
  };
}

/**
 * Handle OPTIONS requests for CORS preflight
 * 
 * @function createOptionsResponse
 * @description Creates a response for HTTP OPTIONS requests to handle
 * CORS preflight checks from web browsers.
 * 
 * @returns {APIGatewayProxyResult} Empty response with CORS headers
 * 
 * @example
 * ```typescript
 * if (event.httpMethod === 'OPTIONS') {
 *   return createOptionsResponse();
 * }
 * ```
 */
export function createOptionsResponse(): APIGatewayProxyResult {
  return {
    statusCode: HTTP_STATUS.OK,
    headers: CORS_HEADERS,
    body: '',
  };
}

/**
 * Create health check response
 * 
 * @function createHealthResponse
 * @description Creates a standardized health check response containing
 * service status, timestamp, environment info, and configuration status.
 * 
 * @returns {APIGatewayProxyResult} Health check response with system status
 * 
 * @example
 * ```typescript
 * if (event.httpMethod === 'GET') {
 *   return createHealthResponse();
 * }
 * ```
 */
export function createHealthResponse(): APIGatewayProxyResult {
  return {
    statusCode: HTTP_STATUS.OK,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.ENVIRONMENT || 'production',
      openai_configured: Boolean(process.env.OPENAI_API_KEY)
    })
  };
}