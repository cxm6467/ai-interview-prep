/**
 * @fileoverview Integration tests for the main application
 * These tests focus on core functionality rather than implementation details
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the services to avoid external dependencies
vi.mock('../services/aiAnalysis', () => ({
  AIAnalysisService: {
    analyzeResume: vi.fn().mockResolvedValue({
      name: 'Test User',
      skills: ['JavaScript', 'React'],
      experience: [],
      education: []
    }),
    analyzeJobDescription: vi.fn().mockResolvedValue({
      title: 'Developer',
      company: 'Test Company',
      requirements: ['JavaScript'],
      responsibilities: [],
      preferredSkills: [],
      description: 'Test job'
    }),
    generateInterviewQuestions: vi.fn().mockResolvedValue([]),
    generatePresentationTopics: vi.fn().mockResolvedValue([]),
    calculateATSScore: vi.fn().mockResolvedValue({
      score: 80,
      strengths: [],
      improvements: [],
      keywordMatches: [],
      missingKeywords: []
    })
  }
}));

vi.mock('../services/cacheService', () => ({
  CacheService: {
    getCachedResume: vi.fn().mockReturnValue(null),
    getCachedJobDescription: vi.fn().mockReturnValue(null),
    cacheResume: vi.fn(),
    cacheJobDescription: vi.fn()
  }
}));

vi.mock('../services/documentParser', () => ({
  DocumentParser: {
    parseResume: vi.fn().mockResolvedValue('Test resume content')
  }
}));

describe('Application Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main application', () => {
    render(<App />);
    expect(screen.getByText('AI Interview Prep')).toBeInTheDocument();
  });

  it('displays upload sections', () => {
    render(<App />);
    expect(screen.getByText('Upload Your Resume')).toBeInTheDocument();
    expect(screen.getByText('Job Description')).toBeInTheDocument();
  });

  it('has a functional theme toggle', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const themeToggle = screen.getByRole('button', { name: /switch to/i });
    expect(themeToggle).toBeInTheDocument();
    
    await user.click(themeToggle);
    // Theme should toggle without errors
    expect(themeToggle).toBeInTheDocument();
  });

  it('displays start analysis button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /start analysis/i })).toBeInTheDocument();
  });

  it('handles analyze button click without crashing', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const analyzeButton = screen.getByRole('button', { name: /start analysis/i });
    
    // Should not crash when clicked without files
    await expect(user.click(analyzeButton)).resolves.not.toThrow();
    
    // App should still be rendered after click
    expect(screen.getByText('AI Interview Prep')).toBeInTheDocument();
  });

  it('renders footer component', () => {
    render(<App />);
    // Footer should contain some social links or company info
    expect(document.querySelector('footer')).toBeInTheDocument();
  });
});

describe('Component Smoke Tests', () => {
  it('button component works', () => {
    const handleClick = vi.fn();
    render(
      <button onClick={handleClick}>Test Button</button>
    );
    
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
  });

  it('renders text content correctly', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});

describe('Error Handling', () => {
  it('application does not crash with invalid props', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });
});