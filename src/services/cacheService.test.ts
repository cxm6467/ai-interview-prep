/**
 * @fileoverview Unit tests for CacheService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheService } from './cacheService';
import type { ResumeData, JobDescription, ATSScore } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock console methods to avoid noise in tests
const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, 'console', {
  value: consoleMock,
  writable: true,
});

describe('CacheService', () => {
  // Sample test data
  const mockResumeText = 'John Doe Software Engineer...';
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

  const mockJobText = 'Senior Frontend Developer position...';
  const mockJobData: JobDescription = {
    title: 'Senior Frontend Developer',
    company: 'Tech Company',
    requirements: ['React', 'TypeScript', '3+ years experience'],
    responsibilities: ['Build user interfaces', 'Collaborate with designers'],
    preferredSkills: ['GraphQL', 'Testing'],
    description: mockJobText
  };

  const mockATSScore: ATSScore = {
    score: 85,
    strengths: ['Strong React experience', 'Good communication skills'],
    improvements: ['Add more metrics', 'Include certifications'],
    keywordMatches: ['React', 'JavaScript', 'Frontend'],
    missingKeywords: ['TypeScript', 'Testing']
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    // Clear any real localStorage if somehow accessed
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch (e) {
        // Ignore errors in test environment
      }
    }
  });

  describe('Resume Caching', () => {
    it('caches resume data successfully', () => {
      const cacheKey = CacheService.generateResumeKey(mockResumeText);
      
      CacheService.cacheResume(mockResumeText, mockResumeData);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify({
          data: mockResumeData,
          timestamp: expect.any(Number),
          version: '1.0'
        })
      );
    });

    it('retrieves cached resume data successfully', () => {
      const cacheKey = CacheService.generateResumeKey(mockResumeText);
      const cachedData = {
        data: mockResumeData,
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

      const result = CacheService.getCachedResume(mockResumeText);

      expect(localStorageMock.getItem).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(mockResumeData);
    });

    it('returns null for non-existent cached resume', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = CacheService.getCachedResume(mockResumeText);

      expect(result).toBeNull();
    });

    it('returns null for expired cached resume', () => {
      const cacheKey = CacheService.generateResumeKey(mockResumeText);
      const expiredData = {
        data: mockResumeData,
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago (expired)
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData));

      const result = CacheService.getCachedResume(mockResumeText);

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(cacheKey);
    });

    it('handles corrupted cached resume data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = CacheService.getCachedResume(mockResumeText);

      expect(result).toBeNull();
      expect(consoleMock.error).toHaveBeenCalledWith(
        'Failed to parse cached resume data:',
        expect.any(Error)
      );
    });

    it('generates consistent cache keys for same resume text', () => {
      const key1 = CacheService.generateResumeKey(mockResumeText);
      const key2 = CacheService.generateResumeKey(mockResumeText);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^resume_/);
    });

    it('generates different cache keys for different resume text', () => {
      const key1 = CacheService.generateResumeKey(mockResumeText);
      const key2 = CacheService.generateResumeKey('Different resume text...');

      expect(key1).not.toBe(key2);
    });
  });

  describe('Job Description Caching', () => {
    it('caches job description data successfully', () => {
      const cacheKey = CacheService.generateJobKey(mockJobText);

      CacheService.cacheJobDescription(mockJobText, mockJobData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify({
          data: mockJobData,
          timestamp: expect.any(Number),
          version: '1.0'
        })
      );
    });

    it('retrieves cached job description data successfully', () => {
      const cacheKey = CacheService.generateJobKey(mockJobText);
      const cachedData = {
        data: mockJobData,
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

      const result = CacheService.getCachedJobDescription(mockJobText);

      expect(localStorageMock.getItem).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(mockJobData);
    });

    it('returns null for non-existent cached job description', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = CacheService.getCachedJobDescription(mockJobText);

      expect(result).toBeNull();
    });

    it('returns null for expired cached job description', () => {
      const cacheKey = CacheService.generateJobKey(mockJobText);
      const expiredData = {
        data: mockJobData,
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago (expired)
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData));

      const result = CacheService.getCachedJobDescription(mockJobText);

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(cacheKey);
    });

    it('handles corrupted cached job description data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = CacheService.getCachedJobDescription(mockJobText);

      expect(result).toBeNull();
      expect(consoleMock.error).toHaveBeenCalledWith(
        'Failed to parse cached job description data:',
        expect.any(Error)
      );
    });
  });

  describe('ATS Score Caching', () => {
    const combinedKey = 'resume_hash_job_hash';

    it('caches ATS score data successfully', () => {
      CacheService.cacheATSScore(combinedKey, mockATSScore);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `ats_${combinedKey}`,
        JSON.stringify({
          data: mockATSScore,
          timestamp: expect.any(Number),
          version: '1.0'
        })
      );
    });

    it('retrieves cached ATS score data successfully', () => {
      const cachedData = {
        data: mockATSScore,
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

      const result = CacheService.getCachedATSScore(combinedKey);

      expect(localStorageMock.getItem).toHaveBeenCalledWith(`ats_${combinedKey}`);
      expect(result).toEqual(mockATSScore);
    });

    it('returns null for non-existent cached ATS score', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = CacheService.getCachedATSScore(combinedKey);

      expect(result).toBeNull();
    });

    it('returns null for expired cached ATS score', () => {
      const expiredData = {
        data: mockATSScore,
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago (expired)
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData));

      const result = CacheService.getCachedATSScore(combinedKey);

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`ats_${combinedKey}`);
    });
  });

  describe('Cache Management', () => {
    it('clears all cache data successfully', () => {
      CacheService.clearCache();

      expect(localStorageMock.clear).toHaveBeenCalled();
      expect(consoleMock.log).toHaveBeenCalledWith('Cache cleared successfully');
    });

    it('handles localStorage errors gracefully when clearing cache', () => {
      localStorageMock.clear.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      expect(() => CacheService.clearCache()).not.toThrow();
      expect(consoleMock.error).toHaveBeenCalledWith(
        'Failed to clear cache:',
        expect.any(Error)
      );
    });

    it('gets cache statistics correctly', () => {
      localStorageMock.length = 5;
      localStorageMock.key.mockImplementation((index) => {
        const keys = ['resume_123', 'job_456', 'ats_789', 'other_key', 'resume_abc'];
        return keys[index] || null;
      });

      const stats = CacheService.getCacheStats();

      expect(stats).toEqual({
        totalItems: 5,
        resumeItems: 2,
        jobItems: 1,
        atsItems: 1,
        otherItems: 1
      });
    });

    it('handles localStorage errors gracefully when getting stats', () => {
      Object.defineProperty(localStorageMock, 'length', {
        get: () => {
          throw new Error('localStorage not available');
        }
      });

      const stats = CacheService.getCacheStats();

      expect(stats).toEqual({
        totalItems: 0,
        resumeItems: 0,
        jobItems: 0,
        atsItems: 0,
        otherItems: 0
      });
      expect(consoleMock.error).toHaveBeenCalledWith(
        'Failed to get cache stats:',
        expect.any(Error)
      );
    });
  });

  describe('Hash Generation', () => {
    it('generates consistent hashes for same input', () => {
      const hash1 = CacheService.generateHash(mockResumeText);
      const hash2 = CacheService.generateHash(mockResumeText);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('generates different hashes for different inputs', () => {
      const hash1 = CacheService.generateHash(mockResumeText);
      const hash2 = CacheService.generateHash('Different text');

      expect(hash1).not.toBe(hash2);
    });

    it('handles empty strings', () => {
      const hash = CacheService.generateHash('');

      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('handles very long strings', () => {
      const longString = 'a'.repeat(10000);
      const hash = CacheService.generateHash(longString);

      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage setItem errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });

      expect(() => CacheService.cacheResume(mockResumeText, mockResumeData)).not.toThrow();
      expect(consoleMock.error).toHaveBeenCalledWith(
        'Failed to cache resume data:',
        expect.any(Error)
      );
    });

    it('handles localStorage getItem errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = CacheService.getCachedResume(mockResumeText);

      expect(result).toBeNull();
      expect(consoleMock.error).toHaveBeenCalledWith(
        'Failed to get cached resume data:',
        expect.any(Error)
      );
    });

    it('handles localStorage removeItem errors gracefully', () => {
      const expiredData = {
        data: mockResumeData,
        timestamp: Date.now() - (25 * 60 * 60 * 1000),
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData));
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage removeItem failed');
      });

      const result = CacheService.getCachedResume(mockResumeText);

      expect(result).toBeNull();
      expect(consoleMock.error).toHaveBeenCalledWith(
        'Failed to remove expired cache item:',
        expect.any(Error)
      );
    });
  });

  describe('Cache Validation', () => {
    it('validates cache data structure', () => {
      const invalidData = {
        data: mockResumeData,
        // Missing timestamp and version
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidData));

      const result = CacheService.getCachedResume(mockResumeText);

      expect(result).toBeNull();
    });

    it('validates cache version compatibility', () => {
      const futureVersionData = {
        data: mockResumeData,
        timestamp: Date.now(),
        version: '2.0' // Future version
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(futureVersionData));

      const result = CacheService.getCachedResume(mockResumeText);

      // Should still return data (forward compatibility)
      expect(result).toEqual(mockResumeData);
    });
  });

  describe('Performance', () => {
    it('handles large data sets efficiently', () => {
      const largeResumeData = {
        ...mockResumeData,
        experience: Array(100).fill(mockResumeData.experience[0]),
        skills: Array(100).fill('skill')
      };

      const startTime = Date.now();
      CacheService.cacheResume(mockResumeText, largeResumeData);
      const endTime = Date.now();

      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('generates hashes quickly for large inputs', () => {
      const largeText = 'Large resume content '.repeat(1000);

      const startTime = Date.now();
      const hash = CacheService.generateHash(largeText);
      const endTime = Date.now();

      expect(typeof hash).toBe('string');
      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });
  });
});