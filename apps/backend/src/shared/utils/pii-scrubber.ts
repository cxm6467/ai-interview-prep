/**
 * @fileoverview PII (Personally Identifiable Information) Scrubbing Utility
 * 
 * This module provides comprehensive functionality to identify and remove or mask
 * personally identifiable information from resume text and job descriptions before
 * processing, caching, or analysis to ensure privacy compliance and data security.
 */

import { getAllPIIPatterns } from './pii-patterns';
import { generateContentHash } from './crypto-utils';
import { ContentType } from '@cxm6467/ai-interview-prep-types';

/**
 * Configuration for PII scrubbing behavior
 */
export interface PIIScrubberConfig {
  /** Whether to mask PII (replace with placeholders) or remove entirely */
  maskInsteadOfRemove?: boolean;
  
  /** Custom placeholders for different PII types */
  placeholders?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    socialMedia?: string;
    custom?: string;
  };
  
  /** Whether to preserve certain context around PII for analysis quality */
  preserveContext?: boolean;
  
  /** Additional patterns to scrub (company-specific) */
  customPatterns?: Array<{
    pattern: RegExp;
    replacement: string;
    description: string;
  }>;
}

/**
 * Default configuration for PII scrubbing
 */
const DEFAULT_CONFIG: Required<PIIScrubberConfig> = {
  maskInsteadOfRemove: true,
  placeholders: {
    name: '[NAME_REDACTED]',
    email: '[EMAIL_REDACTED]',
    phone: '[PHONE_REDACTED]',
    address: '[ADDRESS_REDACTED]',
    website: '[WEBSITE_REDACTED]',
    socialMedia: '[SOCIAL_MEDIA_REDACTED]',
    custom: '[PII_REDACTED]'
  },
  preserveContext: true,
  customPatterns: []
};

/**
 * Results of PII scrubbing operation
 */
export interface PIIScrubResult {
  /** The scrubbed text with PII removed/masked */
  scrubbedText: string;
  
  /** Number of PII items found and scrubbed */
  piiItemsFound: number;
  
  /** Categories of PII that were found */
  piiCategories: string[];
  
  /** Whether any critical PII was found (names, contact info) */
  hasCriticalPII: boolean;
  
  /** Hash of original text for caching purposes (without PII) */
  contentHash: string;
}


/**
 * PIIScrubber class for removing or masking PII from text
 */
export class PIIScrubber {
  private config: Required<PIIScrubberConfig>;

