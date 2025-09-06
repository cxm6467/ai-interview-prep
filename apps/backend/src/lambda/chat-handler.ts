/**
 * @fileoverview AWS Lambda handler for AI-powered interview chat functionality
 * 
 * This module provides a specialized Lambda function for interactive interview coaching
 * chat sessions. Unlike the main analysis handler, this supports conversational AI
 * for real-time interview practice and feedback.
 */

import type { 
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext
} from 'aws-lambda';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  createOptionsResponse,
  HTTP_STATUS,
  PIIScrubber,
} from '../shared/utils';
import { 
  OPENAI_CONFIG,
  createInterviewSystemPrompt,
  generateChatCompletion,
  buildConversationMessages
} from '../layers/openai-client';
import { ContentType } from '@cxm6467/ai-interview-prep-types';

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
 * Request body interface for chat functionality
 */
interface ChatRequestBody {
  /** The user's chat message/prompt */
  prompt: string;
  
  /** Optional resume context for personalized responses */
  resumeText?: string;
  
  /** Optional job description context */
  jobDescription?: string;
  
  /** Chat context type (interview, feedback, general) */
  type?: 'interview' | 'feedback' | 'general';
  
  /** Maximum tokens for the AI response */
  maxTokens?: number;
  
  /** Conversation history for context */
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * Parses and validates the JSON request body for chat requests
 */
function parseChatRequestBody(body: string | null, requestId: string): 
  | { success: true; data: ChatRequestBody } 
  | { success: false; response: APIGatewayProxyResult } {
  
  if (!body) {
    logger.warn('Chat request received without body', { requestId });
    return {
      success: false,
      response: createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Request body is required')
    };
  }

  try {
    logger.debug('Parsing chat request body', { requestId, bodyLength: body.length });
    const data = JSON.parse(body) as ChatRequestBody;
    logger.debug('Chat request body parsed successfully', { 
      requestId, 
      hasPrompt: Boolean(data.prompt),
      hasResumeContext: Boolean(data.resumeText),
      hasJobContext: Boolean(data.jobDescription),
      type: data.type || 'general'
    });
    return { success: true, data };
  } catch (e) {
    logger.error('Failed to parse chat request body JSON', { requestId }, undefined, e as Error);
    return {
      success: false,
      response: createErrorResponse(HTTP_STATUS.BAD_REQUEST, 'Invalid JSON in request body')
    };
  }
}

/**
 * Generates AI chat response using the shared OpenAI layer
 */
async function generateChatResponse(
  prompt: string, 
  resumeText?: string, 
  jobDescription?: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  type: 'interview' | 'feedback' | 'general' = 'general',
  maxTokens: number = 1000
): Promise<string> {
  try {
    // Create system prompt using shared layer function
    const systemPrompt = createInterviewSystemPrompt('interviewer', {
      resumeText,
      jobDescription,
      type
    });
    
    // Build conversation messages using shared layer function
    const messages = buildConversationMessages(
      systemPrompt,
      prompt,
      conversationHistory,
      10 // Max history length
    );
    
    // Generate response using shared layer function
    return await generateChatCompletion(messages, {
      maxTokens: Math.min(maxTokens, OPENAI_CONFIG.MAX_TOKENS),
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0.3,
      presencePenalty: 0.1
    });
    
  } catch (error) {
    logger.error('OpenAI chat completion failed', {}, undefined, error as Error);
    throw new Error(`Chat AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main AWS Lambda handler function for chat functionality
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

  requestLogger.info('Chat Lambda function invoked', { functionName: context.functionName, requestId });
  requestLogger.requestStart(event.httpMethod, event.path, requestId);

  try {
    if (event.httpMethod === 'OPTIONS') {
      requestLogger.network('CORS preflight request handled', { requestId });
      const response = createOptionsResponse();
      requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
      return response;
    }

    if (event.httpMethod !== 'POST') {
      requestLogger.warn('Invalid HTTP method for chat', { requestId, method: event.httpMethod });
      const response = createErrorResponse(HTTP_STATUS.METHOD_NOT_ALLOWED, 'Method Not Allowed');
      requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
      return response;
    }

    // Parse and validate request
    const requestBody = parseChatRequestBody(event.body, requestId);
    if (!requestBody.success) {
      requestLogger.requestEnd(event.httpMethod, event.path, requestBody.response.statusCode, Date.now() - startTime, requestId);
      return requestBody.response;
    }

    const { prompt, resumeText, jobDescription, type, maxTokens, conversationHistory } = requestBody.data;

    if (!prompt || prompt.trim().length === 0) {
      requestLogger.warn('Missing or empty prompt', { requestId });
      const response = createErrorResponse(
        HTTP_STATUS.BAD_REQUEST, 
        'Prompt is required and cannot be empty'
      );
      requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, Date.now() - startTime, requestId);
      return response;
    }

    // Scrub PII from input data before processing (if context is provided)
    let scrubbedResumeText = resumeText;
    let scrubbedJobDescription = jobDescription;
    
    if (resumeText || jobDescription) {
      requestLogger.info('Scrubbing PII from chat context', { requestId });
      const piiScrubStartTime = Date.now();
      
      if (resumeText) {
        const resumeScrubResult = PIIScrubber.scrub(resumeText, ContentType.RESUME);
        scrubbedResumeText = resumeScrubResult.scrubbedText;
        requestLogger.info('Resume context PII scrubbed', {
          requestId,
          itemsFound: resumeScrubResult.piiItemsFound,
          categories: resumeScrubResult.piiCategories,
          hasCritical: resumeScrubResult.hasCriticalPII
        });
      }
      
      if (jobDescription) {
        const jobScrubResult = PIIScrubber.scrub(jobDescription, ContentType.JOB_DESCRIPTION);
        scrubbedJobDescription = jobScrubResult.scrubbedText;
        requestLogger.info('Job description context PII scrubbed', {
          requestId,
          itemsFound: jobScrubResult.piiItemsFound,
          categories: jobScrubResult.piiCategories,
          hasCritical: jobScrubResult.hasCriticalPII
        });
      }
      
      const piiScrubDuration = Date.now() - piiScrubStartTime;
      requestLogger.info('PII scrubbing completed for chat context', {
        requestId,
        duration: `${piiScrubDuration}ms`
      });
    }

    // Log chat request details
    requestLogger.ai('Starting AI chat response generation with PII-scrubbed context', { 
      requestId, 
      promptLength: prompt.length,
      hasResumeContext: Boolean(scrubbedResumeText),
      hasJobContext: Boolean(scrubbedJobDescription),
      type: type || 'general',
      maxTokens: maxTokens || 1000,
      historyLength: conversationHistory?.length || 0
    });

    // Generate AI chat response using scrubbed context
    const chatStartTime = Date.now();
    const aiResponse = await generateChatResponse(
      prompt,
      scrubbedResumeText,
      scrubbedJobDescription,
      conversationHistory,
      type || 'general',
      maxTokens || 1000
    );
    const chatDuration = Date.now() - chatStartTime;
    
    requestLogger.ai('AI chat response generated successfully', { 
      requestId, 
      chatDuration: `${chatDuration}ms`,
      responseLength: aiResponse.length
    });
    
    const response = createSuccessResponse({
      success: true,
      data: {
        response: aiResponse,
        type: type || 'general',
        timestamp: new Date().toISOString()
      }
    });
    
    const totalDuration = Date.now() - startTime;
    requestLogger.success('Chat request completed successfully', { requestId, totalDuration: `${totalDuration}ms` });
    requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, totalDuration, requestId);
    requestLogger.success('Chat Lambda function completed', { functionName: context.functionName, requestId, totalDuration });
    
    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    requestLogger.critical('Unhandled error in Chat Lambda handler', { 
      requestId, 
      duration: `${duration}ms`,
      errorMessage 
    }, undefined, error as Error);
    
    const response = createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal Server Error', errorMessage);
    requestLogger.requestEnd(event.httpMethod, event.path, response.statusCode, duration, requestId);
    
    return response;
  }
};