/**
 * Analysis Cache Service
 * 
 * Caches complete analysis results to avoid re-processing identical
 * combinations of resume + job description + interviewer role
 */

import type { AnalysisResult } from '@cxm6467/ai-interview-prep-types';

interface CachedAnalysis {
  resumeHash: string;
  jobHash: string;
  interviewerRole: string;
  analysisResult: AnalysisResult; // The complete analysis result
  createdAt: Date;
  lastAccessed: Date;
}

interface AnalysisCacheKey {
  resumeHash: string;
  jobHash: string;
  interviewerRole: string;
}

class AnalysisCacheService {
  private cache = new Map<string, CachedAnalysis>();
  private maxCacheSize = 20;
  private cacheExpiryHours = 24; // Cache expires after 24 hours

  /**
   * Generate a hash for content
   */
  private async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }

  /**
   * Generate cache key from analysis components
   */
  private getCacheKey(key: AnalysisCacheKey): string {
    return `${key.resumeHash}-${key.jobHash}-${key.interviewerRole || 'none'}`;
  }

  /**
   * Check if we have a cached analysis for these inputs
   */
  async getCachedAnalysis(
    resumeContent: string, 
    jobContent: string, 
    interviewerRole: string = ''
  ): Promise<unknown | null> {
    try {
      const resumeHash = await this.generateContentHash(resumeContent);
      const jobHash = await this.generateContentHash(jobContent);
      const cacheKey = this.getCacheKey({ resumeHash, jobHash, interviewerRole });
      
      const cached = this.cache.get(cacheKey);
      if (cached) {
        // Check if cache is still valid
        const now = new Date();
        const expiryTime = new Date(cached.createdAt);
        expiryTime.setHours(expiryTime.getHours() + this.cacheExpiryHours);
        
        if (now < expiryTime) {
          // Update access info
          cached.lastAccessed = now;
          console.log('✅ Using cached analysis result');
          return cached.analysisResult;
        } else {
          // Remove expired cache
          this.cache.delete(cacheKey);
          console.log('⏰ Cached analysis expired, will fetch fresh');
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking analysis cache:', error);
      return null;
    }
  }

  /**
   * Cache a complete analysis result
   */
  async cacheAnalysis(
    resumeContent: string,
    jobContent: string,
    interviewerRole: string = '',
    analysisResult: AnalysisResult
  ): Promise<void> {
    try {
      const resumeHash = await this.generateContentHash(resumeContent);
      const jobHash = await this.generateContentHash(jobContent);
      const cacheKey = this.getCacheKey({ resumeHash, jobHash, interviewerRole });
      
      // Evict oldest if at capacity
      if (this.cache.size >= this.maxCacheSize) {
        const oldestKey = Array.from(this.cache.keys())[0];
        this.cache.delete(oldestKey);
      }
      
      const cached: CachedAnalysis = {
        resumeHash,
        jobHash,
        interviewerRole,
        analysisResult,
        createdAt: new Date(),
        lastAccessed: new Date()
      };
      
      this.cache.set(cacheKey, cached);
      console.log('💾 Analysis result cached');
    } catch (error) {
      console.error('Error caching analysis:', error);
    }
  }

  /**
   * Check if we have analysis for these parameters (without returning the result)
   */
  async hasAnalysis(
    resumeContent: string,
    jobContent: string, 
    interviewerRole: string = ''
  ): Promise<boolean> {
    const result = await this.getCachedAnalysis(resumeContent, jobContent, interviewerRole);
    return result !== null;
  }

  /**
   * Clear all cached analyses
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Analysis cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      entries: Array.from(this.cache.values()).map(entry => ({
        resumeHash: entry.resumeHash.substring(0, 8),
        jobHash: entry.jobHash.substring(0, 8),
        interviewerRole: entry.interviewerRole,
        createdAt: entry.createdAt,
        lastAccessed: entry.lastAccessed
      }))
    };
  }
}

export const analysisCacheService = new AnalysisCacheService();