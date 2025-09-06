/**
 * Frontend PII (Personally Identifiable Information) Scrubber
 * 
 * This service scrubs sensitive information from text before sending it to backend APIs.
 * It uses similar patterns to the backend PII scrubber but runs client-side for 
 * privacy-first data handling.
 * 
 * Security Features:
 * - Email address detection and redaction
 * - Phone number detection and redaction
 * - Street address detection and redaction
 * - Social Security Number detection and redaction
 * - Credit card number detection and redaction
 * - Common name patterns detection
 * - URL parameter scrubbing for sensitive tokens
 * - Personal website and social media profile detection
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('PII-Scrubber');

/**
 * PII pattern definitions for client-side scrubbing
 */
const PII_PATTERNS = {
  // Email addresses - comprehensive pattern
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[EMAIL_REDACTED]',
    critical: true,
    description: 'Email addresses'
  },

  // Phone numbers - various formats (improved to catch more patterns)
  phone: {
    pattern: /(?:\+?1[-.\s]?)?\(?[2-9][0-8][0-9]\)?[-.\s]*[2-9][0-9]{2}[-.\s]*[0-9]{4}|\b\d{3}[-.\s]*\d{3}[-.\s]*\d{4}\b/g,
    replacement: '[PHONE_REDACTED]',
    critical: true,
    description: 'Phone numbers'
  },

  // Social Security Numbers
  ssn: {
    pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    replacement: '[SSN_REDACTED]',
    critical: true,
    description: 'Social Security Numbers'
  },

  // Credit card numbers (basic pattern)
  creditCard: {
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    replacement: '[CREDIT_CARD_REDACTED]',
    critical: true,
    description: 'Credit card numbers'
  },

  // Street addresses (basic pattern)
  streetAddress: {
    pattern: /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Court|Ct|Way|Place|Pl)\b/gi,
    replacement: '[ADDRESS_REDACTED]',
    critical: true,
    description: 'Street addresses'
  },

  // ZIP codes (less critical, might be needed for job matching)
  zipCode: {
    pattern: /\b\d{5}(?:-\d{4})?\b/g,
    replacement: '[ZIP_REDACTED]',
    critical: false,
    description: 'ZIP codes'
  },

  // URLs with sensitive parameters
  sensitiveUrl: {
    pattern: /https?:\/\/[^\s]*(?:token|key|password|secret|auth)[^\s]*/gi,
    replacement: '[SENSITIVE_URL_REDACTED]',
    critical: true,
    description: 'URLs with sensitive parameters'
  },

  // LinkedIn URLs (less critical, often included in resumes intentionally)
  linkedIn: {
    pattern: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/gi,
    replacement: '[LINKEDIN_PROFILE]',
    critical: false,
    description: 'LinkedIn profiles'
  },

  // GitHub URLs (less critical, often included intentionally)
  github: {
    pattern: /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9-_]+/gi,
    replacement: '[GITHUB_PROFILE]',
    critical: false,
    description: 'GitHub profiles'
  },

  // Driver's License Numbers (basic pattern)
  driversLicense: {
    pattern: /\b[A-Z]\d{7,8}\b|\b\d{7,9}\b/g,
    replacement: '[LICENSE_REDACTED]',
    critical: true,
    description: 'Driver license numbers'
  },

  // Date of birth patterns
  dob: {
    pattern: /\b(?:DOB|Date of Birth|Born|Birth Date)[:\s]*\d{1,2}[/-]\d{1,2}[/-]\d{4}/gi,
    replacement: '[DOB_REDACTED]',
    critical: true,
    description: 'Date of birth'
  },

  // Credentials and secrets in text
  credentials: {
    pattern: /\b(?:password|secret|token|key|auth|bearer)\s*[:=]\s*[^\s]+/gi,
    replacement: '[CREDENTIALS_REDACTED]',
    critical: true,
    description: 'Passwords and authentication tokens'
  },

  // Names at the beginning of documents (common in resumes) - improved pattern
  names: {
    pattern: /^[A-Z][A-Z\s.]+?(?=\s+(?:SENIOR|JUNIOR|LEAD|SOFTWARE|FULL-STACK|BACK-?END|FRONT-?END|ENGINEER|DEVELOPER|MANAGER|ANALYST|DIRECTOR|SPECIALIST|COORDINATOR|CONSULTANT))/,
    replacement: '[NAME_REDACTED]',
    critical: true,
    description: 'Personal names'
  }
};

/**
 * Content type enum for different scrubbing strategies
 */
export enum ContentType {
  RESUME = 'resume',
  JOB_DESCRIPTION = 'job-description',
  GENERAL = 'general'
}

