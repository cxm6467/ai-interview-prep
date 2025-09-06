/**
 * @fileoverview Secure caching system for PII-scrubbed data
 * 
 * This module provides secure caching functionality for interview preparation analysis
 * data that has been scrubbed of personally identifiable information (PII). It ensures
 * that only safe, non-sensitive data is cached while maintaining analysis performance.
 */

import { PIIScrubResult } from './pii-scrubber';
import { generateCacheKey, generateContentHash } from './crypto-utils';

/**
 * Cache entry with metadata
 */
export interface CacheEntry<T = any> {
  /** The cached data */
  data: T;
  /** When the entry was created */
  createdAt: Date;
  /** When the entry expires */
  expiresAt: Date;
  /** Hash of the original input for cache key generation */
  contentHash: string;
  /** PII metadata from scrubbing process */
  piiMetadata?: {
    resumePII?: {
      itemsFound: number;
      categories: string[];
      hasCritical: boolean;
    };
    jobPII?: {
      itemsFound: number;
      categories: string[];
      hasCritical: boolean;
    };
  };
  /** Number of times this entry has been accessed */
  accessCount: number;
  /** Last time this entry was accessed */
  lastAccessed: Date;
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /** Default TTL in seconds */
  defaultTTL: number;
  /** Maximum number of cache entries */
  maxSize: number;
  /** Enable cache statistics */
  enableStats: boolean;
  /** Prefix for cache keys */
  keyPrefix: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  memoryUsage: number;
}

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 3600, // 1 hour
  maxSize: 1000,
  enableStats: true,
  keyPrefix: 'ai-interview-prep'
};

/**
 * Secure cache for PII-scrubbed analysis data
 * 
 * This cache is specifically designed for storing analysis results from PII-scrubbed
 * resume and job description data. It includes safeguards to prevent caching of
 * sensitive information and provides comprehensive cache management.
 */
