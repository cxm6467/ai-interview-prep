# AI Interview Preparation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.5.4-blue)](https://www.typescriptlang.org/)
[![Deploy to Dev](https://github.com/cxm6467/ai-interview-prep/actions/workflows/deploy-dev.yml/badge.svg)](https://github.com/cxm6467/ai-interview-prep/actions/workflows/deploy-dev.yml)
[![Deploy to Prod](https://github.com/cxm6467/ai-interview-prep/actions/workflows/deploy-prod.yml/badge.svg)](https://github.com/cxm6467/ai-interview-prep/actions/workflows/deploy-prod.yml)

A comprehensive AI-powered platform that helps job seekers prepare for technical interviews by analyzing resumes against job descriptions and generating personalized interview materials.

## 📚 Table of Contents

- [🚀 Features](#-features)
- [🏛️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚦 Getting Started](#-getting-started)
- [🚀 Quick Deploy to AWS](#-quick-deploy-to-aws)
- [📁 Project Structure](#-project-structure)
- [🔧 Development](#-development)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [📊 Performance Monitoring](#-performance-monitoring)
- [🔐 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📞 Support](#-support)

## 🚀 Features

### Core Functionality
- **Resume Analysis**: Parse and extract structured data from PDF/text resumes
- **Job Description Analysis**: Intelligent parsing of job requirements and responsibilities
- **ATS Score Calculation**: Comprehensive compatibility scoring with keyword matching
- **Interview Question Generation**: 
  - Technical questions tailored to specific roles
  - Behavioral questions based on experience
  - Strategic questions for candidates to ask interviewers
- **Presentation Topic Generation**: Role-specific presentation topics with key points
- **Interactive Interview Coaching**: AI-powered real-time chat with multiple interviewer perspectives
- **Dedicated Chat API**: Specialized Lambda function for interview conversation handling

### Advanced Features
- **Multi-Role Interviewer Simulation**: Different perspectives (recruiter, hiring manager, tech lead, etc.)
- **Real-time Analysis**: Fast processing with comprehensive feedback
- **Export Capabilities**: Save and share interview preparation materials
- **Responsive Design**: Works across desktop, tablet, and mobile devices
- **Multi-Theme Support**: Dark mode (default), light, and multiple color schemes with proper z-index layering
- **Developer Debug Panel**: Comprehensive development tools for monitoring API calls, application state, and cache performance
- **Interview Chat System**: Real-time AI-powered interview coaching with conversation history
- **PII Protection**: Comprehensive personally identifiable information detection and scrubbing before analysis
- **Secure Caching**: Intelligent caching system that only stores PII-scrubbed, safe data for improved performance
- **File Upload Caching**: Smart file parsing cache to avoid re-processing identical documents
- **PII Audit Trail**: Development monitoring of PII detection without exposing sensitive content

## 🏛️ Architecture

### Frontend (`apps/frontend`)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: CSS Custom Properties + Modern CSS theming system
- **State Management**: Zustand with persistent storage
- **UI Components**: Atomic design pattern (atoms, molecules, organisms)
- **File Processing**: PDF.js for resume parsing
- **Speech Features**: Text-to-speech integration
- **Developer Tools**: Real-time API monitoring, interactive JSON viewer, cache analytics
- **Path Aliases**: Organized imports using TypeScript and Vite path mapping for better code maintainability
- **Type Safety**: Comprehensive TypeScript integration with shared type definitions via `@cxm6467/ai-interview-prep-types@1.5.4`

### Backend (`apps/backend`)
- **Runtime**: Node.js + TypeScript
- **API Framework**: Express.js (local development)
- **Cloud**: AWS Lambda + API Gateway (production)
- **AI Integration**: OpenAI GPT-4 with structured prompts
- **Chat Service**: Dedicated Lambda function for real-time interview coaching (port 8081)
- **Shared Layers**: OpenAI client layer for code reuse across Lambda functions
- **Logging**: AWS PowerTools with comprehensive tracing
- **Security**: CORS enabled, input validation, error handling, comprehensive PII detection and removal
- **Caching**: Secure in-memory cache for PII-scrubbed analysis results with intelligent TTL management
- **Path Aliases**: Organized imports using TypeScript path mapping for better code maintainability
- **Type Safety**: Shared type definitions ensure consistency between frontend and backend

### Infrastructure (`iac/`)
- **IaC**: Terraform for AWS resource management
- **CDN**: CloudFront for global content delivery
- **Storage**: S3 for static assets
- **Monitoring**: CloudWatch for logs and metrics
- **CI/CD**: GitHub Actions for automated deployments

[↑ Back to Top](#-table-of-contents)

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, TypeScript, Vite, CSS Custom Properties, PDF.js |
| **Backend** | Node.js, Express, AWS Lambda, API Gateway, Chat Lambda, Lambda Layers |
| **AI/ML** | OpenAI GPT-4, Custom prompting system |
| **Database** | Stateless architecture with localStorage caching |
| **Infrastructure** | AWS, Terraform, CloudFront, S3 |
| **DevOps** | Docker, GitHub Actions, ESLint, Prettier |
| **Monitoring** | AWS PowerTools, CloudWatch, DevPanel (dev) |
| **Developer Tools** | Interactive JSON viewer, API monitoring, State inspection, Chat API, Cache monitoring, File cache tracking, PII audit trail |
| **Security** | PII detection/scrubbing, secure caching, input validation, graceful error handling |

## 🔄 Improvements & Future Work

For the latest updates, feature requests, and planned improvements, see our [GitHub Issues](https://github.com/cxm6467/ai-interview-prep/issues).

[↑ Back to Top](#-table-of-contents)

## 🚦 Getting Started

### Prerequisites
- Node.js (≥18.0.0)
- npm (≥9.0.0)
- OpenAI API key
- AWS CLI (for production deployment)
- Terraform (for infrastructure management)

## 🚀 Quick Deploy to AWS

### One-Click Deployment
- **[🧪 Deploy to Dev Environment](../../actions/workflows/deploy-dev.yml)** - Click "Run workflow"
- **[🏭 Deploy to Production](../../actions/workflows/deploy-prod.yml)** - Click "Run workflow"

### Auto-Deploy on Push
- Push to `develop` branch → Automatically deploys to dev environment
- Push to `main` branch → Automatically deploys to production environment

> **Prerequisites**: Set GitHub secrets `AWS_ROLE_ARN` and `OPENAI_API_KEY`  
> **Full Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup instructions

### Quick Start (Local Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/cxm6467/ai-interview-prep.git
   cd ai-interview-prep
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create environment files in apps/backend/
   echo "OPENAI_API_KEY=your-openai-api-key-here" > apps/backend/.env
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Start backend (includes both main and chat services)
   npm run dev:backend
   
   # Terminal 2: Start frontend
   npm run dev:frontend
   ```

   **Alternative: Start services individually**
   ```bash
   # Terminal 1: Start main backend only
   cd apps/backend && npm run dev
   
   # Terminal 2: Start chat backend only
   cd apps/backend && npm run dev:chat
   
   # Terminal 3: Start frontend
   npm run dev:frontend
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Main Backend API: http://localhost:8080
   - Chat Backend API: http://localhost:8081/chat
   - Health Checks: http://localhost:8080/health & http://localhost:8081/health

[↑ Back to Top](#-table-of-contents)

## 📁 Project Structure

```
ai-interview-prep/
├── apps/
│   ├── frontend/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/    # UI components (atoms, molecules, organisms)
│   │   │   ├── services/      # API and business logic
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── utils/         # Helper functions
│   │   │   └── types/         # TypeScript type definitions
│   │   └── package.json
│   └── backend/               # Node.js backend API
│       ├── src/
│       │   ├── lambda/        # AWS Lambda handlers
│       │   ├── local/         # Local development server
│       │   ├── shared/        # Shared utilities and types
│       │   └── layers/        # Lambda layers (OpenAI client)
│       └── package.json
├── iac/                       # Terraform infrastructure code
│   ├── modules/               # Reusable Terraform modules
│   └── environments/         # Environment-specific configurations
├── package.json              # Monorepo package configuration
└── README.md
```

[↑ Back to Top](#-table-of-contents)

## 🔧 Development

### Path Aliases

The project uses TypeScript and Vite path aliases for cleaner imports and better code organization:

```typescript
// Available aliases in frontend:
import { Button } from '@atoms';           // src/components/atoms
import { FileUpload } from '@molecules';   // src/components/molecules
import { Footer } from '@organisms';       // src/components/organisms
import { CacheModal } from '@common';      // src/components/common
import { DevPanel } from '@debug';         // src/components/debug
import { aiService } from '@services';     // src/services
import { useAppStore } from '@store';      // src/store
import { MyComponent } from '@types';      // src/types
import { formatDate } from '@utils';       // src/utils
import { useCustomHook } from '@hooks';    // src/hooks
import { theme } from '@styles';           // src/styles
import { API_ROUTES } from '@constants';   // src/constants

// Root alias for any src/ path:
import { Component } from '@/components/custom/Component';
```

**Configuration Files:**
- `vite.config.ts` - Vite build-time alias resolution
- `tsconfig.app.json` - TypeScript compile-time alias resolution

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:frontend` | Start frontend development server |
| `npm run dev:backend` | Start backend development server |
| `cd apps/backend && npm run dev:chat` | Start chat backend server (port 8081) |
| `npm run build` | Build both frontend and backend for production |
| `npm run build:frontend` | Build frontend only |
| `npm run build:backend` | Build backend only |
| `npm run build:lambda` | Build backend for AWS Lambda deployment |
| `npm run lint` | Run ESLint on frontend code |
| `npm run lint:fix` | Fix auto-fixable ESLint issues |
| `npm run type-check` | Run TypeScript type checking |

### Local Development Setup

1. **Backend Development**
   ```bash
   cd apps/backend
   npm run dev  # Runs on http://localhost:8080
   ```

2. **Frontend Development**
   ```bash
   cd apps/frontend
   npm run dev  # Runs on http://localhost:5173
   ```

3. **Docker Development**
   ```bash
   cd apps/backend
   docker-compose up -d
   ```

### Environment Variables

#### Backend Environment Variables
```bash
# Required
OPENAI_API_KEY=your-openai-api-key

# Optional
PORT=8080
ENVIRONMENT=development
NODE_ENV=development
LOG_LEVEL=info
```

#### Frontend Environment Variables
```bash
# Optional
VITE_API_URL=http://localhost:8080
VITE_LOG_LEVEL=info
VITE_ENABLE_DEBUG_PANEL=true  # Enables developer debug panel
VITE_ENABLE_CONSOLE_LOGS=true  # Enables console logging
```

### Developer Debug Panel

The application includes a comprehensive debug panel for development that provides:

- **Application State Monitoring**: Real-time view of Zustand store state with expandable JSON viewer
- **API Call Tracking**: Live monitoring of all HTTP requests with full request/response details
- **Dad Joke Cache Analytics**: Visibility into joke caching system with usage statistics
- **Interactive JSON Viewer**: Syntax-highlighted, collapsible JSON exploration with fullscreen mode
- **Theme Consistency**: Automatically matches the application's current theme

**Access**: Click the 🔧 wrench icon in the top-right corner (development mode only)

**Features**:
- **State Tab**: Current application state with readable formatting
- **API Calls Tab**: HTTP request monitoring with method-specific details (GET requests show responses, POST requests show full request/response cycle)
- **Environment Tab**: Current environment variables and configuration

[↑ Back to Top](#-table-of-contents)

## 🚀 Deployment

### Production Deployment with Terraform

1. **Initialize Terraform**
   ```bash
   cd iac/environments/dev
   terraform init
   ```

2. **Configure variables**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Deploy infrastructure**
   ```bash
   terraform plan
   terraform apply
   ```

4. **Deploy application**
   ```bash
   # Build and deploy backend
   npm run build:lambda
   # Upload to AWS Lambda (automated in CI/CD)
   
   # Build and deploy frontend
   npm run build:frontend
   # Upload to S3 + CloudFront (automated in CI/CD)
   ```

### Manual Deployment

1. **Build applications**
   ```bash
   npm run build
   ```

2. **Deploy backend to AWS Lambda**
   - Package the `apps/backend/dist` directory
   - Upload to AWS Lambda function
   - Configure environment variables

3. **Deploy frontend to S3 + CloudFront**
   - Upload `apps/frontend/dist` to S3 bucket
   - Invalidate CloudFront cache

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
cd apps/frontend
npm test

# Backend tests
cd apps/backend
npm test

# Integration tests
npm run test:integration
```

### Test Structure
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user flow testing

## 📊 Performance Monitoring

### Logging Levels
- **DEBUG**: Development debugging information
- **INFO**: General application flow
- **WARN**: Warning conditions
- **ERROR**: Error conditions requiring attention

### Metrics Tracked
- API response times
- AI model inference duration
- Error rates and types
- User interaction patterns

## 🔐 Security

- **Input Validation**: Comprehensive validation on all user inputs
- **CORS Configuration**: Properly configured cross-origin requests
- **API Key Protection**: Secure handling of OpenAI API keys
- **Error Handling**: Safe error responses without sensitive data exposure
- **Content Security**: PDF parsing with security considerations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

### Coding Standards
- Use TypeScript for all new code
- Follow existing code style and patterns
- Add comprehensive documentation
- Include tests for new functionality
- Use conventional commit messages

[↑ Back to Top](#-table-of-contents)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT-4 API
- **AWS** for cloud infrastructure services
- **React** and **TypeScript** communities for excellent tooling
- **Terraform** for infrastructure as code capabilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/cxm6467/ai-interview-prep/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cxm6467/ai-interview-prep/discussions)
- **Documentation**: [Wiki](https://github.com/cxm6467/ai-interview-prep/wiki)

---

**Made with ❤️ for job seekers preparing for their next career opportunity**

[![AI-Assisted](https://img.shields.io/badge/AI%20Assisted-Claude%20by%20Anthropic-blue)](https://www.anthropic.com)
