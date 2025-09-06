/**
 * @fileoverview Custom error types for AI Analysis service
 * 
 * Provides specific error types for different failure scenarios
 * to enable better error handling and user experience.
 */

/**
 * Base class for AI Analysis service errors
 */
export abstract class AIAnalysisError extends Error {
  abstract readonly code: string;
  abstract readonly userMessage: string;
  
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error when the AI service is unreachable
 */
export class AIServiceConnectionError extends AIAnalysisError {
  readonly code = 'AI_SERVICE_CONNECTION_ERROR';
  readonly userMessage = 'Unable to connect to the AI service. Please check your internet connection and try again.';
  
  constructor(originalError?: Error) {
    super('Failed to connect to AI service', originalError);
  }
}

/**
 * Error when the AI service returns an invalid response
 */
export class AIServiceResponseError extends AIAnalysisError {
  readonly code = 'AI_SERVICE_RESPONSE_ERROR';
  readonly userMessage = 'The AI service returned an invalid response. Please try again.';
  
  constructor(message: string, originalError?: Error) {
    super(`AI service response error: ${message}`, originalError);
  }
}

/**
 * Error when parsing AI response JSON fails
 */
export class AIResponseParseError extends AIAnalysisError {
  readonly code = 'AI_RESPONSE_PARSE_ERROR';
  readonly userMessage = 'Failed to process the AI response. Please try again.';
  
  constructor(originalError?: Error) {
    super('Failed to parse AI response', originalError);
  }
}

/**
 * Error when API rate limit is exceeded
 */
export class RateLimitError extends AIAnalysisError {
  readonly code = 'RATE_LIMIT_ERROR';
  readonly userMessage = 'Too many requests. Please wait a moment before trying again.';
  
  constructor(originalError?: Error) {
    super('API rate limit exceeded', originalError);
  }
}

/**
 * Error when input validation fails
 */
export class InputValidationError extends AIAnalysisError {
  readonly code = 'INPUT_VALIDATION_ERROR';
  readonly userMessage: string;
  
  constructor(message: string) {
    super(`Input validation failed: ${message}`);
    this.userMessage = message;
  }
}

/**
 * Error when API key is missing or invalid
 */
export class AuthenticationError extends AIAnalysisError {
  readonly code = 'AUTHENTICATION_ERROR';
  readonly userMessage = 'Authentication failed. Please check your API configuration.';
  
  constructor(originalError?: Error) {
    super('Authentication failed', originalError);
  }
}

/**
 * Generic server error for 5xx responses
 */
export class ServerError extends AIAnalysisError {
  readonly code = 'SERVER_ERROR';
  readonly userMessage = 'The server is experiencing issues. Please try again later.';
  
  constructor(status: number, originalError?: Error) {
    super(`Server error (${status})`, originalError);
  }
}

/**
 * Utility function to create appropriate error based on HTTP status
 */
export function createErrorFromStatus(status: number, message: string, originalError?: Error): AIAnalysisError {
  switch (status) {
    case 401:
    case 403:
      return new AuthenticationError(originalError);
    case 429:
      return new RateLimitError(originalError);
    case 422:
      return new InputValidationError(message);
    default:
      if (status >= 500) {
        return new ServerError(status, originalError);
      }
      return new AIServiceResponseError(message, originalError);
  }
}

/**
 * Utility function to determine if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof AIServiceConnectionError) return true;
  if (error instanceof ServerError) return true;
  if (error instanceof RateLimitError) return false; // Should wait, not retry immediately
  if (error instanceof AuthenticationError) return false;
  if (error instanceof InputValidationError) return false;
  
  return false; // Conservative approach - don't retry unknown errors
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: Error): string {
  if (error instanceof AIAnalysisError) {
    return error.userMessage;
  }
  
  // Fallback for unknown errors
  return 'An unexpected error occurred. Please try again.';
}