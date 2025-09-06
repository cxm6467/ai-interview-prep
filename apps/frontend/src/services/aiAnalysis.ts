import type { ResumeData, JobDescription, InterviewQuestion, CandidateQuestion, PresentationTopic, ATSScore } from '@cxm6467/ai-interview-prep-types';
import { APIMonitor } from './progressService';
import { PIIScrubber, ContentType } from './piiScrubber';
import {
  AIServiceConnectionError,
  AIServiceResponseError,
  AIResponseParseError,
  createErrorFromStatus,
  InputValidationError
} from './errors';

/**
 * AI Analysis Service
 * 
 * Core service class that handles all AI-powered analysis functionality for the application.
 * Integrates with OpenAI GPT models via AWS Lambda Functions to provide intelligent resume analysis,
 * job matching, interview question generation, and interactive coaching.
 * 
 * Features:
 * - Resume parsing and structured data extraction
 * - Job description analysis and requirement extraction
 * - ATS score calculation with keyword matching
 * - Personalized interview question generation
 * - Dynamic presentation topic creation
 * - Interactive interview coaching with role-specific feedback
 * - Intelligent caching and fallback mechanisms
 * 
 * Architecture:
 * - Uses AWS Lambda Functions for secure API key management
 * - Implements timeout handling (30s) for AI operations
 * - Provides mock data fallbacks for offline/error scenarios
 * - Supports multiple interviewer role perspectives
 * 
 * @class AIAnalysisService
 */
export interface ConsolidatedAnalysisResult {
  atsScore: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    keywordMatches: string[];
    missingKeywords: string[];
  };
  technicalQuestions: Array<{ question: string; answer: string }>;
  behavioralQuestions: Array<{ question: string; answer: string }>;
  presentationTopics: Array<{ topic: string; keyPoints: string[] }>;
  candidateQuestions: string[];
  strengths: string[];
  improvements: string[];
  _cacheInfo?: {
    cached: boolean;
    duration: number;
  };
}

export class AIAnalysisService {
  /**
   * Core OpenAI API Integration Method
   * 
   * Handles secure communication with OpenAI GPT models via AWS Lambda Functions.
   * Automatically detects production vs development environment and routes requests accordingly.
   * 
   * @private
   * @static
   * @async
   * @param {string} prompt - The prompt to send to the AI model
   * @param {number} [maxTokens=1000] - Maximum tokens for the AI response
   * @returns {Promise<string>} The AI-generated response text
   * @throws {Error} When API call fails or times out
   */
  /**
   * Perform a consolidated analysis of resume and job description in a single API call
   * @param resumeText The full text of the resume
   * @param jobDescription The job description text
   * @param components Optional array of specific components to analyze
   * @returns A promise that resolves to the consolidated analysis result
   */
  static async performConsolidatedAnalysis(
    resumeText: string,
    jobDescription: string,
    components?: string[]
  ): Promise<ConsolidatedAnalysisResult> {
    // Input validation
    if (!resumeText?.trim()) {
      throw new InputValidationError('Resume text is required and cannot be empty');
    }
    if (!jobDescription?.trim()) {
      throw new InputValidationError('Job description is required and cannot be empty');
    }
    if (resumeText.trim().length < 50) {
      throw new InputValidationError('Resume text is too short (minimum 50 characters)');
    }
    if (jobDescription.trim().length < 20) {
      throw new InputValidationError('Job description is too short (minimum 20 characters)');
    }
    
    let apiUrl = import.meta.env.VITE_API_BASE_URL + '/analyze';

    // Add query parameters for partial analysis
    if (components && components.length > 0) {
      const params = new URLSearchParams({ include: components.join(',') });
      apiUrl += `?${params.toString()}`;
    }

    // Starting consolidated analysis

    const startTime = performance.now();
    const isPartial = components && components.length > 0;
    
    // Scrub PII before sending to backend for privacy protection
    const resumeScrubResult = PIIScrubber.scrub(resumeText, ContentType.RESUME);
    const jobScrubResult = PIIScrubber.scrub(jobDescription, ContentType.JOB_DESCRIPTION);
    
    // Capture request data for monitoring (using scrubbed data)
    const requestBody = { 
      resumeText: resumeScrubResult.scrubbedText, 
      jobDescription: jobScrubResult.scrubbedText 
    };
    const requestHeaders = { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(120000) // 120 second timeout for consolidated analysis
      });

