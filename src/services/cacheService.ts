import type { ResumeData, JobDescription } from '../types';

interface CacheItem<T> {
  data: T;
  hash: string;
  timestamp: number;
  expiresAt: number;
}

interface ParsedDataCache {
  resume?: CacheItem<ResumeData>;
  jobDescription?: CacheItem<JobDescription>;
}

export interface CacheAvailability {
  hasResume: boolean;
  hasJobDescription: boolean;
  resumeFileName?: string;
  jobDescriptionPreview?: string;
}

export class CacheService {
  private static readonly CACHE_KEY = 'interview_prep_cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private static hasConsent(): boolean {
    try {
      const consent = localStorage.getItem('cookie_consent');
      return consent === 'accepted';
    } catch {
      return false;
    }
  }

  // Simple hash function for file content
  private static generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  private static getCache(): ParsedDataCache {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) {return {};}
      
      const data = JSON.parse(cached) as ParsedDataCache;
      const now = Date.now();
      
      // Remove expired items
      const cleaned: ParsedDataCache = {};
      if (data.resume && data.resume.expiresAt > now) {
        cleaned.resume = data.resume;
      }
      if (data.jobDescription && data.jobDescription.expiresAt > now) {
        cleaned.jobDescription = data.jobDescription;
      }
      
      return cleaned;
    } catch (error) {
      console.warn('Failed to load cache:', error);
      return {};
    }
  }

  private static saveCache(cache: ParsedDataCache): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save cache:', error);
    }
  }

  static getCachedResume(fileContent: string): ResumeData | null {
    if (!this.hasConsent()) {return null;}
    
    const cache = this.getCache();
    const hash = this.generateHash(fileContent);
    
    if (cache.resume && cache.resume.hash === hash) {
      console.log('📄 Using cached resume data');
      return cache.resume.data;
    }
    
    return null;
  }

  static cacheResume(fileContent: string, resumeData: ResumeData): void {
    if (!this.hasConsent()) {return;}
    
    const cache = this.getCache();
    const hash = this.generateHash(fileContent);
    const now = Date.now();
    
    cache.resume = {
      data: resumeData,
      hash,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };
    
    this.saveCache(cache);
    console.log('📄 Cached resume data');
  }

  static getCachedJobDescription(jobContent: string): JobDescription | null {
    if (!this.hasConsent()) {return null;}
    
    const cache = this.getCache();
    const hash = this.generateHash(jobContent);
    
    if (cache.jobDescription && cache.jobDescription.hash === hash) {
      console.log('💼 Using cached job description data');
      return cache.jobDescription.data;
    }
    
    return null;
  }

  static cacheJobDescription(jobContent: string, jobData: JobDescription): void {
    if (!this.hasConsent()) {return;}
    
    const cache = this.getCache();
    const hash = this.generateHash(jobContent);
    const now = Date.now();
    
    cache.jobDescription = {
      data: jobData,
      hash,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };
    
    this.saveCache(cache);
    console.log('💼 Cached job description data');
  }

  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('🗑️ Cleared interview prep cache');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  static getCacheStats(): { resumeCached: boolean; jobCached: boolean; cacheSize: string } {
    const cache = this.getCache();
    const cacheString = localStorage.getItem(this.CACHE_KEY) || '';
    const sizeInKB = Math.round(new Blob([cacheString]).size / 1024);
    
    return {
      resumeCached: !!cache.resume,
      jobCached: !!cache.jobDescription,
      cacheSize: `${sizeInKB} KB`
    };
  }

  /**
   * Check what cached content is available for the given inputs
   * @param resumeContent - The resume file content to check
   * @param jobContent - The job description content to check
   * @returns Object indicating what cached content is available
   */
  static checkCacheAvailability(resumeContent?: string, jobContent?: string): CacheAvailability {
    if (!this.hasConsent()) {
      return { hasResume: false, hasJobDescription: false };
    }

    const cache = this.getCache();
    const result: CacheAvailability = {
      hasResume: false,
      hasJobDescription: false
    };

    // Check resume cache
    if (resumeContent && cache.resume) {
      const resumeHash = this.generateHash(resumeContent);
      if (cache.resume.hash === resumeHash) {
        result.hasResume = true;
        // Extract filename from resume data if available
        result.resumeFileName = cache.resume.data.name || 'Resume';
      }
    }

    // Check job description cache
    if (jobContent && cache.jobDescription) {
      const jobHash = this.generateHash(jobContent);
      if (cache.jobDescription.hash === jobHash) {
        result.hasJobDescription = true;
        // Extract preview from job description
        result.jobDescriptionPreview = cache.jobDescription.data.title || 
          cache.jobDescription.data.description?.substring(0, 100) || 
          jobContent.substring(0, 100);
      }
    }

    return result;
  }
}