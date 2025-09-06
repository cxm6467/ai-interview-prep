# AI Interview Prep - Frontend

A modern React application for AI-powered interview preparation with comprehensive resume analysis and question generation.

## 🚀 Features

- **Resume Upload & Analysis**: Drag-and-drop PDF resume parsing
- **Job Description Analysis**: Intelligent job requirement extraction
- **ATS Score Visualization**: Interactive scoring with detailed feedback
- **Interview Questions**: Technical and behavioral question generation
- **Interactive Chat**: AI-powered interview simulation
- **Responsive Design**: Works across all device sizes
- **Theme Support**: Dark/light mode with system preference detection
- **Export Functionality**: Save and share interview materials

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: CSS Modules with modern CSS features
- **State Management**: Zustand for lightweight state management
- **PDF Processing**: PDF.js for client-side PDF parsing
- **Speech Synthesis**: Browser Web Speech API integration
- **Icons**: React Icons with comprehensive icon sets
- **Development**: ESLint, Prettier, and TypeScript for code quality

## 📁 Project Structure

```
src/
├── components/           # UI Components (Atomic Design)
│   ├── atoms/           # Basic UI elements
│   │   ├── Button/      # Reusable button component
│   │   ├── Card/        # Card container component
│   │   ├── Toast/       # Notification component
│   │   └── ...          # Other atomic components
│   ├── molecules/       # Component combinations
│   │   ├── FileUpload/  # File upload with drag-and-drop
│   │   ├── DadJoke/     # Entertainment component
│   │   └── ...          # Other molecule components
│   └── organisms/       # Complex component sections
│       ├── InterviewChat/ # Main interview interface
│       ├── ToastManager/ # Global notification system
│       └── ...          # Other organism components
├── services/            # Business Logic & API
│   ├── aiAnalysis.ts    # AI service integration
│   ├── dadJokeService.ts # Entertainment service
│   └── documentParser.ts # PDF parsing service
├── hooks/               # Custom React Hooks
│   ├── useToast.ts      # Toast notification hook
│   ├── useTextToSpeech.ts # Speech synthesis hook
│   └── useScrollFix.ts  # Scroll behavior hook
├── utils/               # Helper Functions
│   ├── logger.ts        # Frontend logging utility
│   ├── validation.ts    # Form validation helpers
│   ├── formatting.ts    # Text formatting utilities
│   └── ...              # Other utility modules
├── types/               # TypeScript Definitions
│   ├── index.ts         # Main type definitions
│   └── pdfjs*.d.ts      # PDF.js type declarations
├── store/               # State Management
│   └── appStore.ts      # Zustand global store
├── constants/           # Application Constants
│   └── routes.ts        # Route definitions
└── styles/              # Global Styles
    ├── components.css   # Component-specific styles
    └── index.css        # Global application styles
```

## 🚦 Getting Started

### Prerequisites
- Node.js (≥18.0.0)
- npm (≥9.0.0)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd apps/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Create .env.local file
   echo "VITE_API_URL=http://localhost:8080" > .env.local
   echo "VITE_LOG_LEVEL=info" >> .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Development: http://localhost:5173
   - Network: http://[your-ip]:5173

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run type-check` | Run TypeScript type checking |

## 🎨 Component Architecture

### Atomic Design Pattern

The application follows atomic design principles for maintainable and reusable components:

#### Atoms
Basic building blocks that can't be broken down further:
- `Button`: Configurable button with variants (primary, secondary, danger)
- `Card`: Container with consistent styling and optional headers
- `Text`: Typography component with size and weight variants
- `Toast`: Notification message with different types (success, error, info)

#### Molecules
Simple groups of UI elements functioning together:
- `FileUpload`: Drag-and-drop file upload with validation
- `SessionInspector`: Development tool for debugging app state
- `DadJoke`: Entertainment component for user engagement

#### Organisms
Complex UI sections composed of groups of molecules:
- `InterviewChat`: Main interview interface with AI interaction
- `ToastManager`: Global notification system with queuing
- `Footer`: Application footer with links and information

### Component Guidelines

1. **TypeScript First**: All components use TypeScript with proper interfaces
2. **CSS Modules**: Scoped styling with `.module.css` files
3. **Props Interface**: Clear prop definitions with JSDoc comments
4. **Error Boundaries**: Graceful error handling in complex components
5. **Accessibility**: ARIA labels and keyboard navigation support

## 🔧 Development

### Environment Variables

```bash
# API Configuration
VITE_API_URL=http://localhost:8080        # Backend API URL
VITE_LOG_LEVEL=info                       # Logging level (debug, info, warn, error)