      const duration = performance.now() - startTime;
      const cached = response.headers.get('x-cache') === 'HIT';

      // Capture response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Track failed API call for DevPanel monitoring (only in development)
        if (import.meta.env.DEV) {
          APIMonitor.addCall({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            method: 'POST',
            url: apiUrl,
            status: response.status,
            duration,
            timestamp: new Date(),
            cached: false,
            partial: isPartial || false,
            components: isPartial ? components : undefined,
            requestBody: {
              ...requestBody,
              resumeText: requestBody.resumeText.length > 200 ? requestBody.resumeText.substring(0, 200) + '...' : requestBody.resumeText,
              jobDescription: requestBody.jobDescription.length > 200 ? requestBody.jobDescription.substring(0, 200) + '...' : requestBody.jobDescription
            },
            responseBody: { error: errorText },
            requestHeaders,
            responseHeaders
          });
        }
        
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      // Track successful API call for DevPanel monitoring (only in development)
      if (import.meta.env.DEV) {
        APIMonitor.addCall({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          method: 'POST',
          url: apiUrl,
          status: response.status,
          duration,
          timestamp: new Date(),
          cached: cached || false,
          partial: isPartial || false,
          components: isPartial ? components : undefined,
          requestBody: {
            ...requestBody,
            // Truncate long text for readability (using scrubbed data)
            resumeText: requestBody.resumeText.length > 200 ? requestBody.resumeText.substring(0, 200) + '...' : requestBody.resumeText,
            jobDescription: requestBody.jobDescription.length > 200 ? requestBody.jobDescription.substring(0, 200) + '...' : requestBody.jobDescription
          },
          responseBody: result,
          requestHeaders,
          responseHeaders
        });
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error from AI service');
      }

      // Add cache information to the result
      const analysisResult: ConsolidatedAnalysisResult = {
        ...result.data,
        _cacheInfo: {
          cached: cached || false,
          duration
        }
      };

