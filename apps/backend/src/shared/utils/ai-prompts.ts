/**
 * AI prompt templates for interview analysis
 * 
 * This module contains OpenAI prompt templates and generation functions
 * for creating comprehensive interview preparation analysis.
 */

/**
 * System prompt for the AI assistant
 * 
 * @constant {string} SYSTEM_PROMPT
 * @description Defines the AI assistant's role and expertise for interview analysis.
 * This prompt establishes the context and expected behavior for all AI interactions.
 */
export const SYSTEM_PROMPT = `You are an expert career coach and interview preparation specialist. 
Analyze the following resume and job description to provide a comprehensive interview preparation package.`;

/**
 * Generate comprehensive analysis prompt template
 * 
 * @function createAnalysisPrompt
 * @description Creates a detailed prompt for OpenAI that includes the resume text,
 * job description, and specific instructions for generating interview preparation materials.
 * The prompt is optimized to produce structured JSON output with all required analysis components.
 * 
 * @param {string} resumeText - The candidate's resume content as plain text
 * @param {string} jobDescription - The target job description as plain text
 * @returns {string} Formatted prompt string ready for OpenAI API
 * 
 * @example
 * ```typescript
 * const prompt = createAnalysisPrompt(
 *   "John Doe\\nSoftware Engineer\\n...",
 *   "Senior Developer role requiring React..."
 * );
 * 
 * const completion = await openai.chat.completions.create({
 *   messages: [
 *     { role: 'system', content: SYSTEM_PROMPT },
 *     { role: 'user', content: prompt }
 *   ]
 * });
 * ```
 */
export function createAnalysisPrompt(resumeText: string, jobDescription: string): string {
  return `
RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please provide a comprehensive analysis including:
1. ATS Score (0-100) and detailed feedback with keyword matching analysis
2. Top 10 technical interview questions with answers
3. Top 5 behavioral interview questions with sample answers
4. 3 presentation topics with key points
5. 5 strategic questions for the candidate to ask
6. Key strengths and areas for improvement

For the ATS analysis, perform detailed keyword matching between the resume and job description:
- Extract all technical skills, tools, frameworks, and relevant keywords from both documents
- keywordMatches: keywords/skills found in BOTH the resume and job description
- missingKeywords: keywords/skills found in the JOB DESCRIPTION but NOT in the resume (these are what the candidate should add to improve their resume)
- Consider variations and synonyms (e.g., "React.js" vs "ReactJS", "JavaScript" vs "JS")

Format your response as a JSON object with these keys:
{
  "atsScore": {
    "score": number,
    "feedback": string,
    "strengths": string[],
    "improvements": string[],
    "keywordMatches": string[],
    "missingKeywords": string[]
  },
  "technicalQuestions": Array<{ question: string, answer: string }>,
  "behavioralQuestions": Array<{ question: string, answer: string }>,
  "presentationTopics": Array<{ topic: string, keyPoints: string[] }>,
  "candidateQuestions": string[],
  "strengths": string[],
  "improvements": string[]
}`;
}