/**
 * Partial analysis service for selective data generation
 * 
 * This module provides functionality to generate only specific components
 * of the analysis, allowing clients to request exactly what they need.
 */

import type { PartialAnalysisResult } from '@cxm6467/ai-interview-prep-types';
import { AnalysisComponent } from '@cxm6467/ai-interview-prep-types';
import { generateComprehensiveAnalysis } from './ai-service';

/**
 * Generate partial analysis containing only requested components
 * 
 * @param resumeText - The candidate's resume text
 * @param jobDescription - The target job description
 * @param components - Array of analysis components to include
 * @returns Promise resolving to partial analysis results
 */
export async function generatePartialAnalysis(
  resumeText: string,
  jobDescription: string,
  components: AnalysisComponent[]
): Promise<PartialAnalysisResult> {
  
  // For now, we'll generate the full analysis and filter it
  // In a future optimization, we could create component-specific prompts
  const fullAnalysis = await generateComprehensiveAnalysis(resumeText, jobDescription);
  
  const partialResult: PartialAnalysisResult = {
    requestedComponents: [...components],
    includedComponents: []
  };

  // Filter the analysis based on requested components
  for (const component of components) {
    switch (component) {
      case AnalysisComponent.ATS_SCORE:
        if (fullAnalysis.atsScore) {
          partialResult.atsScore = fullAnalysis.atsScore;
          partialResult.includedComponents.push(AnalysisComponent.ATS_SCORE);
        }
        break;
      case AnalysisComponent.TECHNICAL_QUESTIONS:
        if (fullAnalysis.technicalQuestions) {
          partialResult.technicalQuestions = fullAnalysis.technicalQuestions;
          partialResult.includedComponents.push(AnalysisComponent.TECHNICAL_QUESTIONS);
        }
        break;
      case AnalysisComponent.BEHAVIORAL_QUESTIONS:
        if (fullAnalysis.behavioralQuestions) {
          partialResult.behavioralQuestions = fullAnalysis.behavioralQuestions;
          partialResult.includedComponents.push(AnalysisComponent.BEHAVIORAL_QUESTIONS);
        }
        break;
      case AnalysisComponent.PRESENTATION_TOPICS:
        if (fullAnalysis.presentationTopics) {
          partialResult.presentationTopics = fullAnalysis.presentationTopics;
          partialResult.includedComponents.push(AnalysisComponent.PRESENTATION_TOPICS);
        }
        break;
      case AnalysisComponent.CANDIDATE_QUESTIONS:
        if (fullAnalysis.candidateQuestions) {
          partialResult.candidateQuestions = fullAnalysis.candidateQuestions;
          partialResult.includedComponents.push(AnalysisComponent.CANDIDATE_QUESTIONS);
        }
        break;
      case AnalysisComponent.STRENGTHS:
        if (fullAnalysis.strengths) {
          partialResult.strengths = fullAnalysis.strengths;
          partialResult.includedComponents.push(AnalysisComponent.STRENGTHS);
        }
        break;
      case AnalysisComponent.IMPROVEMENTS:
        if (fullAnalysis.improvements) {
          partialResult.improvements = fullAnalysis.improvements;
          partialResult.includedComponents.push(AnalysisComponent.IMPROVEMENTS);
        }
        break;
    }
  }

  return partialResult;
}

/**
 * Parse analysis components from query string parameters
 * 
 * @param queryParams - Query parameters from API Gateway event
 * @returns Array of analysis components to include
 */
export function parseAnalysisComponents(queryParams: Record<string, string | undefined> | null): AnalysisComponent[] {
  if (!queryParams || !queryParams.include) {
    return []; // Empty array means full analysis
  }

  const includeParam = queryParams.include;
  const requestedComponents = includeParam.split(',').map(c => c.trim()) as AnalysisComponent[];
  
  // Filter to valid components only
  const validComponents: AnalysisComponent[] = [
    AnalysisComponent.ATS_SCORE, 
    AnalysisComponent.TECHNICAL_QUESTIONS, 
    AnalysisComponent.BEHAVIORAL_QUESTIONS, 
    AnalysisComponent.PRESENTATION_TOPICS, 
    AnalysisComponent.CANDIDATE_QUESTIONS, 
    AnalysisComponent.STRENGTHS, 
    AnalysisComponent.IMPROVEMENTS
  ];
  
  return requestedComponents.filter(component => validComponents.includes(component));
}