      return analysisResult;
    } catch (error) {
      // Network/timeout errors that didn't reach the server
      if (import.meta.env.DEV && !(error instanceof Error && error.message?.includes('API request failed with status'))) {
        const duration = performance.now() - startTime;
        APIMonitor.addCall({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          method: 'POST',
          url: apiUrl,
          status: 0, // Network/timeout errors
          duration,
          timestamp: new Date(),
          cached: false,
          partial: isPartial || false,
          components: isPartial ? components : undefined,
          requestBody: {
            ...requestBody,
            resumeText: resumeText.length > 200 ? resumeText.substring(0, 200) + '...' : resumeText,
            jobDescription: jobDescription.length > 200 ? jobDescription.substring(0, 200) + '...' : jobDescription
          },
          responseBody: { error: error instanceof Error ? error.message : 'Unknown error' },
          requestHeaders
        });
      }

      console.error('❌ Consolidated analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during analysis';
      throw new Error(`Consolidated analysis failed: ${errorMessage}`);
    }
  }

  private static async callOpenAI(prompt: string, maxTokens: number = 1000): Promise<string> {
    const apiUrl = import.meta.env.VITE_API_BASE_URL + '/analyze';
    const requestBody = {
      prompt: prompt,
      type: 'analysis',
      maxTokens: maxTokens
    };

    // Calling AI service

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        // Add timeout for AI API calls (30 seconds)
        signal: AbortSignal.timeout(30000)
      });

      const responseText = await response.text();
      if (!response.ok) {
        console.error('AI service error:', response.status, response.statusText);
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch {
          errorData = { error: responseText || 'Invalid JSON response' };
        }
        const errorMessage = errorData.error?.message || errorData.error || 'Unknown error';
        throw createErrorFromStatus(response.status, errorMessage);
      }

      const data = responseText ? JSON.parse(responseText) : {};
      return data.response || '';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🚨 AI service call failed:', errorMessage);
      
      // Re-throw custom errors as-is
      if (error instanceof AIServiceResponseError || 
          error instanceof AIServiceConnectionError ||
          error instanceof AIResponseParseError) {
        throw error;
      }
      
      // Handle network/connection errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AIServiceConnectionError(error);
      }
      
      // Handle AbortError from timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIServiceConnectionError(error);
      }
      
      // Handle JSON parse errors
      if (error instanceof SyntaxError) {
        throw new AIResponseParseError(error);
      }
      
      // Default to service response error
      throw new AIServiceResponseError(errorMessage, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Call AI service specifically for interview chat functionality
   * This uses the dedicated chat endpoint for real-time interview coaching
   */
  private static async callInterviewAI(prompt: string, resumeText: string = '', jobDescription: string = '', maxTokens: number = 1000): Promise<string> {
    const apiUrl = import.meta.env.VITE_CHAT_API_BASE_URL;
      
    const requestBody = {
      prompt: prompt,
      resumeText: resumeText || undefined,
      jobDescription: jobDescription || undefined,
      type: 'interview' as const,
      maxTokens: maxTokens
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000)
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Interview AI service error:', response.status, response.statusText);
        let errorData;
        try {
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch {
          errorData = { error: responseText || 'Invalid JSON response' };
        }
        const errorMessage = errorData.error?.message || errorData.error || 'Unknown error';
        throw createErrorFromStatus(response.status, errorMessage);
      }

      const data = responseText ? JSON.parse(responseText) : {};
      return data.data?.response || data.response || '';
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🚨 Interview AI service call failed:', errorMessage);
      
      // Re-throw custom errors as-is
      if (error instanceof AIServiceResponseError || 
          error instanceof AIServiceConnectionError ||
          error instanceof AIResponseParseError) {
        throw error;
      }
      
      // Handle network/connection errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AIServiceConnectionError(error);
      }
      
      // Handle AbortError from timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AIServiceConnectionError(error);
      }
      
      // Handle JSON parse errors
      if (error instanceof SyntaxError) {
        throw new AIResponseParseError(error);
      }
      
      // Default to service response error
      throw new AIServiceResponseError(errorMessage, error instanceof Error ? error : undefined);
    }
  }

  static async calculateATSScore(
    resume: ResumeData,
    job: JobDescription
  ): Promise<ATSScore> {
    // All skill analysis and computation is now handled by the Lambda function
    // The frontend only sends raw data and receives processed results

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. 
    
TASK: Analyze the following resume against the job requirements and calculate an ATS compatibility score.

RESUME INFORMATION:
- Skills: ${resume.skills.join(', ')}
- Experience: ${resume.experience?.map((exp: unknown) => (exp as { description: string[] }).description.join(', ')).join(' ') || 'No experience listed'}
- Education: ${resume.education?.map((edu: unknown) => `${(edu as { degree: string; school: string }).degree} at ${(edu as { degree: string; school: string }).school}`).join('; ') || 'Not specified'}

JOB REQUIREMENTS:
- Title: ${job.title || 'Not specified'}
- Required Skills: ${job.requirements?.join(', ') || 'Not specified'}
- Responsibilities: ${job.responsibilities?.join('; ') || 'Not specified'}
- Preferred Skills: ${job.preferredSkills?.join(', ') || 'None listed'}

ANALYSIS INSTRUCTIONS:
1. Score the match between resume and job (0-100) based on skills, experience, and education
2. List 3-5 key strengths that make the candidate a good fit
3. List 3-5 key areas for improvement to better match the job
4. Perform comprehensive skill matching analysis between resume and job requirements

FORMAT your response as a valid JSON object with these exact keys:
{
  "score": number (0-100),
  "strengths": string[],
  "improvements": string[],
  "keywordMatches": string[],
  "missingKeywords": string[]
}

IMPORTANT: 
- Return ONLY the JSON object with no additional text or explanations.
- Use the exact missing keywords provided above.`;

    try {
      const response = await this.callOpenAI(prompt, 2000);
      
      // Clean up the response to extract just the JSON
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```(?:json)?\s*|```/g, '').trim();
      
      // Try to find JSON object in the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      try {
        const result = JSON.parse(cleanResponse);
        
        // Validate and ensure all required fields exist with proper types
        return {
          score: typeof result.score === 'number' ? Math.max(0, Math.min(100, result.score)) : 0,
          strengths: Array.isArray(result.strengths) ? result.strengths : [],
          improvements: Array.isArray(result.improvements) ? result.improvements : [],
          keywordMatches: Array.isArray(result.keywordMatches) ? result.keywordMatches : [],
          missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : []
        };
      } catch (jsonError) {
        console.error('⚠️ Failed to parse ATS response as JSON:', jsonError instanceof Error ? jsonError.message : 'Parse error');
        throw new AIResponseParseError(jsonError instanceof Error ? jsonError : undefined);
      }
    } catch (error) {
      console.error('📊 ATS score calculation failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
  static async analyzeResume(resumeText: string): Promise<ResumeData> {
    const prompt = `
Analyze this resume and extract structured information. Return a JSON object with the following structure:
{
  "name": "string",
  "email": "string", 
  "phone": "string",
  "summary": "string (2-3 sentences)",
  "experience": [
    {
      "company": "string",
      "position": "string", 
      "duration": "string",
      "description": ["string array of 3-4 key achievements"]
    }
  ],
  "skills": ["array of technical skills"],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "year": "string"
    }
  ],
  "certifications": ["array of certifications if any"]
}

