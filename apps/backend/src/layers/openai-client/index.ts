/**
 * @fileoverview Shared OpenAI client Lambda layer
 * 
 * This module provides a shared OpenAI client configuration and utilities
 * that can be used across multiple Lambda functions. It includes authentication,
 * configuration management, and common OpenAI operations.
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * OpenAI configuration constants
 */
export const OPENAI_CONFIG = {
  MODEL: 'gpt-4o-mini' as const,
  MAX_TOKENS: 4000 as const,
  TEMPERATURE: 0.7 as const,
  TOP_P: 1 as const,
  FREQUENCY_PENALTY: 0.3 as const,
  PRESENCE_PENALTY: 0.1 as const
} as const;

/**
 * Singleton OpenAI client instance
 */
let openaiClient: OpenAI | null = null;

/**
 * Initialize and return the OpenAI client
 * This function ensures a single instance is created and reused
 * 
 * @returns OpenAI client instance or null if API key is not configured
 */
export function getOpenAIClient(): OpenAI | null {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables');
      return null;
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
      timeout: 60000, // 60 seconds timeout for Lambda functions
      maxRetries: 3
    });
  }

  return openaiClient;
}

/**
 * Validate OpenAI client configuration
 * 
 * @returns true if client is properly configured, false otherwise
 */
export function validateOpenAIConfig(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Create a standardized system prompt for interview coaching
 * 
 * @param role - The type of interviewer role (recruiter, tech-lead, etc.)
 * @param context - Additional context information
 * @returns Formatted system prompt
 */
export function createInterviewSystemPrompt(
  role: string = 'interviewer',
  context: {
    resumeText?: string;
    jobDescription?: string;
    type?: 'interview' | 'feedback' | 'general';
  } = {}
): string {
  let systemPrompt = `You are an AI interview coach helping candidates prepare for job interviews. Provide constructive, encouraging feedback and guidance.`;
  
  if (context.type === 'interview') {
    systemPrompt = `You are conducting a practice interview session as a ${role}. Ask thoughtful questions, provide feedback on answers, and help the candidate improve their responses. Be supportive but constructive.`;
  } else if (context.type === 'feedback') {
    systemPrompt = `You are providing feedback on interview responses from the perspective of a ${role}. Analyze the candidate's answer and provide specific, actionable suggestions for improvement.`;
  }
  
  // Add context if available
  if (context.resumeText) {
    systemPrompt += `\n\nCandidate's background: ${context.resumeText.substring(0, 500)}`;
  }
  
  if (context.jobDescription) {
    systemPrompt += `\n\nTarget role: ${context.jobDescription.substring(0, 500)}`;
  }
  
  return systemPrompt;
}

/**
 * Generate chat completion with standard error handling
 * 
 * @param messages - Array of chat messages
 * @param options - Optional configuration overrides
 * @returns Promise resolving to the generated response
 * @throws Error if OpenAI client is not initialized or API call fails
 */
export async function generateChatCompletion(
  messages: ChatCompletionMessageParam[],
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  } = {}
): Promise<string> {
  const client = getOpenAIClient();
  
  if (!client) {
    throw new Error('OpenAI client is not initialized. Please check your API key configuration.');
  }

  try {
    const response = await client.chat.completions.create({
      model: options.model || OPENAI_CONFIG.MODEL,
      messages,
      max_tokens: Math.min(options.maxTokens || OPENAI_CONFIG.MAX_TOKENS, OPENAI_CONFIG.MAX_TOKENS),
      temperature: options.temperature ?? OPENAI_CONFIG.TEMPERATURE,
      top_p: options.topP ?? OPENAI_CONFIG.TOP_P,
      frequency_penalty: options.frequencyPenalty ?? OPENAI_CONFIG.FREQUENCY_PENALTY,
      presence_penalty: options.presencePenalty ?? OPENAI_CONFIG.PRESENCE_PENALTY
    });
    
    return response.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
    
  } catch (error) {
    console.error('OpenAI chat completion failed:', error);
    throw new Error(`OpenAI service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build conversation messages array with proper formatting
 * 
 * @param systemPrompt - The system prompt to use
 * @param userMessage - The current user message
 * @param conversationHistory - Optional conversation history
 * @param maxHistoryLength - Maximum number of history messages to include
 * @returns Formatted messages array for OpenAI
 */
export function buildConversationMessages(
  systemPrompt: string,
  userMessage: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxHistoryLength: number = 10
): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Add conversation history if available
  if (conversationHistory && conversationHistory.length > 0) {
    // Limit history to avoid token limits
    const recentHistory = conversationHistory.slice(-maxHistoryLength);
    messages.push(...recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })));
  }
  
  // Add current user message
  messages.push({ role: 'user', content: userMessage });
  
  return messages;
}

/**
 * Check if OpenAI service is available
 * This function can be used for health checks
 * 
 * @returns Promise resolving to true if service is available
 */
export async function checkOpenAIHealth(): Promise<boolean> {
  try {
    const client = getOpenAIClient();
    if (!client) return false;
    
    // Simple test request
    await client.chat.completions.create({
      model: OPENAI_CONFIG.MODEL,
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    });
    
    return true;
  } catch {
    return false;
  }
}