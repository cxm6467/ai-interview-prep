import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeConsoleOverride } from '@utils/consoleOverride'
import { initializeGA } from './utils/analytics'
import { initializeWebVitals } from './utils/webVitals'
import { ThemeProvider } from './components/providers/ThemeProvider'

// Initialize console override based on environment configuration
initializeConsoleOverride();

// Initialize Google Analytics
initializeGA();

// Initialize Web Vitals
initializeWebVitals();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
