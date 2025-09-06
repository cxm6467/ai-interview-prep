# AI Interview Prep - Backend API

A robust Node.js backend service that powers AI-driven interview preparation with OpenAI integration, comprehensive logging, and AWS Lambda deployment support.

## 🚀 Features

- **AI-Powered Analysis**: OpenAI GPT-4 integration for comprehensive resume and job analysis
- **Structured Data Processing**: Intelligent parsing of resumes and job descriptions
- **ATS Score Calculation**: Advanced compatibility scoring with keyword matching
- **Interview Question Generation**: Technical and behavioral questions tailored to specific roles
- **Multi-Format Support**: PDF parsing and text analysis capabilities
- **AWS Lambda Ready**: Seamless deployment to AWS Lambda with API Gateway
- **Comprehensive Logging**: AWS PowerTools integration with structured logging
- **Health Monitoring**: Built-in health checks and performance metrics
- **CORS Support**: Proper cross-origin resource sharing configuration
- **Error Handling**: Robust error handling with detailed logging

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js for local development
- **Cloud**: AWS Lambda + API Gateway for production
- **AI Integration**: OpenAI GPT-4 API
- **Logging**: AWS PowerTools with CloudWatch integration
- **PDF Processing**: pdf-parse for document analysis
- **Security**: CORS, input validation, environment variable protection
- **Development**: ts-node, nodemon, comprehensive TypeScript setup

## 📁 Project Structure

```
src/
├── lambda/                   # AWS Lambda Entry Points
│   ├── handler.ts           # Main Lambda function handler
│   └── index.ts             # Lambda export configuration
├── local/                   # Local Development
│   ├── server.ts            # Express development server
│   └── gateway-simulator.ts # API Gateway simulation
├── shared/                  # Shared Utilities & Types
│   ├── types/               # TypeScript type definitions
│   │   ├── analysis.ts      # AI analysis type definitions
│   │   ├── server.ts        # Server-related types
│   │   └── index.ts         # Type exports
│   └── utils/               # Utility modules
│       ├── ai-service.ts    # Core AI analysis service
│       ├── ai-prompts.ts    # OpenAI prompt templates
│       ├── openai-client.ts # OpenAI API client
│       ├── response-helpers.ts # HTTP response utilities
│       ├── aws-logger.ts    # AWS PowerTools logger
│       ├── powertools.ts    # PowerTools configuration
│       ├── data-sanitizer.ts # Input sanitization
│       └── constants.ts     # Application constants
├── tsconfig.json            # TypeScript configuration
├── tsconfig.lambda.json     # Lambda-specific TypeScript config
├── package.json             # Dependencies and scripts
├── Dockerfile               # Container configuration
└── docker-compose.yml       # Local development stack
```

## 🚦 Getting Started

### Prerequisites
- Node.js (≥18.0.0)
- npm (≥9.0.0)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Navigate to backend directory**
   ```bash
   cd apps/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
   echo "PORT=8080" >> .env
   echo "ENVIRONMENT=development" >> .env
   echo "LOG_LEVEL=info" >> .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Verify the server is running**
   ```bash
   curl http://localhost:8080/health
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm run start` | Start production server (requires build) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run build:lambda` | Build optimized bundle for AWS Lambda |
| `npm run type-check` | Run TypeScript type checking |
| `npm run clean` | Remove build artifacts |
| `npm run docker:build` | Build Docker image |
| `npm run docker:up` | Start Docker development environment |

## 🔧 Configuration

### Environment Variables

#### Required
```bash
OPENAI_API_KEY=sk-...                    # OpenAI API key (required)
```

#### Optional
```bash
PORT=8080                                # Server port (default: 8080)
ENVIRONMENT=development                  # Environment name
NODE_ENV=development                     # Node.js environment
LOG_LEVEL=info                          # Logging level (debug, info, warn, error)
```

#### AWS Lambda Environment
```bash
AWS_REGION=us-east-1                    # AWS region
AWS_LAMBDA_FUNCTION_NAME=ai-interview-prep # Lambda function name
```

### OpenAI Configuration

The service uses GPT-4 with optimized settings:

```typescript
const OPENAI_CONFIG = {
  MODEL: 'gpt-4-turbo-preview',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 4000,
  TIMEOUT: 60000, // 60 seconds
};
```

## 🌐 API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "openai_configured": true
}
```

### AI Analysis
```http
POST /
Content-Type: application/json