export class SecureCache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a secure cache key based on scrubbed content
   */
  private generateSecureCacheKey(resumeHash: string, jobHash: string, analysisType?: string): string {
    const components = [resumeHash, jobHash];
    if (analysisType) {
      components.push(analysisType);
    }
    
    return generateCacheKey(components, this.config.keyPrefix);
  }


  /**
   * Check if data is safe to cache (contains no PII)
   */
  private isSafeToCache(resumeScrubResult: PIIScrubResult, jobScrubResult: PIIScrubResult): boolean {
    // Don't cache if either contains critical PII
    if (resumeScrubResult.hasCriticalPII || jobScrubResult.hasCriticalPII) {
      return false;
    }
    
    // Don't cache if too much PII was found (might indicate scrubbing issues)
    const totalPII = resumeScrubResult.piiItemsFound + jobScrubResult.piiItemsFound;
    if (totalPII > 10) {
      return false;
    }
    
    return true;
  }

  /**
   * Set a cache entry with PII-safe data
   */
  set<T>(
    resumeScrubResult: PIIScrubResult,
    jobScrubResult: PIIScrubResult, 
    data: T,
    analysisType?: string,
    ttl?: number
  ): boolean {
    // Safety check: don't cache if PII detected
    if (!this.isSafeToCache(resumeScrubResult, jobScrubResult)) {
      return false;
    }

    const key = this.generateSecureCacheKey(
      resumeScrubResult.contentHash,
      jobScrubResult.contentHash,
      analysisType
    );
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (ttl || this.config.defaultTTL) * 1000);
    
    // Evict oldest entries if at max capacity
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }
    
    const entry: CacheEntry<T> = {
      data,
      createdAt: now,
      expiresAt,
      contentHash: `${resumeScrubResult.contentHash}:${jobScrubResult.contentHash}`,
      piiMetadata: {
        resumePII: {
          itemsFound: resumeScrubResult.piiItemsFound,
          categories: resumeScrubResult.piiCategories,
          hasCritical: resumeScrubResult.hasCriticalPII
        },
        jobPII: {
          itemsFound: jobScrubResult.piiItemsFound,
          categories: jobScrubResult.piiCategories,
          hasCritical: jobScrubResult.hasCriticalPII
        }
      },
      accessCount: 0,
      lastAccessed: now
    };
    
    this.cache.set(key, entry);
    return true;
  }

  /**
   * Get a cache entry
   */
  get<T>(resumeScrubResult: PIIScrubResult, jobScrubResult: PIIScrubResult, analysisType?: string): T | null {
    const key = this.generateSecureCacheKey(
      resumeScrubResult.contentHash,
      jobScrubResult.contentHash,
      analysisType
    );
    
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if entry has expired
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access metadata
    entry.accessCount++;
    entry.lastAccessed = new Date();
    
    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Check if a cache entry exists and is valid
   */
  has(resumeScrubResult: PIIScrubResult, jobScrubResult: PIIScrubResult, analysisType?: string): boolean {
    const key = this.generateSecureCacheKey(
      resumeScrubResult.contentHash,
      jobScrubResult.contentHash,
      analysisType
    );
    
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete a specific cache entry
   */
  delete(resumeScrubResult: PIIScrubResult, jobScrubResult: PIIScrubResult, analysisType?: string): boolean {
    const key = this.generateSecureCacheKey(
      resumeScrubResult.contentHash,
      jobScrubResult.contentHash,
      analysisType
    );
    
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = new Date();
    const initialSize = this.cache.size;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
    
    return initialSize - this.cache.size;
  }

  /**
   * Evict the oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = new Date();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    // Estimate memory usage
    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      memoryUsage += JSON.stringify(entry).length * 2; // Rough estimate in bytes
    }
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalEntries: this.cache.size,
      memoryUsage
    };
  }

  /**
   * Get all cache entries (for debugging/monitoring)
   */
  getAllEntries(): Array<{ key: string; entry: CacheEntry }> {
    const entries: Array<{ key: string; entry: CacheEntry }> = [];
    for (const [key, entry] of this.cache.entries()) {
      entries.push({ key, entry });
    }
    return entries.sort((a, b) => b.entry.lastAccessed.getTime() - a.entry.lastAccessed.getTime());
  }

  /**
   * Create cache key from scrubbed resume and job description texts
   * Useful for external cache key generation
   */
  static createCacheKey(scrubbedResumeText: string, scrubbedJobText: string, analysisType?: string): string {
    const resumeHash = generateContentHash(scrubbedResumeText);
    const jobHash = generateContentHash(scrubbedJobText);
    
    const components = [resumeHash, jobHash];
    if (analysisType) {
      components.push(analysisType);
    }
    
    return generateCacheKey(components, 'ai-interview-prep');
  }
}

/**
 * Global cache instance for application use
 */
export const secureCache = new SecureCache({
  defaultTTL: 3600, // 1 hour
  maxSize: 500,     // Reasonable size for Lambda environment
  enableStats: true,
  keyPrefix: 'ai-interview-prep'
});

/**
 * Utility functions for common caching operations
 */
export const CacheUtils = {
  /**
   * Cache analysis results safely
   */
  cacheAnalysisResult: <T>(
    resumeScrubResult: PIIScrubResult,
    jobScrubResult: PIIScrubResult,
    analysisResult: T,
    analysisType?: string,
    ttl?: number
  ): boolean => {
    return secureCache.set(resumeScrubResult, jobScrubResult, analysisResult, analysisType, ttl);
  },

  /**
   * Retrieve cached analysis results
   */
  getCachedAnalysisResult: <T>(
    resumeScrubResult: PIIScrubResult,
    jobScrubResult: PIIScrubResult,
    analysisType?: string
  ): T | null => {
    return secureCache.get<T>(resumeScrubResult, jobScrubResult, analysisType);
  },

  /**
   * Check if analysis result is cached
   */
  hasAnalysisResult: (
    resumeScrubResult: PIIScrubResult,
    jobScrubResult: PIIScrubResult,
    analysisType?: string
  ): boolean => {
    return secureCache.has(resumeScrubResult, jobScrubResult, analysisType);
  },

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredEntries: (): number => {
    return secureCache.cleanup();
  },

  /**
   * Get cache performance statistics
   */
  getCacheStats: (): CacheStats => {
    return secureCache.getStats();
  }
};