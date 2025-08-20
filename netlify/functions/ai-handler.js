/**
 * Netlify Function: AI Handler
 * 
 * This function serves as a proxy to OpenAI's API, handling all AI-related requests
 * for the interview preparation application.
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
    console.log('✅ OpenAI client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI client:', error);
  }
}

/**
 * CORS headers for cross-origin requests
 */
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
 * Call OpenAI API with error handling and retries
 */
async function callOpenAI(prompt, maxTokens = 1200, temperature = 0.3) {
  if (!openai) {
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable in your Netlify site settings.');
    } else {
      throw new Error('OpenAI client not initialized. Please check your API key configuration.');
    }
  }

  try {
    console.log('🚀 Calling OpenAI API...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125', // Latest, fastest version
      messages: [
        {
          role: 'system',
          content: 'You are a professional career coach and interview expert. Provide helpful, accurate, and actionable advice.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response received from OpenAI');
    }

    console.log('✅ OpenAI API call successful');
    return response;
  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    
    if (error.status === 429) {
      throw new Error('API rate limit exceeded. Please try again in a moment.');
    } else if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI configuration.');
    } else if (error.status >= 500) {
      throw new Error('OpenAI service temporarily unavailable. Please try again later.');
    } else {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}

/**
 * Main handler function
 */
exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed. Only POST requests are supported.');
  }

  try {
    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return createErrorResponse(400, 'Invalid JSON in request body');
    }

    const { prompt, type, maxTokens, temperature } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return createErrorResponse(400, 'Missing or invalid prompt field');
    }

    if (!type || typeof type !== 'string') {
      return createErrorResponse(400, 'Missing or invalid type field');
    }

    console.log(`📝 Processing ${type} request`);

    // Call OpenAI API
    const aiResponse = await callOpenAI(
      prompt,
      maxTokens || 1500,
      temperature || 0.7
    );

    // Return successful response
    return createSuccessResponse({
      response: aiResponse,
      type,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('💥 Handler error:', error);
    
    // Handle specific error types
    if (error.message.includes('API key')) {
      return createErrorResponse(401, 'Authentication failed', error.message);
    } else if (error.message.includes('rate limit')) {
      return createErrorResponse(429, 'Rate limit exceeded', error.message);
    } else if (error.message.includes('temporarily unavailable')) {
      return createErrorResponse(503, 'Service temporarily unavailable', error.message);
    } else {
      return createErrorResponse(500, 'Internal server error', error.message);
    }
  }
};