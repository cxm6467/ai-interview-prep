/**
 * Placeholder Lambda function for initial deployment
 * This will be replaced with the actual backend code during deployment
 */

exports.handler = async (event, context) => {
    console.log('Environment:', '${environment}');
    console.log('Event received:', JSON.stringify(event, null, 2));
    
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: headers,
            body: ''
        };
    }

    // Handle GET request
    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                success: true,
                message: 'AI Interview Prep API - Placeholder',
                environment: '${environment}',
                timestamp: new Date().toISOString()
            })
        };
    }

    // Handle POST request (placeholder for analysis)
    if (event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body || '{}');
            
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Placeholder response - replace with actual backend logic',
                    data: {
                        atsScore: {
                            score: 85,
                            feedback: 'This is a placeholder response',
                            strengths: ['Strong technical background'],
                            improvements: ['Add more specific metrics'],
                            keywordMatches: ['JavaScript', 'React'],
                            missingKeywords: ['AWS', 'Docker']
                        },
                        technicalQuestions: [
                            {
                                question: 'What is your experience with JavaScript?',
                                answer: 'This is a placeholder technical question'
                            }
                        ],
                        behavioralQuestions: [
                            {
                                question: 'Tell me about a challenging project',
                                answer: 'This is a placeholder behavioral question'
                            }
                        ],
                        presentationTopics: [
                            {
                                topic: 'Technical Architecture',
                                keyPoints: ['Scalability', 'Performance', 'Security']
                            }
                        ],
                        candidateQuestions: [
                            'What technologies does the team use?',
                            'What are the growth opportunities?'
                        ],
                        strengths: ['Technical expertise', 'Problem solving'],
                        improvements: ['Communication skills', 'Leadership experience']
                    },
                    cached: false,
                    timestamp: new Date().toISOString()
                })
            };
        } catch (error) {
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid JSON in request body'
                })
            };
        }
    }

    // Method not allowed
    return {
        statusCode: 405,
        headers: headers,
        body: JSON.stringify({
            success: false,
            error: 'Method not allowed'
        })
    };
};