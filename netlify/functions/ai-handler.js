const OpenAI = require('openai');

console.log('Netlify function starting...');
console.log('Environment variables:', {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  nodeEnv: process.env.NODE_ENV
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async function(event, context) {
  console.log('Received event:', {
    httpMethod: event.httpMethod,
    path: event.path,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : null
  });

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    const error = 'Method Not Allowed';
    console.error('Method not allowed:', event.httpMethod);
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
    console.log('Parsed request body:', requestBody);
    
    const { messages, maxTokens = 1000 } = requestBody;
    
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    console.log('Calling OpenAI API with messages:', messages);
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: maxTokens,
      temperature: 0.7
    });

    console.log('OpenAI response received');
    const result = {
      content: response.choices[0]?.message?.content || ''
    };
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in Netlify Function:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      status: error.status,
      code: error.code
    });
    
    return {
      statusCode: error.status || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        type: error.type || 'server_error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