Resume text:
${resumeText}

Return only valid JSON without any additional text or formatting.`;

    try {
      const response = await this.callOpenAI(prompt, 1500);
      const cleanResponse = response.trim().replace(/```json\n?|\n?```/g, '');
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('📄 Resume analysis failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
  static async analyzeJobDescription(jobText: string): Promise<JobDescription> {
    const prompt = `
Analyze this job posting and extract structured information. Return a JSON object with:
{
  "title": "string",
  "company": "string",
  "requirements": ["array of key requirements"],
  "responsibilities": ["array of main responsibilities"], 
  "preferredSkills": ["array of preferred/nice-to-have skills"],
  "description": "original text"
}

Job posting:
${jobText}

Return only valid JSON without any additional text.`;

    try {
      const response = await this.callOpenAI(prompt, 1200);
      const cleanResponse = response.trim().replace(/```json\n?|\n?```/g, '');
      const parsed = JSON.parse(cleanResponse);
      parsed.description = jobText; // Keep original text
      return parsed;
    } catch (error) {
      console.error('💼 Job analysis failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
  static async generateInterviewResponse(
    userResponse: string,
    currentQuestion: string,
    resume: ResumeData,
    conversationHistory: string[],
    interviewerRole?: string,
    analysisContext?: {
      jobDescription?: JobDescription | null;
      atsScore?: ATSScore | null;
      allQuestions?: InterviewQuestion[];
      presentationTopics?: PresentationTopic[];
      candidateQuestions?: CandidateQuestion[];
    }
  ): Promise<string> {
    try {
      const interviewerContext = interviewerRole ? this.getInterviewerFeedbackContext(interviewerRole) : '';
      
      // Build enhanced context from analysis data
      let contextualInfo = '';
      if (analysisContext) {
        if (analysisContext.jobDescription) {
          contextualInfo += `\nTarget Job: ${analysisContext.jobDescription.title} at ${analysisContext.jobDescription.company}`;
        }
        if (analysisContext.atsScore) {
          contextualInfo += `\nATS Score: ${analysisContext.atsScore.score}/100`;
          if (analysisContext.atsScore.strengths?.length > 0) {
            contextualInfo += `\nCandidate Strengths: ${analysisContext.atsScore.strengths.join(', ')}`;
          }
          if (analysisContext.atsScore.improvements?.length > 0) {
            contextualInfo += `\nAreas for Improvement: ${analysisContext.atsScore.improvements.join(', ')}`;
          }
        }
        if (analysisContext.allQuestions && analysisContext.allQuestions.length > 0) {
          contextualInfo += `\nTotal Interview Questions Available: ${analysisContext.allQuestions.length}`;
        }
      }
      
      const prompt = `You are conducting an interview as a ${interviewerRole || 'interviewer'}. The candidate's resume shows experience with: ${JSON.stringify(resume.skills || [])}

${interviewerContext}${contextualInfo}
      
Current interview question: "${currentQuestion}"
      
Candidate's response: "${userResponse}"
      
Conversation history so far:
${conversationHistory.join('\n')}
      
