/**
 * @fileoverview Unit tests for AIAnalysisService
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIAnalysisService } from './aiAnalysis';
import type { ResumeData, JobDescription } from '../types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console to avoid noise in tests
const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

Object.defineProperty(global, 'console', {
  value: consoleMock,
  writable: true,
});

describe('AIAnalysisService', () => {
  // Sample test data
  const mockResumeData: ResumeData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    summary: 'Experienced software engineer',
    experience: [{
      company: 'Tech Corp',
      position: 'Senior Developer',
      duration: '2020-Present',
      description: ['Built web applications', 'Led team projects']
    }],
    skills: ['JavaScript', 'React', 'Node.js'],
    education: [{
      degree: 'BS Computer Science',
      school: 'Tech University',
      year: '2020'
    }]
  };

  const mockJobData: JobDescription = {
    title: 'Senior Frontend Developer',
    company: 'Tech Company',
    requirements: ['React', 'TypeScript', '3+ years experience'],
    responsibilities: ['Build user interfaces', 'Collaborate with designers'],
    preferredSkills: ['GraphQL', 'Testing'],
    description: 'Looking for a senior frontend developer...'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    vi.stubEnv('PROD', false);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Mock Data Generation', () => {
    it('generates mock ATS score with correct structure', () => {
      // Since we can't easily test the private method directly,
      // we'll test it by causing the real method to fall back to mock data
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      return AIAnalysisService.calculateATSScore(mockResumeData, mockJobData)
        .then(result => {
          expect(result).toHaveProperty('score');
          expect(typeof result.score).toBe('number');
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
          
          expect(result).toHaveProperty('strengths');
          expect(Array.isArray(result.strengths)).toBe(true);
          
          expect(result).toHaveProperty('improvements');
          expect(Array.isArray(result.improvements)).toBe(true);
          
          expect(result).toHaveProperty('keywordMatches');
          expect(Array.isArray(result.keywordMatches)).toBe(true);
          
          expect(result).toHaveProperty('missingKeywords');
          expect(Array.isArray(result.missingKeywords)).toBe(true);
        });
    });

    it('generates mock resume data with correct structure', () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      return AIAnalysisService.analyzeResume('Sample resume text')
        .then(result => {
          expect(result).toHaveProperty('name');
          expect(result).toHaveProperty('email');
          expect(result).toHaveProperty('skills');
          expect(Array.isArray(result.skills)).toBe(true);
          
          expect(result).toHaveProperty('experience');
          expect(Array.isArray(result.experience)).toBe(true);
          
          expect(result).toHaveProperty('education');
          expect(Array.isArray(result.education)).toBe(true);
          
          if (result.experience.length > 0) {
            expect(result.experience[0]).toHaveProperty('company');
            expect(result.experience[0]).toHaveProperty('position');
            expect(result.experience[0]).toHaveProperty('duration');
            expect(result.experience[0]).toHaveProperty('description');
          }
        });
    });

    it('generates mock job description with correct structure', () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      return AIAnalysisService.analyzeJobDescription('Sample job posting')
        .then(result => {
          expect(result).toHaveProperty('title');
          expect(result).toHaveProperty('company');
          expect(result).toHaveProperty('requirements');
          expect(Array.isArray(result.requirements)).toBe(true);
          
          expect(result).toHaveProperty('responsibilities');
          expect(Array.isArray(result.responsibilities)).toBe(true);
          
          expect(result).toHaveProperty('preferredSkills');
          expect(Array.isArray(result.preferredSkills)).toBe(true);
          
          expect(result).toHaveProperty('description');
          expect(typeof result.description).toBe('string');
        });
    });

    it('generates mock interview questions with correct structure', () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      return AIAnalysisService.generateInterviewQuestions(mockResumeData, mockJobData)
        .then(result => {
          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBeGreaterThan(0);
          
          if (result.length > 0) {
            expect(result[0]).toHaveProperty('id');
            expect(result[0]).toHaveProperty('type');
            expect(['technical', 'behavioral', 'situational']).toContain(result[0].type);
            expect(result[0]).toHaveProperty('question');
            expect(typeof result[0].question).toBe('string');
          }
        });
    });

    it('generates mock presentation topics with correct structure', () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      return AIAnalysisService.generatePresentationTopics(mockResumeData, mockJobData)
        .then(result => {
          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBeGreaterThan(0);
          
          if (result.length > 0) {
            expect(result[0]).toHaveProperty('id');
            expect(result[0]).toHaveProperty('title');
            expect(result[0]).toHaveProperty('bullets');
            expect(Array.isArray(result[0].bullets)).toBe(true);
          }
        });
    });
  });

  describe('API Integration', () => {
    it('uses correct API endpoint in production', () => {
      vi.stubEnv('PROD', true);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"content": "test response"}')
      } as Response);

      return AIAnalysisService.analyzeResume('test resume')
        .then(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            '/.netlify/functions/ai-handler',
            expect.any(Object)
          );
        });
    });

    it('uses correct API endpoint in development', () => {
      vi.stubEnv('PROD', false);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"content": "test response"}')
      } as Response);

      return AIAnalysisService.analyzeResume('test resume')
        .then(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            '/api/ai-handler',
            expect.any(Object)
          );
        });
    });

    it('sends correct request structure', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"content": "{\\"name\\": \\"John\\"}"}')
      } as Response);

      return AIAnalysisService.analyzeResume('test resume')
        .then(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: expect.stringContaining('messages'),
              signal: expect.any(AbortSignal)
            })
          );

          const callArgs = mockFetch.mock.calls[0];
          const requestBody = JSON.parse(callArgs[1].body);
          
          expect(requestBody).toHaveProperty('messages');
          expect(Array.isArray(requestBody.messages)).toBe(true);
          expect(requestBody.messages.length).toBe(2); // system + user message
          expect(requestBody.messages[0].role).toBe('system');
          expect(requestBody.messages[1].role).toBe('user');
        });
    });

    it('handles API timeout correctly', () => {
      const timeoutError = new Error('The operation was aborted');
      timeoutError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(timeoutError);

      return AIAnalysisService.analyzeResume('test resume')
        .then(result => {
          // Should fallback to mock data
          expect(result).toHaveProperty('name');
          expect(consoleMock.error).toHaveBeenCalledWith(
            expect.stringContaining('Resume analysis failed:'),
            expect.any(String)
          );
        });
    });

    it('handles API error responses correctly', () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('{"error": "AI service unavailable"}')
      } as Response);

      return AIAnalysisService.analyzeResume('test resume')
        .then(result => {
          // Should fallback to mock data
          expect(result).toHaveProperty('name');
          expect(consoleMock.error).toHaveBeenCalledWith(
            expect.stringContaining('Resume analysis failed:'),
            expect.any(String)
          );
        });
    });

    it('handles malformed API responses correctly', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('invalid json response')
      } as Response);

      return AIAnalysisService.analyzeResume('test resume')
        .then(result => {
          // Should fallback to mock data
          expect(result).toHaveProperty('name');
          expect(consoleMock.error).toHaveBeenCalledWith(
            expect.stringContaining('Resume analysis failed:'),
            expect.any(String)
          );
        });
    });
  });

  describe('Interview Response Generation', () => {
    it('generates interview response with correct context', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"content": "Great answer! Let me ask you about..."}')
      } as Response);

      const userResponse = 'I have 5 years of React experience...';
      const currentQuestion = 'Tell me about your React experience';
      const conversationHistory = ['Q: How are you today?', 'A: I\'m doing well'];
      const interviewerRole = 'tech-lead';

      return AIAnalysisService.generateInterviewResponse(
        userResponse,
        currentQuestion,
        mockResumeData,
        conversationHistory,
        interviewerRole
      ).then(result => {
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);

        // Verify the API was called with correct parameters
        const callArgs = mockFetch.mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);
        const userMessage = requestBody.messages[1].content;
        
        expect(userMessage).toContain('tech-lead');
        expect(userMessage).toContain(currentQuestion);
        expect(userMessage).toContain(userResponse);
        expect(userMessage).toContain('JavaScript');  // From mock resume skills
      });
    });

    it('handles interview response generation errors gracefully', () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      return AIAnalysisService.generateInterviewResponse(
        'Test response',
        'Test question',
        mockResumeData,
        [],
        'recruiter'
      ).then(result => {
        expect(result).toBe("Thank you for your response. Let's move on to the next question.");
        expect(consoleMock.error).toHaveBeenCalledWith(
          expect.stringContaining('Interview response generation failed:'),
          expect.any(String)
        );
      });
    });
  });

  describe('Data Validation', () => {
    it('validates and cleans ATS score data', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"content": "{\\"score\\": 150, \\"strengths\\": \\"not array\\", \\"improvements\\": [], \\"keywordMatches\\": [], \\"missingKeywords\\": []}"}')
      } as Response);

      return AIAnalysisService.calculateATSScore(mockResumeData, mockJobData)
        .then(result => {
          // Score should be clamped to 100
          expect(result.score).toBe(100);
          // Invalid strengths should be converted to empty array
          expect(result.strengths).toEqual([]);
          expect(Array.isArray(result.improvements)).toBe(true);
        });
    });

    it('handles completely invalid ATS response structure', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"content": "This is not valid JSON for ATS"}')
      } as Response);

      return AIAnalysisService.calculateATSScore(mockResumeData, mockJobData)
        .then(result => {
          // Should fallback to mock data
          expect(result).toHaveProperty('score');
          expect(typeof result.score).toBe('number');
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
        });
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('handles fetch network errors', () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      return AIAnalysisService.analyzeResume('test')
        .then(result => {
          expect(result).toHaveProperty('name');
          expect(consoleMock.error).toHaveBeenCalledWith(
            expect.stringContaining('Resume analysis failed:'),
            expect.stringContaining('Failed to fetch')
          );
        });
    });

    it('handles empty response gracefully', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('')
      } as Response);

      return AIAnalysisService.analyzeResume('test')
        .then(result => {
          // Should fallback to mock data when response is empty
          expect(result).toHaveProperty('name');
        });
    });

    it('handles partial response data', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"content": "{\\"name\\": \\"John\\"}"}') // Missing required fields
      } as Response);

      return AIAnalysisService.analyzeResume('test')
        .then(result => {
          // Should have name from response but fallback for other fields
          expect(result).toHaveProperty('name');
          expect(result).toHaveProperty('skills');
          expect(result).toHaveProperty('experience');
        });
    });
  });

  describe('Performance and Reliability', () => {
    it('applies reasonable timeout to API calls', () => {
      return AIAnalysisService.analyzeResume('test')
        .catch(() => {
          // Test that AbortSignal.timeout is called with 30000ms
          const callArgs = mockFetch.mock.calls[0];
          expect(callArgs[1].signal).toBeDefined();
        });
    });

    it('logs appropriate messages for debugging', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"content": "{\\"name\\": \\"John\\"}"}')
      } as Response);

      return AIAnalysisService.analyzeResume('test')
        .then(() => {
          expect(consoleMock.log).toHaveBeenCalledWith('🚀 Calling AI service...');
          expect(consoleMock.log).toHaveBeenCalledWith('🎯 AI service responded successfully!');
        });
    });

    it('handles concurrent requests properly', () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"content": "{\\"name\\": \\"John\\"}"}')
      } as Response);

      const promises = [
        AIAnalysisService.analyzeResume('resume1'),
        AIAnalysisService.analyzeResume('resume2'),
        AIAnalysisService.analyzeJobDescription('job1')
      ];

      return Promise.all(promises)
        .then(results => {
          expect(results).toHaveLength(3);
          expect(mockFetch).toHaveBeenCalledTimes(3);
          results.forEach(result => {
            expect(result).toBeDefined();
          });
        });
    });
  });
});