{
  "resumeText": "John Doe\nSoftware Engineer...",
  "jobDescription": "We are seeking a Senior Developer..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "atsScore": {
      "score": 85,
      "feedback": "Strong technical alignment...",
      "strengths": ["React experience", "TypeScript skills"],
      "improvements": ["Add cloud experience"],
      "keywordMatches": ["React", "TypeScript", "JavaScript"],
      "missingKeywords": ["AWS", "Docker"]
    },
    "technicalQuestions": [
      {
        "question": "Explain React hooks and their benefits",
        "answer": "React hooks allow functional components..."
      }
    ],
    "behavioralQuestions": [
      {
        "question": "Tell me about a challenging project",
        "answer": "Use the STAR method to structure..."
      }
    ],
    "presentationTopics": [
      {
        "topic": "Modern React Development",
        "keyPoints": ["Hooks", "Context", "Performance"]
      }
    ],
    "candidateQuestions": [
      "What does success look like in this role?",
      "How does the team handle code reviews?"
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### CORS Preflight
```http
OPTIONS /
```

## 🧠 AI Service Architecture

### Core Service (`ai-service.ts`)

The main AI integration service handles:

1. **OpenAI Client Management**: Secure API key handling and client initialization
2. **Prompt Engineering**: Structured prompts for consistent AI responses
3. **Response Processing**: JSON parsing and validation of AI responses
4. **Error Handling**: Comprehensive error catching and logging
5. **Performance Monitoring**: Request timing and token usage tracking

### AI Analysis Flow

```typescript
// 1. Input Validation
const requestBody = parseRequestBody(event.body, requestId);

// 2. AI Service Call
const analysis = await generateComprehensiveAnalysis(
  resumeText, 
  jobDescription
);

// 3. Response Formatting
const response = createSuccessResponse({
  success: true,
  data: analysis,
  timestamp: new Date().toISOString()
});
```

### Prompt Engineering

The service uses carefully crafted prompts for different analysis types:

```typescript
export const SYSTEM_PROMPT = `You are an expert career coach and technical interviewer...`;

export const createAnalysisPrompt = (resume: string, job: string) => `
Analyze this resume against the job description and provide:
1. ATS compatibility score (0-100)
2. Technical interview questions
3. Behavioral interview questions
4. Presentation topics
5. Strategic questions for the candidate to ask
...
`;
```

## 🛡️ Security & Error Handling

### Input Validation
- Request body validation and sanitization
- File size limits for PDF uploads
- Content-Type validation
- SQL injection prevention

### Error Handling Strategy
1. **Graceful Degradation**: Service continues operating with fallback responses
2. **Detailed Logging**: Comprehensive error logging with context
3. **User-Friendly Messages**: Clean error responses without sensitive data
4. **Retry Logic**: Automatic retries for transient failures

### Security Headers
```typescript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};
```

## 📊 Logging & Monitoring

### AWS PowerTools Integration

```typescript
const powertools = createPowertools({
  serviceName: 'ai-interview-prep',
  environment: process.env.NODE_ENV || 'development',
  enableTracing: true,
  enableMetrics: true,
  enableSanitization: true,
});
```

### Structured Logging

The service provides comprehensive logging with categorized log levels:

```typescript
logger.ai('AI analysis started', { 
  resumeLength: resumeText.length,
  jobDescriptionLength: jobDescription.length 
});

logger.performance('OpenAI API request completed', {
  duration: '2.5s',
  tokens: 1500
});

logger.success('Analysis completed successfully', {
  atsScore: 85,
  questionsGenerated: 12
});
```

### Log Categories
- **🤖 AI Operations**: AI model interactions and responses
- **📈 Performance**: Timing and performance metrics
- **🔐 Security**: Authentication and authorization events
- **🌐 Network**: API calls and external service interactions
- **⚠️ Warnings**: Non-critical issues requiring attention
- **❌ Errors**: Critical errors requiring immediate attention

## 🚀 Deployment

### AWS Lambda Deployment

1. **Build for Lambda**
   ```bash
   npm run build:lambda
   ```

2. **Package deployment**
   ```bash
   # Zip the dist directory
   cd dist && zip -r ../deployment.zip .
   ```

3. **Deploy to AWS**
   ```bash
   aws lambda update-function-code \
     --function-name ai-interview-prep \
     --zip-file fileb://deployment.zip
   ```

### Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run container
docker run -p 8080:8080 \
  -e OPENAI_API_KEY=your-key \
  ai-interview-prep-backend
```

### Environment-Specific Builds

```typescript
// Development: Full logging and debugging
if (process.env.NODE_ENV === 'development') {
  logger.setLevel('debug');
}

// Production: Optimized performance
if (process.env.NODE_ENV === 'production') {
  logger.setLevel('warn');
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:8080/health

# Test analysis endpoint
curl -X POST http://localhost:8080/ \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"test","jobDescription":"test"}'
```

## 🔍 Development

### Local Development with Hot Reload
```bash
npm run dev
# Server restarts automatically on file changes
```

### Debug Mode
```bash
DEBUG=ai-interview-prep:* npm run dev
```

### TypeScript Development
- Strict type checking enabled
- Comprehensive type definitions
- IDE integration with IntelliSense

### Code Quality Tools
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Husky**: Pre-commit hooks for quality control

## 📚 API Documentation

### Request/Response Types

```typescript
interface RequestBody {
  resumeText: string;
  jobDescription: string;
}

interface AnalysisResult {
  atsScore: ATSScore;
  technicalQuestions: InterviewQuestion[];
  behavioralQuestions: InterviewQuestion[];
  presentationTopics: PresentationTopic[];
  candidateQuestions: string[];
  strengths: string[];
  improvements: string[];
}
```

### Error Response Format
```json
{
  "error": {
    "message": "Invalid request body",
    "details": "Missing required field: resumeText",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add comprehensive error handling
3. Include detailed logging for debugging
4. Write tests for new functionality
5. Update documentation for API changes

---

**Ready to power amazing interview experiences! 🚀**