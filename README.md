# Interview Prep Pro 🚀

AI-powered interview preparation application for Full Stack Engineers with Monokai Pro theme.

## Features

- 🎨 **Monokai Pro Theme** - Beautiful dark/light theme with 16-bit colors
- 💬 **Interview Q&A** - Curated technical and behavioral questions
- 📈 **Presentation Topics** - 5 presentation ideas for interviews
- 🎯 **Skills Match** - Analysis of your skills vs job requirements
- 🎮 **Mock Interview Simulator** - Practice with timer and feedback
- 📄 **PDF Export** - Download all materials as PDF
- 😄 **Dad Jokes API** - GraphQL/Apollo integration example
- 🚀 **Deploy Ready** - Configured for Netlify deployment

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run format
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS3 with Monokai Pro theme
- **State Management**: React Hooks, Zustand
- **API**: Apollo Client, GraphQL
- **Testing**: Vitest, Testing Library
- **Deployment**: Netlify
- **CI/CD**: GitHub Actions

## Project Structure

```
interview-prep-pro/
├── src/
│   ├── components/       # React components
│   ├── data/            # Interview questions data
│   ├── hooks/           # Custom React hooks
│   ├── theme/           # Theme configuration
│   ├── utils/           # Utility functions
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── .github/workflows/   # CI/CD pipelines
└── netlify.toml        # Netlify configuration
```

## Deployment

### Deploy to Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy!

### Environment Variables

Create a `.env` file for local development:

```env
VITE_API_URL=your_api_url
VITE_APP_NAME=Interview Prep
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Author

Created with 💜 for Full Stack Engineers

---

**Live Demo**: [https://interview-prep-pro.netlify.app](https://interview-prep-pro.netlify.app)
