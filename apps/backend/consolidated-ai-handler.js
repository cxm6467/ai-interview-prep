/**
 * Consolidated AI Handler for Interview Prep Application
 * 
 * This function processes all AI analysis in a single request to improve performance
 * and reduce network overhead.
 */

const { OpenAI } = require('openai');

// Initialize OpenAI client
let openai;
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY environment variable is not set');
} else {
  try {
    openai = new OpenAI({
      apiKey: apiKey,
    });
    // OpenAI client initialized successfully
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI client:', error);
  }
}

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Handle OPTIONS requests for CORS preflight
 */
function handleOptions() {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: '',
  };
}

/**
 * Create a structured error response
 */
function createErrorResponse(statusCode, message, details = null) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
      error: {
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    }),
  };
}

/**
 * Create a successful response
 */
function createSuccessResponse(data) {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(data),
  };
}

/**
 * Generate a comprehensive analysis in a single API call
 */
async function generateComprehensiveAnalysis(resumeText, jobDescription) {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  const systemPrompt = `You are an expert career coach and interview preparation specialist. 
  Analyze the following resume and job description to provide a comprehensive interview preparation package.`;

  const analysisPrompt = `
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

  try {
    // Starting comprehensive analysis
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125', // Latest, fastest version
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3, // Lower temperature for faster, more consistent responses
      max_tokens: 3500, // Optimized token limit
      response_format: { type: 'json_object' }
    }, {
      timeout: 90000 // 90 second timeout for OpenAI API call
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from AI model');
    }

    // Parse and validate the response
    const result = JSON.parse(responseText);
    return result;
  } catch (error) {
    console.error('Error in generateComprehensiveAnalysis:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Handle GET requests for health check
 */
function handleHealthCheck() {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.ENVIRONMENT || 'production',
      openai_configured: !!process.env.OPENAI_API_KEY
    })
  };
}

/**
 * Main handler function
 */
exports.handler = async function(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Handle GET requests for health check
  if (event.httpMethod === 'GET') {
    return handleHealthCheck();
  }

  // Only allow POST requests for main functionality
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method Not Allowed');
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (e) {
      return createErrorResponse(400, 'Invalid JSON in request body');
    }

    const { resumeText, jobDescription } = requestBody;

    if (!resumeText || !jobDescription) {
      return createErrorResponse(400, 'Missing required parameters: resumeText and jobDescription are required');
    }

    // Generate comprehensive analysis
    const analysis = await generateComprehensiveAnalysis(resumeText, jobDescription);
    
    return createSuccessResponse({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in handler:', error);
    return createErrorResponse(500, 'Internal Server Error', error.message);
  }
};
