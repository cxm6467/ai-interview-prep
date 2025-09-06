/**
 * OpenAI client initialization and management
 * 
 * Module-level OpenAI client initialization with proper Lambda logging
 * and environment variable validation using AWS Lambda Powertools.
 */

import OpenAI from 'openai';
import { Logger } from '@aws-lambda-powertools/logger';

// Initialize powertools logger with service context
const logger = new Logger({ 
  serviceName: 'ai-interview-prep-openai',
  logLevel: (process.env.LOG_LEVEL as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR') || 'INFO'
});

/** Module-level OpenAI client instance */
let openaiClient: OpenAI | null = null;

/**
 * Initialize the OpenAI client on module load
 */
function initializeClient(): void {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    logger.error('🔑 OPENAI_API_KEY environment variable is not set');
    return;
  }

  try {
    openaiClient = new OpenAI({ apiKey });
    logger.info('✅ OpenAI client initialized successfully', {
      service: 'openai-client',
      event: 'initialization'
    });
  } catch (error) {
    logger.error('❌ Failed to initialize OpenAI client', { 
      service: 'openai-client',
      event: 'initialization',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Initialize client on module load
initializeClient();

/**
 * Get the OpenAI client instance
 * 
 * @returns {OpenAI} The OpenAI client instance
 * @throws {Error} If client is not initialized
 * 
 * @example
 * ```typescript
 * const openai = getOpenAIClient();
 * const completion = await openai.chat.completions.create({
 *   model: 'gpt-3.5-turbo',
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * });
 * ```
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please check OPENAI_API_KEY environment variable.');
  }
  return openaiClient;
}

/**
 * Check if OpenAI client is available
 */
export function isOpenAIClientAvailable(): boolean {
  return openaiClient !== null;
}

/**
 * Set request context for improved logging
 * This should be called at the start of each Lambda invocation
 */
export function setRequestContext(requestId: string, additionalContext?: Record<string, unknown>): void {
  logger.addPersistentLogAttributes({ 
    awsRequestId: requestId,
    ...additionalContext 
  });
}

/**
 * Get a child logger with additional context
 * Useful for operations that need specific context
 */
export function getContextualLogger(context: Record<string, unknown>) {
  return logger.createChild(context);
}