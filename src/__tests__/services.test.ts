/**
 * @fileoverview Service tests focusing on core functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheService } from '../services/cacheService';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock console to avoid noise
Object.defineProperty(global, 'console', {
  value: { log: vi.fn(), error: vi.fn(), warn: vi.fn() },
  writable: true
});

describe('CacheService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can generate consistent hashes', () => {
    const text = 'test content';
    const hash1 = CacheService.generateHash(text);
    const hash2 = CacheService.generateHash(text);
    
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('string');
    expect(hash1.length).toBeGreaterThan(0);
  });

  it('generates different hashes for different content', () => {
    const hash1 = CacheService.generateHash('content1');
    const hash2 = CacheService.generateHash('content2');
    
    expect(hash1).not.toBe(hash2);
  });

  it('handles cache operations without errors', () => {
    const testData = { name: 'Test', skills: ['JavaScript'] };
    
    expect(() => {
      CacheService.cacheResume('test content', testData);
    }).not.toThrow();
    
    expect(() => {
      CacheService.getCachedResume('test content');
    }).not.toThrow();
  });

  it('returns null for non-existent cache entries', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const result = CacheService.getCachedResume('nonexistent');
    expect(result).toBeNull();
  });

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    
    expect(() => {
      CacheService.cacheResume('test', { name: 'test', skills: [], experience: [], education: [] });
    }).not.toThrow();
  });

  it('can clear cache without errors', () => {
    expect(() => {
      CacheService.clearCache();
    }).not.toThrow();
  });
});

describe('Hash Generation', () => {
  it('handles empty strings', () => {
    const hash = CacheService.generateHash('');
    expect(typeof hash).toBe('string');
  });

  it('handles special characters', () => {
    const hash = CacheService.generateHash('!@#$%^&*()');
    expect(typeof hash).toBe('string');
  });

  it('handles very long strings', () => {
    const longString = 'x'.repeat(10000);
    const hash = CacheService.generateHash(longString);
    expect(typeof hash).toBe('string');
  });
});