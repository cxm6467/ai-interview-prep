const OpenAI = require('openai');

console.log('🚀 AI Handler starting up...');
console.log('🔑 Environment check:', {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  nodeEnv: process.env.NODE_ENV
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function(event, context) {
  console.log('📨 Incoming request:', event.httpMethod, event.path);

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    const error = 'Method Not Allowed';
    console.error('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error })
    };
  }

  try {
    if (!event.body) {
      throw new Error('Request body is missing');
    }

    const requestBody = JSON.parse(event.body);
    const { messages, maxTokens = 1000 } = requestBody;
    
    console.log('📋 Processing request with', messages?.length || 0, 'messages');
    
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    console.log('🤖 Asking OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: maxTokens,
      temperature: 0.7
    });

    console.log('✨ OpenAI responded successfully!');
    const result = {
      content: response.choices[0]?.message?.content || ''
    };
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('💥 Function error:', error.message);
    
    return {
      statusCode: error.status || 500,
      headers: headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        type: error.type || 'server_error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