/**
 * PII scrubbing result interface
 */
export interface PIIScrubResult {
  scrubbedText: string;
  piiItemsFound: number;
  piiCategories: string[];
  hasCriticalPII: boolean;
  replacements: Array<{
    category: string;
    pattern: string;
    count: number;
  }>;
}

/**
 * Frontend PII Scrubber class
 */
export class PIIScrubber {
  /**
   * Scrub PII from text content
   * 
   * @param text - The text to scrub
   * @param contentType - The type of content being scrubbed
   * @returns PIIScrubResult with scrubbed text and metadata
   */
  static scrub(text: string, contentType: ContentType = ContentType.GENERAL): PIIScrubResult {
    if (!text || typeof text !== 'string') {
      logger.warn('Invalid text input for PII scrubbing');
      return {
        scrubbedText: text || '',
        piiItemsFound: 0,
        piiCategories: [],
        hasCriticalPII: false,
        replacements: []
      };
    }

    const scrubLogger = logger.child({ contentType, textLength: text.length });
    scrubLogger.info('Starting PII scrubbing');

    let scrubbedText = text;
    const replacements: Array<{ category: string; pattern: string; count: number }> = [];
    const categoriesFound = new Set<string>();
    let totalItems = 0;
    let hasCritical = false;

    // Apply PII patterns based on content type
    const patternsToApply = this.getPatternsForContentType(contentType);

    for (const [category, patternConfig] of Object.entries(patternsToApply)) {
      const matches = text.match(patternConfig.pattern);
      if (matches && matches.length > 0) {
        scrubbedText = scrubbedText.replace(patternConfig.pattern, patternConfig.replacement);
        
        replacements.push({
          category,
          pattern: patternConfig.description,
          count: matches.length
        });
        
        categoriesFound.add(category);
        totalItems += matches.length;
        
        if (patternConfig.critical) {
          hasCritical = true;
        }

        scrubLogger.debug(`Found ${matches.length} instances of ${patternConfig.description}`, {
          category,
          count: matches.length,
          critical: patternConfig.critical
        });
      }
    }

    const result: PIIScrubResult = {
      scrubbedText,
      piiItemsFound: totalItems,
      piiCategories: Array.from(categoriesFound),
      hasCriticalPII: hasCritical,
      replacements
    };

    scrubLogger.info('PII scrubbing completed', {
      itemsFound: totalItems,
      categories: result.piiCategories,
      hasCritical,
      originalLength: text.length,
      scrubbedLength: scrubbedText.length
    });

    return result;
  }

  /**
   * Get PII patterns to apply based on content type
   */
  private static getPatternsForContentType(contentType: ContentType): Record<string, typeof PII_PATTERNS[keyof typeof PII_PATTERNS]> {
    switch (contentType) {
      case ContentType.RESUME:
        // For resumes, we might be more lenient with professional URLs but strict with personal info
        return {
          ...PII_PATTERNS,
          // Don't scrub LinkedIn/GitHub for resumes as they're often intentionally included
          linkedIn: { ...PII_PATTERNS.linkedIn, pattern: /(?:)/, replacement: '' }, // Disable
          github: { ...PII_PATTERNS.github, pattern: /(?:)/, replacement: '' } // Disable
        };

      case ContentType.JOB_DESCRIPTION:
        // For job descriptions, focus on accidentally included sensitive info
        return {
          email: PII_PATTERNS.email,
          phone: PII_PATTERNS.phone,
          sensitiveUrl: PII_PATTERNS.sensitiveUrl,
          credentials: PII_PATTERNS.credentials
        };

      case ContentType.GENERAL:
      default:
        // Apply all patterns for general content
        return PII_PATTERNS;
    }
  }

  /**
   * Check if text contains PII without scrubbing
   * Useful for validation and warnings
   */
  static containsPII(text: string, contentType: ContentType = ContentType.GENERAL): boolean {
    if (!text || typeof text !== 'string') {
      return false;
    }

    const patternsToCheck = this.getPatternsForContentType(contentType);
    
    for (const patternConfig of Object.values(patternsToCheck)) {
      if (patternConfig.pattern.test(text)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get critical PII patterns only
   */
  static getCriticalPatterns(): Record<string, typeof PII_PATTERNS[keyof typeof PII_PATTERNS]> {
    const criticalPatterns: Record<string, typeof PII_PATTERNS[keyof typeof PII_PATTERNS]> = {};
    
    for (const [key, pattern] of Object.entries(PII_PATTERNS)) {
      if (pattern.critical) {
        criticalPatterns[key] = pattern;
      }
    }
    
    return criticalPatterns;
  }
}