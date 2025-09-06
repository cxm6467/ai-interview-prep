/**
 * Data Sanitization Utility for PII/PHI Protection
 * Ensures sensitive information is properly masked or removed from logs and metrics
 */

import { getAllPIIPatterns, getCriticalPIIPatterns } from './pii-patterns';

interface SanitizationConfig {
  enablePIISanitization: boolean;
  enablePHISanitization: boolean;
  enableContentSanitization: boolean;
  preserveLength: boolean;
  maskingChar: string;
}

class DataSanitizer {
  private config: SanitizationConfig;

  // Shared PII patterns from centralized module
  private readonly allPatterns = getAllPIIPatterns();
  private readonly criticalPatterns = getCriticalPIIPatterns();

  constructor(config: Partial<SanitizationConfig> = {}) {
    this.config = {
      enablePIISanitization: config.enablePIISanitization ?? true,
      enablePHISanitization: config.enablePHISanitization ?? true,
      enableContentSanitization: config.enableContentSanitization ?? true,
      preserveLength: config.preserveLength ?? true,
      maskingChar: config.maskingChar ?? '*'
    };
  }

  /**
   * Sanitize a string by removing or masking sensitive information
   */
  sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') return input;

    let sanitized = input;

    if (this.config.enablePIISanitization) {
      sanitized = this.maskPII(sanitized);
    }

    if (this.config.enablePHISanitization) {
      sanitized = this.maskPHI(sanitized);
    }

    if (this.config.enableContentSanitization) {
      sanitized = this.maskSensitiveContent(sanitized);
    }

    return sanitized;
  }

  /**
   * Sanitize an object by recursively processing all string values
   */
  sanitizeObject(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        // Also sanitize keys that might contain sensitive info
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Create a sanitized version for logging with length preservation
   */
  sanitizeForLogging(data: unknown): unknown {
    const originalConfig = { ...this.config };
    this.config.preserveLength = true;
    
    const sanitized = this.sanitizeObject(data);
    
    this.config = originalConfig;
    return sanitized;
  }

  /**
   * Create metadata about sanitized content without exposing sensitive data
   */
  createSanitizationMetadata(originalData: unknown): Record<string, unknown> {
    const metadata = {
      dataType: typeof originalData,
      hasContent: Boolean(originalData),
      length: 0,
      piiDetected: false,
      phiDetected: false,
      sensitiveContentDetected: false
    };

    if (typeof originalData === 'string') {
      metadata.length = originalData.length;
      metadata.piiDetected = this.detectPII(originalData);
      metadata.phiDetected = this.detectPHI(originalData);
      metadata.sensitiveContentDetected = this.detectSensitiveContent(originalData);
    } else if (originalData && typeof originalData === 'object') {
      const jsonString = JSON.stringify(originalData);
      metadata.length = jsonString.length;
      metadata.piiDetected = this.detectPII(jsonString);
      metadata.phiDetected = this.detectPHI(jsonString);
      metadata.sensitiveContentDetected = this.detectSensitiveContent(jsonString);
    }

    return metadata;
  }

  private maskPII(text: string): string {
    let masked = text;
    
    Object.entries(this.allPatterns).forEach(([_key, patternConfig]) => {
      masked = masked.replace(patternConfig.pattern, (match) => {
        return this.createMask(match, `[${patternConfig.category.toUpperCase()}_REDACTED]`);
      });
    });
    
    return masked;
  }

  private maskPHI(text: string): string {
    // PHI patterns are included in allPatterns, so this method can be simplified
    // or used for additional PHI-specific processing
    return this.maskPII(text);
  }

  private maskSensitiveContent(text: string): string {
    // Sensitive content patterns are also included in allPatterns
    return this.maskPII(text);
  }

  private createMask(original: string, replacement: string): string {
    if (this.config.preserveLength) {
      // Keep same length but mask content
      const visibleChars = Math.min(2, Math.floor(original.length * 0.1));
      const maskedLength = original.length - (visibleChars * 2);
      
      if (maskedLength <= 0) {
        return this.config.maskingChar.repeat(original.length);
      }
      
      return original.substring(0, visibleChars) + 
             this.config.maskingChar.repeat(maskedLength) + 
             original.substring(original.length - visibleChars);
    }
    
    return replacement;
  }

  private detectPII(text: string): boolean {
    return Object.values(this.allPatterns).some(patternConfig => patternConfig.pattern.test(text));
  }

  private detectPHI(text: string): boolean {
    return Object.values(this.allPatterns)
      .filter(patternConfig => patternConfig.category === 'medical' || patternConfig.category === 'insurance')
      .some(patternConfig => patternConfig.pattern.test(text));
  }

  private detectSensitiveContent(text: string): boolean {
    return Object.values(this.criticalPatterns).some(patternConfig => patternConfig.pattern.test(text));
  }
}

// Default sanitizer instance
export const dataSanitizer = new DataSanitizer();

// Create custom sanitizers
export const createSanitizer = (config: Partial<SanitizationConfig> = {}) => 
  new DataSanitizer(config);

export type { SanitizationConfig };
export { DataSanitizer };