# Feature Flags
VITE_ENABLE_DEBUG_MODE=false              # Enable debug features
VITE_ENABLE_SPEECH=true                   # Enable text-to-speech features
```

### Logging

The application uses a comprehensive logging system with emoji indicators:

```typescript
import { logger } from '../utils/logger';

// Different log levels with visual indicators
logger.debug('🔍 Debug information');
logger.info('📝 General information');
logger.success('✅ Success message');
logger.warn('⚠️ Warning message');
logger.error('❌ Error message');
logger.api('🌐 API call information');
logger.user('👤 User interaction');
logger.performance('⚡ Performance metrics');
```

### State Management

Using Zustand for lightweight state management:

```typescript
import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  analysisData: AnalysisResult | null;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAnalysisData: (data: AnalysisResult) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  analysisData: null,
  setTheme: (theme) => set({ theme }),
  setAnalysisData: (analysisData) => set({ analysisData }),
}));
```

### Custom Hooks

#### useToast
```typescript
const { showToast } = useToast();
showToast('Analysis completed!', 'success');
```

#### useTextToSpeech
```typescript
const { speak, isSupported } = useTextToSpeech();
if (isSupported) {
  speak('Hello! Ready for your interview?');
}
```

## 🎯 API Integration

### AI Analysis Service

The frontend communicates with the backend through a centralized service:

```typescript
import { AIAnalysisService } from '../services/aiAnalysis';

// Consolidated analysis (recommended)
const result = await AIAnalysisService.performConsolidatedAnalysis(
  resumeText,
  jobDescription
);

// Individual operations
const resume = await AIAnalysisService.analyzeResume(resumeText);
const atsScore = await AIAnalysisService.calculateATSScore(resume, job);
```

### Error Handling

Comprehensive error handling with user-friendly messages:

```typescript
try {
  const analysis = await AIAnalysisService.performConsolidatedAnalysis(
    resumeText, 
    jobDescription
  );
  showToast('Analysis completed successfully!', 'success');
} catch (error) {
  logger.error('Analysis failed', { error: error.message });
  showToast('Analysis failed. Please try again.', 'error');
}
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

CSS custom properties for consistent theming:

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
}
```

## 🧪 Testing

### Component Testing
```bash
# Run component tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Testing Utilities
- **React Testing Library**: Component testing
- **Vitest**: Fast unit testing framework
- **MSW**: API mocking for integration tests

## 🚀 Building for Production

### Development Build
```bash
npm run build
```

This creates an optimized build in the `dist/` directory with:
- Minified JavaScript and CSS
- Optimized images and assets
- Tree-shaking for smaller bundle size
- Source maps for debugging

### Production Deployment
```bash
# Preview production build locally
npm run preview

# Build and deploy to S3 + CloudFront (via CI/CD)
npm run build
aws s3 sync dist/ s3://your-bucket-name/
```

## 🔍 Debugging

### Debug Mode
Enable debug features by adding `?debug=true` to the URL or setting localStorage:
```javascript
localStorage.setItem('debugMode', 'true');
```

### Performance Monitoring
Monitor performance with the built-in logger:
```typescript
logger.performance('Component render time', { duration: 150 });
logger.api('API call completed', { endpoint: '/analyze', duration: 2500 });
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add TypeScript interfaces for new props
3. Include CSS modules for component styling
4. Add proper error handling and logging
5. Update tests for new functionality

---

**Happy coding! 🎉**# Build trigger: Sat Aug 30 07:32:45 AM EDT 2025
# Clean deployment trigger: Sat Aug 30 03:02:59 PM EDT 2025
