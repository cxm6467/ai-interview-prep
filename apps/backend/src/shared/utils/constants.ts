/**
 * Application constants and static configuration
 * 
 * This module contains all static configuration values, constants,
 * and configuration objects used throughout the application.
 */

/**
 * CORS headers for cross-origin requests
 * 
 * @constant {Object.<string, string>} CORS_HEADERS
 * @description Standard CORS headers to allow cross-origin requests from web browsers.
 * These headers enable the API to be called from frontend applications running on different domains.
 */
export const CORS_HEADERS: { [key: string]: string } = {
  /** Allow requests from any origin (consider restricting in production) */
  'Access-Control-Allow-Origin': '*',
  
  /** Allowed request headers */
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  
  /** Allowed HTTP methods */
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  
  /** Response content type */
  'Content-Type': 'application/json',
};

/**
 * OpenAI API configuration settings
 * 
 * @constant {Object} OPENAI_CONFIG
 * @description Configuration object for OpenAI API calls including model parameters
 * and timeouts. These values are optimized for interview analysis use case.
 */
export const OPENAI_CONFIG = {
  /** GPT model to use - optimized for speed and cost */
  MODEL: 'gpt-3.5-turbo-0125',
  
  /** Temperature setting (0.0-1.0) - lower values for more consistent responses */
  TEMPERATURE: 0.3,
  
  /** Maximum tokens in the response - balanced for comprehensive analysis */
  MAX_TOKENS: 3500,
  
  /** API call timeout in milliseconds */
  TIMEOUT: 90000, // 90 seconds
} as const;

/**
 * Standard HTTP status codes used in the application
 * 
 * @constant {Object} HTTP_STATUS
 * @description Commonly used HTTP status codes to ensure consistency
 * and avoid magic numbers throughout the codebase.
 */
export const HTTP_STATUS = {
  /** 200 - Request successful */
  OK: 200,
  
  /** 400 - Client error, invalid request */
  BAD_REQUEST: 400,
  
  /** 404 - Resource not found */
  NOT_FOUND: 404,
  
  /** 405 - HTTP method not allowed */
  METHOD_NOT_ALLOWED: 405,
  
  /** 500 - Internal server error */
  INTERNAL_SERVER_ERROR: 500,
} as const;