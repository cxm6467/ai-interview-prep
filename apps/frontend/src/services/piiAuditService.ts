/**
 * @fileoverview PII Audit Service for DevPanel
 * 
 * This service tracks PII scrubbing operations for development monitoring.
 * Shows what types of PII were found and scrubbed WITHOUT revealing the actual content.
 */

/**
 * PII audit entry for tracking scrubbing operations
 */
export interface PIIAuditEntry {
  id: string;
  timestamp: Date;
  sourceType: 'resume' | 'job-description' | 'chat-context';
  originalLength: number;
  scrubbedLength: number;
  piiFound: {
    category: string;
    count: number;
    examples?: string[]; // Safe examples like "email pattern detected" not actual emails
  }[];
  hasCriticalPII: boolean;
  cached: boolean;
  processingDuration: number;
}

/**
 * PII audit statistics
 */
export interface PIIAuditStats {
  totalOperations: number;
  criticalPIIBlocked: number;
  totalPIIItemsFound: number;
  cacheBlockedDueToPII: number;
  averageProcessingTime: number;
  topPIICategories: Array<{ category: string; count: number }>;
}

/**
 * Service for tracking and monitoring PII scrubbing operations
 */
class PIIAuditService {
  private auditEntries: PIIAuditEntry[] = [];
  private listeners: Array<(entries: PIIAuditEntry[]) => void> = [];
  private statsListeners: Array<(stats: PIIAuditStats) => void> = [];
  private maxEntries = 100; // Keep last 100 operations

  constructor() {
    // Initialize empty audit log for production use
    // Mock functionality disabled to remove test data
  }

  // Disabled mock data initialization for production
  // @ts-expect-error - Unused method kept for potential future development use
  private initializeMockData() {
    const now = new Date();
    
    // Create some realistic mock audit entries
    const mockEntries: PIIAuditEntry[] = [
      {
        id: 'audit_' + Date.now() + '_1',
        timestamp: new Date(now.getTime() - 1800000), // 30 min ago
        sourceType: 'resume',
        originalLength: 2847,
        scrubbedLength: 2723,
        piiFound: [
          { category: 'email', count: 1, examples: ['email pattern detected'] },
          { category: 'phone', count: 1, examples: ['US phone number format'] },
          { category: 'address', count: 1, examples: ['street address pattern'] }
        ],
        hasCriticalPII: true,
        cached: false, // Critical PII blocked caching
        processingDuration: 23
      },
      {
        id: 'audit_' + Date.now() + '_2',
        timestamp: new Date(now.getTime() - 900000), // 15 min ago
        sourceType: 'job-description',
        originalLength: 1456,
        scrubbedLength: 1398,
        piiFound: [
          { category: 'socialMedia', count: 1, examples: ['LinkedIn profile URL'] },
          { category: 'website', count: 1, examples: ['company website URL'] }
        ],
        hasCriticalPII: false,
        cached: true,
        processingDuration: 15
      },
      {
        id: 'audit_' + Date.now() + '_3',
        timestamp: new Date(now.getTime() - 300000), // 5 min ago
        sourceType: 'chat-context',
        originalLength: 892,
        scrubbedLength: 892,
        piiFound: [], // No PII found
        hasCriticalPII: false,
        cached: true,
        processingDuration: 8
      },
      {
        id: 'audit_' + Date.now() + '_4',
        timestamp: new Date(now.getTime() - 120000), // 2 min ago
        sourceType: 'resume',
        originalLength: 3245,
        scrubbedLength: 3089,
        piiFound: [
          { category: 'email', count: 2, examples: ['personal email', 'work email'] },
          { category: 'phone', count: 1, examples: ['mobile number'] },
          { category: 'name', count: 3, examples: ['full name patterns', 'reference names'] },
          { category: 'address', count: 2, examples: ['home address', 'mailing address'] }
        ],
        hasCriticalPII: true,
        cached: false,
        processingDuration: 31
      }
    ];

    this.auditEntries = mockEntries;
  }

  /**
   * Add a new PII audit entry
   */
  addAuditEntry(entry: Omit<PIIAuditEntry, 'id' | 'timestamp'>): void {
    const auditEntry: PIIAuditEntry = {
      ...entry,
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      timestamp: new Date()
    };

    this.auditEntries.unshift(auditEntry); // Add to beginning

    // Keep only the most recent entries
    if (this.auditEntries.length > this.maxEntries) {
      this.auditEntries = this.auditEntries.slice(0, this.maxEntries);
    }

    this.notifyListeners();
    this.notifyStatsListeners();
  }

  /**
   * Get all audit entries
   */
  getAuditEntries(): PIIAuditEntry[] {
    return [...this.auditEntries];
  }

