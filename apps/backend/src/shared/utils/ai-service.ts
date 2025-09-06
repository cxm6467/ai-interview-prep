/**
 * AI analysis service for interview preparation
 * 
 * This module provides the core AI analysis functionality, integrating with
 * OpenAI's GPT models to generate comprehensive interview preparation materials
 * based on resume and job description analysis.
 */

import type { AnalysisResult } from '@cxm6467/ai-interview-prep-types';
import { getOpenAIClient } from './openai-client';
import { SYSTEM_PROMPT, createAnalysisPrompt } from './ai-prompts';
import { OpenAIModel } from '@cxm6467/ai-interview-prep-types';
import { Logger } from '@aws-lambda-powertools/logger';

// Initialize powertools logger for AI service
const logger = new Logger({ 
  serviceName: 'ai-interview-prep-ai-service',
  logLevel: (process.env.LOG_LEVEL as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR') || 'INFO'
});

/**
 * OpenAI configuration for analysis
 */
const OPENAI_CONFIG = {
  MODEL: OpenAIModel.GPT_3_5_TURBO,
  TEMPERATURE: 0.3,
  MAX_TOKENS: 3500,
  TIMEOUT: 90000
} as const;


/**
 * Generate a comprehensive interview preparation analysis using OpenAI
 * 
 * @async
 * @function generateComprehensiveAnalysis
 * @description Analyzes a resume against a job description to provide comprehensive
 * interview preparation materials including ATS scoring, interview questions,
 * presentation topics, and strategic advice.
 * 
 * @param {string} resumeText - The candidate's resume content as plain text
 * @param {string} jobDescription - The target job description as plain text
 * @returns {Promise<AnalysisResult>} Promise resolving to comprehensive analysis results
 * 
 * @throws {Error} When OpenAI client is not initialized
 * @throws {Error} When OpenAI API call fails
 * @throws {Error} When response parsing fails
 * 
 * @example
 * ```typescript
 * try {
 *   const analysis = await generateComprehensiveAnalysis(
 *     "John Doe\\nSoftware Engineer\\nExperience with React...",
 *     "Senior Frontend Developer position requiring React expertise..."
 *   );
 *   
 *   console.log(`ATS Score: ${analysis.atsScore.score}/100`);
 *   console.log(`Technical Questions: ${analysis.technicalQuestions.length}`);
 * } catch (error) {
 *   console.error('Analysis failed:', error.message);
 * }
 * ```
 */
export async function generateComprehensiveAnalysis(
  resumeText: string, 
  jobDescription: string
): Promise<AnalysisResult> {
  const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const analysisLogger = logger.createChild();
  
  analysisLogger.info('🚀 Starting comprehensive analysis', {
    service: 'ai-service',
    event: 'analysis-start',
    analysisId,
    resumeLength: resumeText.length,
    jobDescriptionLength: jobDescription.length
  });
  
  const openai = getOpenAIClient();
  
  if (!openai) {
    analysisLogger.error('🔑 OpenAI client not initialized');
    throw new Error('OpenAI client not initialized');
  }

  analysisLogger.debug('✅ OpenAI client initialized successfully');
  
  const analysisPrompt = createAnalysisPrompt(resumeText, jobDescription);
  analysisLogger.debug('Analysis prompt generated', { promptLength: analysisPrompt.length });

  try {
    const requestStartTime = Date.now();
    
    analysisLogger.info('🌐 Making OpenAI API request', {
      service: 'ai-service',
      event: 'openai-request',
      model: OPENAI_CONFIG.MODEL,
      temperature: OPENAI_CONFIG.TEMPERATURE,
      maxTokens: OPENAI_CONFIG.MAX_TOKENS
    });
    
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: OPENAI_CONFIG.TEMPERATURE,
      max_tokens: OPENAI_CONFIG.MAX_TOKENS,
      response_format: { type: 'json_object' }
    });
    
    const requestDuration = Date.now() - requestStartTime;
    
    analysisLogger.info('⚡ OpenAI API request completed', {
      service: 'ai-service',
      event: 'openai-response',
      duration: `${requestDuration}ms`,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens
      }
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      analysisLogger.error('❌ No response content from AI model', {
        service: 'ai-service',
        event: 'openai-error',
        choices: completion.choices.length,
        finishReason: completion.choices[0]?.finish_reason
      });
      throw new Error('No response from AI model');
    }

    analysisLogger.debug('Parsing AI response', { responseLength: responseText.length });
    
    // Parse and validate the response
    const result = JSON.parse(responseText) as AnalysisResult;
    
    analysisLogger.info('🎉 Analysis completed successfully', {
      service: 'ai-service',
      event: 'analysis-complete',
      atsScore: result.atsScore?.score,
      technicalQuestions: result.technicalQuestions?.length,
      behavioralQuestions: result.behavioralQuestions?.length,
      presentationTopics: result.presentationTopics?.length,
      candidateQuestions: result.candidateQuestions?.length
    });
    
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (error instanceof SyntaxError) {
      analysisLogger.error('🔧 Failed to parse AI response JSON', { 
        service: 'ai-service',
        event: 'json-parse-error',
        errorMessage 
      });
    } else {
      analysisLogger.error('🌐 OpenAI API request failed', { 
        service: 'ai-service',
        event: 'openai-error',
        errorMessage 
      });
    }
    
    throw new Error(`AI analysis failed: ${errorMessage}`);
  }
}