/**
 * HTTP constants using Node.js built-in status codes
 * 
 * Leverages Node.js http module for standard HTTP status codes
 * while providing application-specific constants and utilities.
 */

import { STATUS_CODES } from 'http';

/**
 * Commonly used HTTP status codes
 * Uses Node.js built-in constants for consistency
 */
export const HTTP_STATUS = {
  // Success codes
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Redirection codes
  NOT_MODIFIED: 304,

  // Client error codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server error codes
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Get HTTP status message from Node.js built-in
 */
export function getStatusMessage(statusCode: number): string {
  return STATUS_CODES[statusCode] || 'Unknown Status';
}

/**
 * Check if status code indicates success
 */
export function isSuccessStatus(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

/**
 * Check if status code indicates client error
 */
export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * Check if status code indicates server error
 */
export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}

/**
 * CORS headers for cross-origin requests
 */
export const CORS_HEADERS: { [key: string]: string } = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Cache control headers
 */
export const CACHE_HEADERS = {
  NO_CACHE: 'no-cache, no-store, must-revalidate',
  SHORT_CACHE: 'public, max-age=300', // 5 minutes
  MEDIUM_CACHE: 'public, max-age=3600', // 1 hour
  LONG_CACHE: 'public, max-age=86400', // 24 hours
  IMMUTABLE: 'public, max-age=31536000, immutable' // 1 year
} as const;