  /**
   * Get audit statistics
   */
  getStats(): PIIAuditStats {
    if (this.auditEntries.length === 0) {
      return {
        totalOperations: 0,
        criticalPIIBlocked: 0,
        totalPIIItemsFound: 0,
        cacheBlockedDueToPII: 0,
        averageProcessingTime: 0,
        topPIICategories: []
      };
    }

    const criticalPIIBlocked = this.auditEntries.filter(entry => entry.hasCriticalPII).length;
    const cacheBlockedDueToPII = this.auditEntries.filter(entry => entry.hasCriticalPII && !entry.cached).length;
    const totalPIIItemsFound = this.auditEntries.reduce(
      (sum, entry) => sum + entry.piiFound.reduce((piiSum, pii) => piiSum + pii.count, 0),
      0
    );
    const averageProcessingTime = this.auditEntries.reduce((sum, entry) => sum + entry.processingDuration, 0) / this.auditEntries.length;

    // Calculate top PII categories
    const categoryCount: { [key: string]: number } = {};
    this.auditEntries.forEach(entry => {
      entry.piiFound.forEach(pii => {
        categoryCount[pii.category] = (categoryCount[pii.category] || 0) + pii.count;
      });
    });

    const topPIICategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalOperations: this.auditEntries.length,
      criticalPIIBlocked,
      totalPIIItemsFound,
      cacheBlockedDueToPII,
      averageProcessingTime: Math.round(averageProcessingTime * 10) / 10,
      topPIICategories
    };
  }

  /**
   * Clear all audit entries
   */
  clearAuditEntries(): void {
    this.auditEntries = [];
    this.notifyListeners();
    this.notifyStatsListeners();
  }

  /**
   * Subscribe to audit entries updates
   */
  addEntriesListener(listener: (entries: PIIAuditEntry[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to stats updates
   */
  addStatsListener(listener: (stats: PIIAuditStats) => void): () => void {
    this.statsListeners.push(listener);
    return () => {
      const index = this.statsListeners.indexOf(listener);
      if (index > -1) {
        this.statsListeners.splice(index, 1);
      }
    };
  }

  /**
   * Simulate a PII audit entry for testing
   */
  simulateAuditEntry(): void {
    const sourceTypes: ('resume' | 'job-description' | 'chat-context')[] = ['resume', 'job-description', 'chat-context'];
    const piiCategories = ['email', 'phone', 'address', 'name', 'socialMedia', 'website', 'ssn'];
    
    const sourceType = sourceTypes[Math.floor(Math.random() * sourceTypes.length)];
    const originalLength = Math.floor(Math.random() * 5000) + 500;
    const hasCriticalPII = Math.random() > 0.6;
    
    // Generate random PII found
    const piiFound: Array<{ category: string; count: number; examples: string[] }> = [];
    const numCategories = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numCategories; i++) {
      const category = piiCategories[Math.floor(Math.random() * piiCategories.length)];
      if (!piiFound.find(p => p.category === category)) {
        piiFound.push({
          category,
          count: Math.floor(Math.random() * 3) + 1,
          examples: [this.getSafeExample(category)]
        });
      }
    }
    
    const scrubbedLength = originalLength - (piiFound.reduce((sum, pii) => sum + pii.count * 15, 0));
    
    this.addAuditEntry({
      sourceType,
      originalLength,
      scrubbedLength,
      piiFound,
      hasCriticalPII,
      cached: !hasCriticalPII && Math.random() > 0.2,
      processingDuration: Math.floor(Math.random() * 50) + 5
    });
  }

  private getSafeExample(category: string): string {
    const examples: { [key: string]: string[] } = {
      email: ['email pattern detected', 'personal email format', 'work email format'],
      phone: ['US phone format', 'international number', 'mobile number pattern'],
      address: ['street address pattern', 'city, state format', 'postal address'],
      name: ['full name pattern', 'first name detected', 'surname pattern'],
      socialMedia: ['LinkedIn URL', 'GitHub profile', 'social media link'],
      website: ['personal website', 'portfolio URL', 'company site'],
      ssn: ['SSN pattern', 'social security format'],
      creditCard: ['credit card pattern', 'card number format'],
      driversLicense: ['license number pattern', 'ID number format']
    };
    
    const categoryExamples = examples[category] || ['PII pattern detected'];
    return categoryExamples[Math.floor(Math.random() * categoryExamples.length)];
  }

  private notifyListeners(): void {
    const entries = this.getAuditEntries();
    this.listeners.forEach(listener => listener(entries));
  }

  private notifyStatsListeners(): void {
    const stats = this.getStats();
    this.statsListeners.forEach(listener => listener(stats));
  }
}

// Export singleton instance
export const piiAuditService = new PIIAuditService();

/**
 * Utility functions for PII audit operations
 */
export const PIIAuditUtils = {
  /**
   * Format source type for display
   */
  formatSourceType: (sourceType: string): string => {
    const typeMap: { [key: string]: string } = {
      'resume': 'Resume',
      'job-description': 'Job Description', 
      'chat-context': 'Chat Context'
    };
    return typeMap[sourceType] || sourceType;
  },

  /**
   * Format PII category for display
   */
  formatPIICategory: (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'email': 'Email Addresses',
      'phone': 'Phone Numbers',
      'address': 'Addresses',
      'name': 'Names',
      'socialMedia': 'Social Media',
      'website': 'Websites',
      'ssn': 'Social Security Numbers',
      'creditCard': 'Credit Cards',
      'driversLicense': 'Driver Licenses'
    };
    return categoryMap[category] || category;
  },

  /**
   * Get category icon
   */
  getCategoryIcon: (category: string): string => {
    const iconMap: { [key: string]: string } = {
      'email': '📧',
      'phone': '📱',
      'address': '🏠',
      'name': '👤',
      'socialMedia': '🔗',
      'website': '🌐',
      'ssn': '🆔',
      'creditCard': '💳',
      'driversLicense': '🪪'
    };
    return iconMap[category] || '🔒';
  },

  /**
   * Calculate data reduction percentage
   */
  calculateReductionPercentage: (original: number, scrubbed: number): number => {
    if (original === 0) return 0;
    return Math.round(((original - scrubbed) / original) * 100);
  },

  /**
   * Format time ago
   */
  formatTimeAgo: (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }
};