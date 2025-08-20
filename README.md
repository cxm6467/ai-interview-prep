# 🤖 AI Interview Prep

[![Netlify Status](https://api.netlify.com/api/v1/badges/64b333c8-ddd1-478b-92e4-67bbbfce8083/deploy-status)](https://app.netlify.com/projects/stellular-dasik-f643d9/deploys)

A comprehensive AI-powered interview preparation application that transforms job interview prep with intelligent analysis, personalized coaching, and interactive practice sessions. Built with React, TypeScript, and OpenAI GPT for modern job seekers.

## ✨ Features

### 🎯 Intelligent Interview Coaching
- **AI Interview Coach** - Practice with an AI that adapts to 8+ different interviewer roles (Technical Lead, Hiring Manager, Recruiter, Program Manager, etc.)
- **Personalized Questions** - AI generates interview questions based on your specific resume and target job description
- **Real-time Feedback** - Get instant, role-specific suggestions to improve your answers
- **Interactive Chat Interface** - Natural conversation flow with typing indicators and smooth UX

### 📊 Advanced ATS & Skills Analysis
- **Smart ATS Score Calculation** - Advanced algorithm analyzes how well your resume matches job requirements (0-100 score)
- **Comprehensive Skills Gap Analysis** - Detailed breakdown of strengths and areas for improvement
- **Keyword Optimization** - Identifies matched keywords and suggests missing ones to improve application success
- **Visual Skills Dashboard** - Color-coded skill bubbles and intuitive progress indicators
- **Industry-Specific Analysis** - Tailored feedback based on job sector and role level

### 📈 Dynamic Presentation Topics
- **AI-Generated Topics** - Custom presentation ideas based on your background and target role
- **Structured Talking Points** - Organized, actionable bullet points for each topic
- **Professional Themes** - Beautiful, responsive card layouts with color-coded categorization
- **Export-Ready Format** - Topics formatted for easy presentation preparation

### 🚀 Modern User Experience
- **Dual Theme Support** - Beautiful light and dark themes with smooth transitions
- **Mobile-First Design** - Fully responsive interface optimized for all devices
- **Progressive Web App** - Fast loading, offline-capable, and app-like experience
- **Accessibility First** - WCAG 2.1 compliant with screen reader support and keyboard navigation
- **Smart Caching** - Intelligent caching system reduces API calls and improves performance

### 🎭 Stress Relief & Engagement
- **Dad Jokes Integration** - Lighten the mood with family-friendly humor during prep sessions
- **GDPR-Compliant Caching** - Optional local data caching with cookie consent management
- **Session Persistence** - Resume your prep sessions exactly where you left off

## 🚀 Tech Stack

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for lightning-fast development and optimized production builds
- **Styling**: Hybrid CSS architecture with CSS Modules + global design system variables
- **State Management**: Zustand for lightweight, scalable application state
- **Component Architecture**: Atomic Design pattern (Atoms → Molecules → Organisms)

### AI & Backend
- **AI Integration**: OpenAI GPT-3.5-turbo for intelligent analysis and coaching
- **Serverless Functions**: Netlify Functions for secure API key management
- **Document Processing**: Advanced PDF parsing with pdfjs-dist and DOCX support
- **Caching Layer**: Intelligent client-side caching with cache invalidation

### Development & Deployment
- **Development**: Hot module replacement, TypeScript strict mode, ESLint + Prettier
- **Deployment**: Netlify with automatic deployments and edge optimization
- **Performance**: Code splitting, lazy loading, and progressive enhancement
- **Security**: Environment variables, CORS protection, and input sanitization

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- OpenAI API key (optional - app works with mock data)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cxm6467/ai-interview-prep.git
cd ai-interview-prep
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🎨 Design System

The application features a cohesive color-coded design system:

- **🔵 Blue**: Strengths and positive attributes
- **🟠 Orange**: Areas for improvement  
- **🟢 Green**: Keyword matches and success indicators
- **🔴 Red**: Missing keywords and alerts
- **🟣 Purple**: Interview questions and practice
- **🔷 Teal**: Presentation topics and speaking points

## 📁 Project Architecture

### Component Structure (Atomic Design)
```
src/
├── components/
│   ├── atoms/                    # Basic UI building blocks
│   │   ├── Button/              # Reusable button with variants
│   │   ├── Card/                # Container component
│   │   ├── Text/                # Typography component
│   │   ├── LoadingOverlay/      # Loading states
│   │   └── SkillBubble/         # Skill tags with variants
│   ├── molecules/                # Composite components
│   │   ├── FileUpload/          # Drag-and-drop file uploader
│   │   ├── DadJoke/             # Humor integration
│   │   └── CookieConsent/       # GDPR compliance
│   └── organisms/                # Complex, feature-rich components
│       ├── InterviewChat/       # AI coaching interface
│       └── Footer/              # Social links and info
├── services/                     # Business logic layer
│   ├── aiAnalysis.ts           # OpenAI integration
│   ├── cacheService.ts         # Performance optimization
│   └── documentParser.ts       # File processing
├── store/                        # State management
│   └── appStore.ts             # Zustand store configuration
├── types/                        # TypeScript definitions
│   └── index.ts                # Comprehensive type system
└── hooks/                        # Custom React hooks (future)
```

### File Naming Conventions
- **Components**: PascalCase directories with index files
- **CSS Modules**: `ComponentName.module.css`
- **Services**: camelCase with descriptive names
- **Types**: Exported from centralized `types/index.ts`

## 🔧 Configuration

### OpenAI Integration
The app works without an API key using mock data, but for full AI functionality:

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add it to your `.env` file as `VITE_OPENAI_API_KEY`
3. The app will automatically switch to live AI responses

### Cookie Consent
The app includes GDPR-compliant cookie consent for caching user data locally. All data stays on the user's device.

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Other Platforms

The app can be deployed to any static hosting service (Vercel, AWS S3, etc.) with serverless function support for the AI backend.

## 🤝 Contributing

We welcome contributions! Please see our [contribution guidelines](https://github.com/cxm6467/ai-interview-prep) for details.

### Ways to Contribute:
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation
- 🎨 Enhance UI/UX design

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Connect & Follow

### Developer Links
- **LinkedIn**: [Chris Marasco](https://www.linkedin.com/in/chris-marasco-4-/)
- **GitHub Profile**: [@cxm6467](https://github.com/cxm6467)
- **Project Repository**: [ai-interview-prep](https://github.com/cxm6467/ai-interview-prep)

Created with ❤️ by Chris Marasco - Follow for more innovative projects!

---

## 🎯 Future Roadmap

### Phase 1: Enhanced User Experience
- [ ] **Interview Recording & Playback** - Record practice sessions for self-review
- [ ] **Custom Question Banks** - User-created and community-shared questions
- [ ] **Advanced Analytics Dashboard** - Detailed progress tracking and insights
- [ ] **Multi-language Support** - International user accessibility

### Phase 2: Collaboration & Integration
- [ ] **Team Collaboration Features** - Shared prep sessions and peer feedback
- [ ] **Job Board Integration** - Direct import from LinkedIn, Indeed, etc.
- [ ] **Calendar Integration** - Schedule and manage interview prep sessions
- [ ] **PDF Report Generation** - Exportable analysis and recommendations

### Phase 3: Mobile & Advanced AI
- [ ] **Native Mobile App** - iOS and Android applications
- [ ] **Voice Interview Practice** - Speech recognition and pronunciation coaching
- [ ] **Industry-Specific Models** - Specialized AI coaches for different sectors
- [ ] **Real-time Market Data** - Salary insights and job market trends

---

## 📚 Documentation

- **[CSS Architecture](docs/CSS_ARCHITECTURE.md)** - Complete styling system documentation
- **[API Documentation](docs/API.md)** - Service layer and integration guides (coming soon)
- **[Component Library](docs/COMPONENTS.md)** - Atomic design system documentation (coming soon)
- **[Accessibility Guide](docs/ACCESSIBILITY.md)** - WCAG compliance and testing (coming soon)

---

*Built with React, TypeScript, and AI to revolutionize interview preparation!* 🚀✨