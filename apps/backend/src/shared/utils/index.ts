/**
 * Utility functions and helpers
 * 
 * This module provides a centralized export point for all utility functions,
 * constants, and helper modules used throughout the application. It includes
 * response helpers, AI services, configuration constants, and more.
 * 
 * @example
 * ```typescript
 * import { createSuccessResponse, HTTP_STATUS, generateComprehensiveAnalysis } from './utils';
 * 
 * // Use response helper
 * const response = createSuccessResponse({ message: 'Success!' });
 * 
 * // Use HTTP status constants
 * if (statusCode === HTTP_STATUS.OK) {
 *   // Handle success
 * }
 * 
 * // Use AI service
 * const analysis = await generateComprehensiveAnalysis(resume, jobDesc);
 * ```
 */

// Export shared constants and HTTP utilities
export * from './http-constants';

// Export cryptographic utilities
export * from './crypto-utils';

// Export PII patterns and detection
export * from './pii-patterns';

// Export response helper functions
export * from './response-helpers';

// Export AI prompt templates and functions
export * from './ai-prompts';

// Export AI service functions
export * from './ai-service';

// Export OpenAI client management functions
export * from './openai-client';

// Export PII scrubbing utilities
export * from './pii-scrubber';

// Export secure caching utilities
export * from './secure-cache';

// Export data sanitization utilities
export * from './data-sanitizer';

// Export progress tracking utilities
export * from './progress-tracker';

// Export partial analysis utilities
export * from './partial-analysis';
