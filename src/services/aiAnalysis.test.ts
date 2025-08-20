import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIAnalysisService } from './aiAnalysis';

// Mock the global fetch function
global.fetch = vi.fn();

describe('AIAnalysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset any environment variable mocks
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('analyzeResume', () => {
    it('successfully analyzes resume and job description', async () => {
      const mockResponse = {
        atsScore: {
          score: 85,
          feedback: 'Strong match for the position',
          strengths: ['React experience', 'Strong technical skills'],
          improvements: ['Add more specific metrics', 'Include leadership examples'],
          keywordMatches: ['React', 'TypeScript', 'Node.js'],
          missingKeywords: ['AWS', 'Docker']
        },
        technicalQuestions: [
          { question: 'Explain React hooks', answer: 'React hooks are functions that let you use state and other React features in functional components...' }
        ],
        behavioralQuestions: [
          { question: 'Tell me about a challenging project', answer: 'Structure your response using the STAR method...' }
        ],
        presentationTopics: [
          { topic: 'System Architecture', keyPoints: ['Scalability', 'Performance', 'Maintainability'] }
        ],
        candidateQuestions: ['What is the team structure?', 'What are the growth opportunities?'],
        strengths: ['Strong technical background', 'Good communication skills'],
        improvements: ['More leadership experience needed', 'Could improve system design knowledge']
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AIAnalysisService.analyzeResume(
        'John Doe - Software Engineer with 5 years experience in React and Node.js',
        'Looking for a Senior Full Stack Developer with React and Node.js experience'
      );

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/.netlify/functions/consolidated-ai-handler',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"resumeText"')
        })
      );
    });

    it('handles API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await AIAnalysisService.analyzeResume(
        'Sample resume',
        'Sample job description'
      );

      // Should return mock data when API fails
      expect(result).toBeDefined();
      expect(result.atsScore).toBeDefined();
      expect(result.atsScore.score).toBeGreaterThan(0);
      expect(result.technicalQuestions).toBeInstanceOf(Array);
      expect(result.behavioralQuestions).toBeInstanceOf(Array);
    });

    it('handles non-ok HTTP responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await AIAnalysisService.analyzeResume(
        'Sample resume',
        'Sample job description'
      );

      // Should fallback to mock data
      expect(result).toBeDefined();
      expect(result.atsScore.score).toBeGreaterThan(0);
    });

    it('validates input parameters', async () => {
      const mockResponse = {
        atsScore: { score: 75, feedback: 'Good match', strengths: [], improvements: [], keywordMatches: [], missingKeywords: [] },
        technicalQuestions: [],
        behavioralQuestions: [],
        presentationTopics: [],
        candidateQuestions: [],
        strengths: [],
        improvements: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await AIAnalysisService.analyzeResume('resume', 'job');

      expect(global.fetch).toHaveBeenCalledWith(
        '/.netlify/functions/consolidated-ai-handler',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringMatching(/"resumeText":\s*"resume"/)
        })
      );
    });
  });

  describe('generateInterviewResponse', () => {
    it('generates appropriate interview response', async () => {
      const mockResponse = 'Great answer! Your experience with React shows strong technical skills...';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: mockResponse })
      });

      const result = await AIAnalysisService.generateInterviewResponse(
        'I have 5 years of experience with React',
        'Tell me about your React experience',
        'Senior Software Engineer',
        {
          resumeData: 'John Doe - React Developer',
          jobDescription: 'Senior React Developer position',
          interviewQuestions: [],
          candidateQuestions: [],
          presentationTopics: [],
          atsScore: { score: 85, feedback: 'Strong match', strengths: [], improvements: [], keywordMatches: [], missingKeywords: [] }
        }
      );

      expect(result).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/.netlify/functions/consolidated-ai-handler',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"userAnswer"')
        })
      );
    });

    it('handles missing context gracefully', async () => {
      const mockResponse = 'Thank you for your response. Here\'s some feedback...';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: mockResponse })
      });

      const result = await AIAnalysisService.generateInterviewResponse(
        'My answer',
        'Sample question',
        'Generic Interviewer'
      );

      expect(result).toBe(mockResponse);
    });

    it('provides fallback response on error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await AIAnalysisService.generateInterviewResponse(
        'My answer',
        'Sample question',
        'Senior Engineer'
      );

      // Should return a meaningful fallback response
      expect(result).toContain('Thank you for your response');
      expect(result.length).toBeGreaterThan(50);
    });

    it('handles empty or invalid responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: '' })
      });

      const result = await AIAnalysisService.generateInterviewResponse(
        'My answer',
        'Sample question',
        'Senior Engineer'
      );

      // Should return fallback when response is empty
      expect(result).toContain('Thank you for your response');
    });
  });

  describe('error handling and resilience', () => {
    it('handles JSON parsing errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      const result = await AIAnalysisService.analyzeResume('resume', 'job');
      
      // Should fallback to mock data when JSON parsing fails
      expect(result).toBeDefined();
      expect(result.atsScore).toBeDefined();
    });

    it('handles timeout scenarios', async () => {
      // Mock a delayed response beyond typical timeout
      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 35000))
      );

      const result = await AIAnalysisService.analyzeResume('resume', 'job');
      
      // Should return mock data for timeout scenarios
      expect(result).toBeDefined();
      expect(result.atsScore.score).toBeGreaterThan(0);
    }, 10000); // Set test timeout to 10s, shorter than the mock 35s delay

    it('validates response structure', async () => {
      const invalidResponse = {
        // Missing required fields
        atsScore: { score: 85 }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => invalidResponse
      });

      const result = await AIAnalysisService.analyzeResume('resume', 'job');
      
      // Should handle incomplete response gracefully
      expect(result).toBeDefined();
      expect(result.atsScore).toBeDefined();
      expect(result.technicalQuestions).toBeInstanceOf(Array);
      expect(result.behavioralQuestions).toBeInstanceOf(Array);
    });
  });

  describe('API endpoint selection', () => {
    it('uses correct endpoint for different environments', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          atsScore: { score: 80, feedback: '', strengths: [], improvements: [], keywordMatches: [], missingKeywords: [] },
          technicalQuestions: [],
          behavioralQuestions: [],
          presentationTopics: [],
          candidateQuestions: [],
          strengths: [],
          improvements: []
        })
      });

      await AIAnalysisService.analyzeResume('resume', 'job');

      // Should use Netlify Functions endpoint
      expect(global.fetch).toHaveBeenCalledWith(
        '/.netlify/functions/consolidated-ai-handler',
        expect.any(Object)
      );
    });

    it('includes proper headers in requests', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          atsScore: { score: 80, feedback: '', strengths: [], improvements: [], keywordMatches: [], missingKeywords: [] },
          technicalQuestions: [],
          behavioralQuestions: [],
          presentationTopics: [],
          candidateQuestions: [],
          strengths: [],
          improvements: []
        })
      });

      await AIAnalysisService.analyzeResume('resume', 'job');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
      );
    });
  });

  describe('data transformation and validation', () => {
    it('properly structures interview questions', async () => {
      const mockResponse = {
        atsScore: { score: 85, feedback: 'Good', strengths: ['React'], improvements: ['AWS'], keywordMatches: ['React'], missingKeywords: ['AWS'] },
        technicalQuestions: [
          { question: 'What is React?', answer: 'React is a JavaScript library...' },
          { question: 'Explain hooks', answer: 'Hooks allow you to...' }
        ],
        behavioralQuestions: [
          { question: 'Tell me about yourself', answer: 'Use the STAR method...' }
        ],
        presentationTopics: [
          { topic: 'Architecture', keyPoints: ['Scalability', 'Performance'] }
        ],
        candidateQuestions: ['What is the team like?'],
        strengths: ['Strong technical skills'],
        improvements: ['More leadership needed']
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AIAnalysisService.analyzeResume('resume', 'job');

      expect(result.technicalQuestions).toHaveLength(2);
      expect(result.technicalQuestions[0]).toHaveProperty('question');
      expect(result.technicalQuestions[0]).toHaveProperty('answer');
      expect(result.behavioralQuestions).toHaveLength(1);
      expect(result.presentationTopics[0]).toHaveProperty('keyPoints');
      expect(Array.isArray(result.presentationTopics[0].keyPoints)).toBe(true);
    });

    it('ensures ATS score is within valid range', async () => {
      const mockResponse = {
        atsScore: { score: 150, feedback: 'Excellent', strengths: [], improvements: [], keywordMatches: [], missingKeywords: [] }, // Invalid score > 100
        technicalQuestions: [],
        behavioralQuestions: [],
        presentationTopics: [],
        candidateQuestions: [],
        strengths: [],
        improvements: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await AIAnalysisService.analyzeResume('resume', 'job');

      // Should handle invalid score gracefully
      expect(result.atsScore.score).toBeLessThanOrEqual(100);
      expect(result.atsScore.score).toBeGreaterThanOrEqual(0);
    });
  });
});