Provide constructive feedback on the candidate's response from your perspective as a ${interviewerRole || 'interviewer'}. Consider their strengths and areas for improvement from the analysis. Then ask a thoughtful follow-up question or move to the next question.`;

      // Extract resume and job description text for the backend API
      const resumeText = `${resume.name || ''} ${resume.email || ''} ${(resume.skills || []).join(' ')} ${(resume.experience || []).map((exp: unknown) => (exp as { description: string[] }).description.join(' ')).join(' ')}`.trim();
      const jobDescriptionText = analysisContext?.jobDescription ? 
        `${analysisContext.jobDescription.title || ''} ${analysisContext.jobDescription.company || ''} ${(analysisContext.jobDescription.requirements || []).join(' ')} ${(analysisContext.jobDescription.responsibilities || []).join(' ')}`.trim() 
        : '';
      
      return await this.callInterviewAI(prompt, resumeText, jobDescriptionText);
    } catch (error) {
      console.error('🤖 Interview response generation failed:', error instanceof Error ? error.message : 'Unknown error');
      return "Thank you for your response. Let's move on to the next question.";
    }
  }

  static async generateInterviewQuestions(
    resume: ResumeData,
    job: JobDescription,
    interviewerRole?: string
  ): Promise<InterviewQuestion[]> {
    const interviewerContext = interviewerRole ? this.getInterviewerContext(interviewerRole) : '';
    
    const prompt = `
Based on this resume and job description, generate 6 personalized interview questions.

Resume Summary:
- Name: ${resume.name}
- Experience: ${resume.experience.map((exp: unknown) => `${(exp as { position: string; company: string }).position} at ${(exp as { position: string; company: string }).company}`).join(', ')}
- Skills: ${resume.skills.join(', ')}

Job Details:
- Title: ${job.title}
- Company: ${job.company}
- Requirements: ${job.requirements.join(', ')}

${interviewerContext}

Generate questions that:
1. Test technical skills relevant to both resume and job
2. Explore behavioral situations from their experience
3. Assess problem-solving for the specific role
4. Reference specific companies/technologies from their background

Return JSON array:
[
  {
    "id": "string",
    "type": "technical|behavioral|situational",
    "question": "string (specific question referencing their experience)",
    "suggestedAnswer": "string (detailed answer strategy)",
    "tips": ["array of 3-4 specific tips"]
  }
]

Make questions specific to their background at ${resume.experience[0]?.company} and the ${job.title} role.`;

    try {
      const response = await this.callOpenAI(prompt, 2000);
      const cleanResponse = response.trim().replace(/```json\n?|\n?```/g, '');
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('❓ Question generation failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
  static async generatePresentationTopics(
    resume: ResumeData,
    job: JobDescription
  ): Promise<PresentationTopic[]> {
    try {
      const prompt = `Generate 3 presentation topics based on the following resume and job description. 
      For each topic, include a title and 3-5 bullet points.
      
      Resume:
      ${JSON.stringify(resume, null, 2)}
      
      Job Description:
      ${JSON.stringify(job, null, 2)}
      
      Format the response as a valid JSON array of objects with properties: id, title, and bullets (array).
      Example format:
      [
        {
          "id": "topic1",
          "title": "Presentation Title 1",
          "bullets": ["Point 1", "Point 2", "Point 3"]
        }
      ]`;

      const response = await this.callOpenAI(prompt, 1000);
      
      // Clean the response
      const cleanResponse = response
        .replace(/^```(?:json)?\s*|\s*```$/g, '') // Remove code block markers
        .trim();
      
      // Try to parse the response directly first
      try {
        const parsed = JSON.parse(cleanResponse);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = cleanResponse.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('⚠️ Failed to parse extracted JSON:', e instanceof Error ? e.message : 'Parse error');
          }
        }
        console.error('🎤 Presentation generation failed - parsing error:', e instanceof Error ? e.message : 'Parse error');
        throw new AIResponseParseError();
      }
    } catch (error) {
      console.error('🎤 Presentation generation failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Generate strategic questions that candidates can ask interviewers
   * 
   * Creates intelligent questions based on the job description and interviewer role
   * that help candidates demonstrate engagement and gather important information.
   * 
   * @static
   * @async
   * @param {JobDescription} job - The analyzed job description
   * @param {string} [interviewerRole] - The role of the interviewer (recruiter, hiring-manager, tech-lead, peer)
   * @returns {Promise<CandidateQuestion[]>} Array of strategic questions to ask
   */
  static async generateCandidateQuestions(
    job: JobDescription,
    interviewerRole?: string
  ): Promise<CandidateQuestion[]> {
    try {
      const roleContext = interviewerRole ? `
      
Interviewer Role: ${interviewerRole}
Consider the specific perspective and priorities of a ${interviewerRole} when generating questions.
For example:
- Recruiter: Focus on culture, process, growth opportunities
- Hiring Manager: Focus on team dynamics, expectations, success metrics  
- Tech Lead: Focus on technical challenges, architecture, development practices
- Peer: Focus on day-to-day work, collaboration, team culture` : '';

      const prompt = `Generate 5-7 strategic questions that a job candidate can ask during an interview, based on this job description and interviewer role. 

Job Description:
${JSON.stringify(job, null, 2)}
${roleContext}

Create questions that:
1. Show genuine interest and research
2. Help evaluate if the role is a good fit
3. Demonstrate engagement and strategic thinking
4. Are appropriate for the interviewer's role and perspective
5. Avoid questions easily answered by basic research

Format as a valid JSON array with objects containing:
- id: unique identifier
- category: one of "role", "company", "team", "growth", "culture"
- question: the actual question text
- rationale: why this question is strategic (1-2 sentences)
- timing: when to ask ("early", "middle", "end")

Example:
[
  {
    "id": "q1",
    "category": "team",
    "question": "What does success look like in this role during the first 90 days?",
    "rationale": "Shows planning mindset and helps set clear expectations for performance.",
    "timing": "middle"
  }
]

Return only valid JSON without any additional text.`;

      const response = await this.callOpenAI(prompt, 1200);
      
      // Clean the response
      const cleanResponse = response
        .replace(/^```(?:json)?\s*|\s*```$/g, '') // Remove code block markers
        .trim();
      
      // Try to parse the response
      try {
        const parsed = JSON.parse(cleanResponse);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = cleanResponse.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('⚠️ Failed to parse extracted JSON:', e instanceof Error ? e.message : 'Parse error');
          }
        }
        console.error('❓ Candidate questions generation failed - parsing error:', e instanceof Error ? e.message : 'Parse error');
        throw new AIResponseParseError();
      }
    } catch (error) {
      console.error('❓ Candidate questions generation failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private static getInterviewerContext(role: string): string {
    const roleContextMap: Record<string, string> = {
      'recruiter': `
Interviewer Context: This interview will be conducted by a RECRUITER/HR representative.
Focus on:
- Cultural fit and soft skills
- Career motivations and goals
- Behavioral questions (STAR method)
- General technical knowledge (not deep technical details)
- Compensation and benefits discussions
- Team dynamics and collaboration`,

      'hiring-manager': `
Interviewer Context: This interview will be conducted by the HIRING MANAGER.
Focus on:
- Job-specific requirements and expectations
- Past performance and achievements
- Leadership potential and growth mindset
- Project management and delivery capabilities
- Team fit and management style
- Strategic thinking and problem-solving`,

      'tech-lead': `
Interviewer Context: This interview will be conducted by a TECHNICAL LEAD/SENIOR ENGINEER.
Focus on:
- Deep technical knowledge and expertise
- Code quality and best practices
- System design and architecture
- Problem-solving approaches and algorithms
- Technical leadership and mentoring
- Code review and technical communication`,

      'program-manager': `
Interviewer Context: This interview will be conducted by a PROGRAM MANAGER.
Focus on:
- Cross-functional collaboration
- Project planning and execution
- Stakeholder management
- Risk assessment and mitigation
- Process improvement and efficiency
- Communication and coordination skills`,

      'product-manager': `
Interviewer Context: This interview will be conducted by a PRODUCT MANAGER.
Focus on:
- Product thinking and user empathy
- Data-driven decision making
- Feature prioritization and roadmapping
- Customer needs and market understanding
- Cross-functional collaboration
- Technical feasibility and trade-offs`,

      'team-member': `
Interviewer Context: This interview will be conducted by a TEAM MEMBER/PEER.
Focus on:
- Day-to-day collaboration and teamwork
- Technical skills and code quality
- Communication and knowledge sharing
- Problem-solving in team settings
- Pair programming and code reviews
- Team culture and working style`,

      'director': `
Interviewer Context: This interview will be conducted by a DIRECTOR/VP.
Focus on:
- Strategic vision and big-picture thinking
- Leadership potential and scalability
- Business impact and value creation
- Long-term career goals and growth
- Organizational fit and culture alignment
- Executive presence and communication`,

      'cto': `
Interviewer Context: This interview will be conducted by the CTO/CHIEF TECHNOLOGY OFFICER.
Focus on:
- Technical vision and innovation
- Scalability and system thinking
- Technology strategy and decisions
- Technical leadership and influence
- Engineering culture and best practices
- Long-term technical roadmap contribution`,

      'other': `
Interviewer Context: This interview will be conducted by a senior stakeholder.
Focus on:
- Well-rounded assessment of technical and soft skills
- Adaptability and learning agility
- Communication across different audiences
- Problem-solving and critical thinking
- Cultural fit and value alignment
- Growth potential and career aspirations`
    };

    return roleContextMap[role] || '';
  }

  private static getInterviewerFeedbackContext(role: string): string {
    const feedbackContextMap: Record<string, string> = {
      'recruiter': `
As a RECRUITER, when evaluating responses, focus on:
- Cultural fit and alignment with company values
- Communication skills and professionalism
- Enthusiasm and motivation for the role
- Soft skills and interpersonal abilities
- Career goals and long-term fit
- Red flags in behavior or attitude`,

      'hiring-manager': `
As a HIRING MANAGER, when evaluating responses, focus on:
- Practical application of skills to job requirements
- Past performance indicators and achievements
- Problem-solving approach and critical thinking
- Leadership potential and growth mindset
- Ability to meet deadlines and deliver results
- Team collaboration and management style`,

      'tech-lead': `
As a TECHNICAL LEAD, when evaluating responses, focus on:
- Technical depth and accuracy of answers
- Code quality and best practices knowledge
- System design thinking and scalability
- Debugging and problem-solving methodology
- Mentoring and knowledge sharing abilities
- Technical communication and documentation`,

      'program-manager': `
As a PROGRAM MANAGER, when evaluating responses, focus on:
- Cross-functional collaboration examples
- Project planning and execution skills
- Stakeholder management and communication
- Risk identification and mitigation strategies
- Process improvement and efficiency gains
- Metrics and data-driven decision making`,

      'product-manager': `
As a PRODUCT MANAGER, when evaluating responses, focus on:
- User-centric thinking and empathy
- Data analysis and metric interpretation
- Feature prioritization and trade-off decisions
- Market understanding and competitive awareness
- Cross-team collaboration and influence
- Product vision and strategic thinking`,

      'team-member': `
As a TEAM MEMBER, when evaluating responses, focus on:
- Day-to-day collaboration and teamwork
- Code review and peer feedback skills
- Knowledge sharing and mentoring willingness
- Problem-solving in team contexts
- Communication in technical discussions
- Cultural fit within the team dynamics`,

      'director': `
As a DIRECTOR, when evaluating responses, focus on:
- Strategic thinking and big-picture vision
- Leadership impact and influence
- Business acumen and value creation
- Scalability and organizational thinking
- Executive presence and communication
- Long-term potential and career growth`,

      'cto': `
As a CTO, when evaluating responses, focus on:
- Technical vision and innovation thinking
- Architectural decisions and trade-offs
- Technology strategy and future planning
- Engineering leadership and culture building
- Technical risk assessment and mitigation
- Industry trends and technological evolution`,

      'other': `
As a senior stakeholder, when evaluating responses, focus on:
- Well-rounded assessment of capabilities
- Adaptability and continuous learning
- Clear communication across audiences
- Problem-solving methodology and creativity
- Cultural alignment and value demonstration
- Growth potential and career trajectory`
    };

    return feedbackContextMap[role] || '';
  }

  // Fallback mock data methods






  /**
   * Chat with AI for interview preparation guidance
   * This method properly formats requests for the backend API
   */
  static async chatWithInterviewAI(
    prompt: string, 
    resumeText?: string, 
    jobDescription?: string, 
    maxTokens: number = 1000
  ): Promise<string> {
    return this.callInterviewAI(prompt, resumeText, jobDescription, maxTokens);
  }
}