  constructor(config: PIIScrubberConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      placeholders: {
        ...DEFAULT_CONFIG.placeholders,
        ...config.placeholders
      }
    };
  }

  /**
   * Scrub PII from text content
   * 
   * @param text - The text content to scrub
   * @param contentType - Type of content (resume, job-description, etc.)
   * @returns PIIScrubResult with scrubbed content and metadata
   */
  scrubText(text: string, contentType: ContentType = ContentType.GENERAL): PIIScrubResult {
    if (!text || typeof text !== 'string') {
      return {
        scrubbedText: text || '',
        piiItemsFound: 0,
        piiCategories: [],
        hasCriticalPII: false,
        contentHash: this.generatePIIContentHash('')
      };
    }

    let scrubbedText = text;
    let piiItemsFound = 0;
    const piiCategories = new Set<string>();
    let hasCriticalPII = false;

    // Apply built-in PII patterns
    const allPatterns = getAllPIIPatterns();
    for (const [, patternConfig] of Object.entries(allPatterns)) {
      const matches = text.match(patternConfig.pattern);
      if (matches && matches.length > 0) {
        piiItemsFound += matches.length;
        piiCategories.add(patternConfig.category);
        
        if (patternConfig.critical) {
          hasCriticalPII = true;
        }

        // Replace with appropriate placeholder
        const placeholder = this.getPlaceholderForCategory(patternConfig.category);
        scrubbedText = scrubbedText.replace(patternConfig.pattern, placeholder);
      }
    }

    // Apply custom patterns if provided
    for (const customPattern of this.config.customPatterns) {
      const matches = text.match(customPattern.pattern);
      if (matches && matches.length > 0) {
        piiItemsFound += matches.length;
        piiCategories.add('custom');
        scrubbedText = scrubbedText.replace(customPattern.pattern, customPattern.replacement);
      }
    }

    // Content-specific scrubbing
    if (contentType === ContentType.RESUME) {
      scrubbedText = this.scrubResumeSpecificPII(scrubbedText);
    } else if (contentType === ContentType.JOB_DESCRIPTION) {
      scrubbedText = this.scrubJobDescriptionSpecificPII(scrubbedText);
    }

    // Clean up multiple consecutive placeholders
    scrubbedText = this.cleanupText(scrubbedText);

    return {
      scrubbedText,
      piiItemsFound,
      piiCategories: Array.from(piiCategories),
      hasCriticalPII,
      contentHash: this.generatePIIContentHash(scrubbedText)
    };
  }

  /**
   * Scrub resume-specific PII patterns
   */
  private scrubResumeSpecificPII(text: string): string {
    let scrubbedText = text;

    // References section (often contains PII)
    scrubbedText = scrubbedText.replace(
      /References?\s*:?\s*[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi,
      '[REFERENCES_SECTION_REDACTED]'
    );

    // Personal statements that might contain identifying info
    scrubbedText = scrubbedText.replace(
      /(?:Personal|About Me|Summary)[\s:]*[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi,
      (match) => {
        // Only redact if it contains potential PII
        if (this.containsPII(match)) {
          return '[PERSONAL_SECTION_REDACTED]';
        }
        return match;
      }
    );

    return scrubbedText;
  }

  /**
   * Scrub job description specific PII patterns
   */
  private scrubJobDescriptionSpecificPII(text: string): string {
    let scrubbedText = text;

    // Company-specific internal codes or identifiers
    scrubbedText = scrubbedText.replace(
      /(?:Employee ID|Badge|Internal Code)[\s:]*[\w\d-]+/gi,
      '[INTERNAL_ID_REDACTED]'
    );

    // Specific manager or contact names in job descriptions
    scrubbedText = scrubbedText.replace(
      /(?:Contact|Manager|Supervisor|Reports to)[\s:]*[A-Z][a-z]+\s+[A-Z][a-z]+/gi,
      'Contact: [HIRING_MANAGER_REDACTED]'
    );

    return scrubbedText;
  }

  /**
   * Check if text contains potential PII
   */
  private containsPII(text: string): boolean {
    const allPatterns = getAllPIIPatterns();
    for (const pattern of Object.values(allPatterns)) {
      if (pattern.pattern.test(text)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get appropriate placeholder for PII category
   */
  private getPlaceholderForCategory(category: string): string {
    switch (category) {
      case 'email': return this.config.placeholders.email || '[EMAIL_REDACTED]';
      case 'phone': return this.config.placeholders.phone || '[PHONE_REDACTED]';
      case 'address': return this.config.placeholders.address || '[ADDRESS_REDACTED]';
      case 'name': return this.config.placeholders.name || '[NAME_REDACTED]';
      case 'website': return this.config.placeholders.website || '[WEBSITE_REDACTED]';
      case 'socialMedia': return this.config.placeholders.socialMedia || '[SOCIAL_MEDIA_REDACTED]';
      default: return this.config.placeholders.custom || '[PII_REDACTED]';
    }
  }

  /**
   * Clean up text after PII removal
   */
  private cleanupText(text: string): string {
    return text
      // Remove multiple consecutive newlines
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      // Remove multiple consecutive spaces
      .replace(/\s{3,}/g, '  ')
      // Remove trailing/leading whitespace
      .trim();
  }

  /**
   * Generate a content hash for caching purposes (excluding PII)
   */
  private generatePIIContentHash(text: string): string {
    return generateContentHash(text);
  }

  /**
   * Static method for quick PII scrubbing with default settings
   */
  static scrub(text: string, contentType: ContentType = ContentType.GENERAL): PIIScrubResult {
    const scrubber = new PIIScrubber();
    return scrubber.scrubText(text, contentType);
  }

  /**
   * Validate that text is safe for processing (contains no critical PII)
   */
  static validateSafeForProcessing(text: string): { safe: boolean; issues: string[] } {
    const result = PIIScrubber.scrub(text);
    
    return {
      safe: !result.hasCriticalPII,
      issues: result.hasCriticalPII 
        ? [`Found ${result.piiItemsFound} PII items in categories: ${result.piiCategories.join(', ')}`]
        : []
    };
  }
}

/**
 * Utility functions for common PII scrubbing operations
 */
export const PIIUtils = {
  /**
   * Scrub resume text with resume-specific settings
   */
  scrubResume: (resumeText: string): PIIScrubResult => {
    return PIIScrubber.scrub(resumeText, ContentType.RESUME);
  },

  /**
   * Scrub job description with job-specific settings
   */
  scrubJobDescription: (jobText: string): PIIScrubResult => {
    return PIIScrubber.scrub(jobText, ContentType.JOB_DESCRIPTION);
  },

  /**
   * Create a cache-safe version of data for storage
   */
  createCacheSafeData: (data: { resumeText?: string; jobDescription?: string }) => {
    const result: {
      resumeText?: string;
      jobDescription?: string;
      resumePIIMetadata?: { piiItemsFound: number; piiCategories: string[]; hasCriticalPII: boolean; };
      jobPIIMetadata?: { piiItemsFound: number; piiCategories: string[]; hasCriticalPII: boolean; };
    } = {};
    
    if (data.resumeText) {
      const resumeResult = PIIUtils.scrubResume(data.resumeText);
      result.resumeText = resumeResult.scrubbedText;
      result.resumePIIMetadata = {
        piiItemsFound: resumeResult.piiItemsFound,
        piiCategories: resumeResult.piiCategories,
        hasCriticalPII: resumeResult.hasCriticalPII
      };
    }
    
    if (data.jobDescription) {
      const jobResult = PIIUtils.scrubJobDescription(data.jobDescription);
      result.jobDescription = jobResult.scrubbedText;
      result.jobPIIMetadata = {
        piiItemsFound: jobResult.piiItemsFound,
        piiCategories: jobResult.piiCategories,
        hasCriticalPII: jobResult.hasCriticalPII
      };
    }
    
    return result;
  }
};