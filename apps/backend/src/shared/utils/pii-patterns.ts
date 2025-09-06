/**
 * Shared PII (Personally Identifiable Information) patterns
 * 
 * Centralized regex patterns for detecting and scrubbing PII across the application.
 * Used by both data sanitizer and PII scrubber modules.
 */

export interface PIIPattern {
  pattern: RegExp;
  category: string;
  critical: boolean;
  description: string;
}

/**
 * Common PII detection patterns
 */
export const PII_PATTERNS: Record<string, PIIPattern> = {
  // Email addresses - comprehensive pattern
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    category: 'email',
    critical: true,
    description: 'Email addresses'
  },

  // Phone numbers - various formats
  phone: {
    pattern: /(?:\+?1[-.\s]?)?\(?[2-9][0-8][0-9]\)?[-.\s]?[2-9][0-9]{2}[-.\s]?[0-9]{4}|(?:\+?1[-.\s]?)?[2-9][0-8][0-9][-.\s]?[2-9][0-9]{2}[-.\s]?[0-9]{4}|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    category: 'phone',
    critical: true,
    description: 'Phone numbers'
  },

  // Social Security Numbers
  ssn: {
    pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    category: 'ssn',
    critical: true,
    description: 'Social Security Numbers'
  },

  // Credit card numbers (basic pattern)
  creditCard: {
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    category: 'financial',
    critical: true,
    description: 'Credit card numbers'
  },

  // Street addresses (basic pattern)
  streetAddress: {
    pattern: /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Court|Ct|Way|Place|Pl)\b/gi,
    category: 'address',
    critical: true,
    description: 'Street addresses'
  },

  // ZIP codes
  zipCode: {
    pattern: /\b\d{5}(?:-\d{4})?\b/g,
    category: 'address',
    critical: false,
    description: 'ZIP codes'
  },

  // IP addresses
  ipAddress: {
    pattern: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    category: 'network',
    critical: false,
    description: 'IP addresses'
  },

  // URLs with potential sensitive info
  sensitiveUrl: {
    pattern: /https?:\/\/[^\s]*(?:token|key|password|secret|auth)[^\s]*/gi,
    category: 'credentials',
    critical: true,
    description: 'URLs with sensitive parameters'
  },

  // Common first names with surnames
  commonNames: {
    pattern: /\b(?:John|Jane|Michael|Sarah|David|Emily|James|Ashley|Robert|Jessica|William|Amanda|Richard|Jennifer|Joseph|Lisa|Thomas|Michelle|Christopher|Kimberly|Charles|Susan|Daniel|Karen|Matthew|Nancy|Anthony|Linda|Donald|Elizabeth|Mark|Helen|Paul|Sandra|Steven|Maria|Kenneth|Barbara|Andrew|Betty|Joshua|Ruth|Brian|Carol|Kevin|Sharon|Edward|Dorothy|Ronald|Lisa|Timothy|Nancy|Jason|Karen|Jeffrey|Helen|Ryan|Sandra|Jacob|Donna|Gary|Carol|Nicholas|Ruth|Eric|Sharon|Jonathan|Michelle|Stephen|Laura|Larry|Emily|Justin|Kimberly|Scott|Deborah|Brandon|Rachel|Benjamin|Carolyn|Samuel|Janet|Gregory|Virginia|Alexander|Catherine|Patrick|Frances|Jack|Christine|Dennis|Mary|Jerry|Samantha|Tyler|Debra|Aaron|Rachel|Jose|Carolyn|Henry|Janet|Adam|Virginia|Douglas|Catherine|Nathan|Frances|Zachary|Christine)\s+[A-Z][a-z]+/g,
    category: 'name',
    critical: true,
    description: 'Common first names with surnames'
  },

  // LinkedIn URLs
  linkedIn: {
    pattern: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/gi,
    category: 'socialMedia',
    critical: false,
    description: 'LinkedIn profiles'
  },

  // GitHub URLs
  github: {
    pattern: /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9-_]+/gi,
    category: 'socialMedia',
    critical: false,
    description: 'GitHub profiles'
  },

  // Personal websites
  personalWebsite: {
    pattern: /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:com|net|org|io|me|dev|portfolio|personal)(?:\/[^\s]*)?/gi,
    category: 'website',
    critical: false,
    description: 'Personal websites'
  },

  // Driver's License Numbers (basic pattern)
  driversLicense: {
    pattern: /\b[A-Z]\d{7,8}\b|\b\d{7,9}\b/g,
    category: 'identification',
    critical: true,
    description: 'Driver license numbers'
  }
};

/**
 * Healthcare-specific PHI patterns
 */
export const PHI_PATTERNS: Record<string, PIIPattern> = {
  // Medical Record Numbers
  mrn: {
    pattern: /\b(?:MRN|Medical Record|Patient ID)[\s:]*[A-Z0-9-]+/gi,
    category: 'medical',
    critical: true,
    description: 'Medical Record Numbers'
  },

  // Insurance numbers
  insurance: {
    pattern: /\b(?:Policy|Member|Subscriber)[\s#:]*[A-Z0-9-]+/gi,
    category: 'insurance',
    critical: true,
    description: 'Insurance numbers'
  },

  // Date of birth patterns
  dob: {
    pattern: /\b(?:DOB|Date of Birth)[\s:]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/gi,
    category: 'personal',
    critical: true,
    description: 'Date of birth'
  },

  // Health conditions (basic)
  conditions: {
    pattern: /\b(?:diabetes|cancer|HIV|AIDS|depression|anxiety|schizophrenia)\b/gi,
    category: 'medical',
    critical: true,
    description: 'Health conditions'
  }
};

/**
 * Sensitive content patterns
 */
export const SENSITIVE_CONTENT_PATTERNS: Record<string, PIIPattern> = {
  // Credentials and secrets
  credentials: {
    pattern: /\b(?:password|secret|token|key|auth|bearer)\s*[:=]\s*[^\s]+/gi,
    category: 'credentials',
    critical: true,
    description: 'Passwords and authentication tokens'
  },

  // Financial information
  financialInfo: {
    pattern: /\b(?:salary|income|compensation|wage|bonus)\s*[:=]?\s*\$?[\d,]+/gi,
    category: 'financial',
    critical: false,
    description: 'Financial information'
  },

  // Personal demographic information
  personalInfo: {
    pattern: /\b(?:age|birthday|married|single|divorced|children)\b/gi,
    category: 'personal',
    critical: false,
    description: 'Personal demographic information'
  }
};

/**
 * Get all PII patterns combined
 */
export function getAllPIIPatterns(): Record<string, PIIPattern> {
  return {
    ...PII_PATTERNS,
    ...PHI_PATTERNS,
    ...SENSITIVE_CONTENT_PATTERNS
  };
}

/**
 * Get critical PII patterns only
 */
export function getCriticalPIIPatterns(): Record<string, PIIPattern> {
  const allPatterns = getAllPIIPatterns();
  const criticalPatterns: Record<string, PIIPattern> = {};
  
  for (const [key, pattern] of Object.entries(allPatterns)) {
    if (pattern.critical) {
      criticalPatterns[key] = pattern;
    }
  }
  
  return criticalPatterns;
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(category: string): Record<string, PIIPattern> {
  const allPatterns = getAllPIIPatterns();
  const categoryPatterns: Record<string, PIIPattern> = {};
  
  for (const [key, pattern] of Object.entries(allPatterns)) {
    if (pattern.category === category) {
      categoryPatterns[key] = pattern;
    }
  }
  
  return categoryPatterns;
}