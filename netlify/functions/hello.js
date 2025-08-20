/**
 * Netlify Function: Hello
 * 
 * A simple health check endpoint for testing function deployment
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Return health check response
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      message: 'Hello from Netlify Functions! 👋',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      function: 'hello',
      status: 'healthy',
    }),
  };
};