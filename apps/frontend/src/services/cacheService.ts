/**
 * @fileoverview Cache monitoring service for DevPanel
 * 
 * This service provides cache monitoring functionality for the development
 * debug panel to track cache hits/misses, view cached entries, and manage
 * cache data during development.
 */

/**
 * Cache statistics interface
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  memoryUsage: number;
}

/**
 * Cache entry interface for display
 */
export interface CacheEntryInfo {
  key: string;
  size: number;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessed: Date;
  type: string;
  hasResumeData: boolean;
  hasJobData: boolean;
  piiScrubbed: boolean;
}

/**
 * Mock cache data for development
 */
class CacheMonitorService {
  private mockStats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalEntries: 0,
    memoryUsage: 0
  };

  private mockEntries: CacheEntryInfo[] = [];
  private listeners: Array<(stats: CacheStats) => void> = [];
  private entryListeners: Array<(entries: CacheEntryInfo[]) => void> = [];

  constructor() {
    // Initialize empty cache for production use
    // Mock functionality disabled to remove test data
  }

  // Disabled mock data initialization for production
  // @ts-expect-error - Unused method kept for potential future development use
  private initializeMockData() {
    const now = new Date();
    
    // Create some mock cache entries
    const mockEntries: CacheEntryInfo[] = [
      {
        key: 'resume:abc123:job:def456:comprehensive',
        size: 15420,
        createdAt: new Date(now.getTime() - 3600000), // 1 hour ago
        expiresAt: new Date(now.getTime() + 1800000), // 30 min from now
        accessCount: 3,
        lastAccessed: new Date(now.getTime() - 300000), // 5 min ago
        type: 'comprehensive',
        hasResumeData: true,
        hasJobData: true,
        piiScrubbed: true
      },
      {
        key: 'resume:xyz789:job:ghi012:atsScore,technicalQuestions',
        size: 8240,
        createdAt: new Date(now.getTime() - 1800000), // 30 min ago
        expiresAt: new Date(now.getTime() + 1800000), // 30 min from now
        accessCount: 1,
        lastAccessed: new Date(now.getTime() - 900000), // 15 min ago
        type: 'partial',
        hasResumeData: true,
        hasJobData: true,
        piiScrubbed: true
      },
      {
        key: 'resume:pqr345:job:stu678:behavioralQuestions',
        size: 5680,
        createdAt: new Date(now.getTime() - 900000), // 15 min ago
        expiresAt: new Date(now.getTime() + 2700000), // 45 min from now
        accessCount: 2,
        lastAccessed: new Date(now.getTime() - 180000), // 3 min ago
        type: 'partial',
        hasResumeData: true,
        hasJobData: true,
        piiScrubbed: true
      }
    ];

    this.mockEntries = mockEntries;
    this.mockStats = {
      hits: 15,
      misses: 8,
      hitRate: 0.65,
      totalEntries: mockEntries.length,
      memoryUsage: mockEntries.reduce((total, entry) => total + entry.size, 0)
    };
  }

  // Disabled cache activity simulation for production
  // @ts-expect-error - Unused method kept for potential future development use
  private simulateCacheActivity() {
    // Simulate periodic cache activity for development
    setInterval(() => {
      // Randomly simulate cache hits or misses
      if (Math.random() > 0.7) {
        this.mockStats.hits += 1;
        
        // Update access count for random entry
        if (this.mockEntries.length > 0) {
          const randomEntry = this.mockEntries[Math.floor(Math.random() * this.mockEntries.length)];
          randomEntry.accessCount += 1;
          randomEntry.lastAccessed = new Date();
        }
      } else if (Math.random() > 0.8) {
        this.mockStats.misses += 1;
      }
      
      // Recalculate hit rate
      const totalRequests = this.mockStats.hits + this.mockStats.misses;
      this.mockStats.hitRate = totalRequests > 0 ? this.mockStats.hits / totalRequests : 0;
      
      // Notify listeners
      this.notifyListeners();
    }, 5000); // Every 5 seconds

    // Simulate new cache entries occasionally
    setInterval(() => {
      if (Math.random() > 0.6) {
        this.addMockCacheEntry();
      }
    }, 15000); // Every 15 seconds

    // Simulate cache cleanup/expiry
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 30000); // Every 30 seconds
  }

  private addMockCacheEntry() {
    const now = new Date();
    const analysisTypes = ['comprehensive', 'atsScore', 'technicalQuestions', 'behavioralQuestions', 'presentationTopics'];
    const randomType = analysisTypes[Math.floor(Math.random() * analysisTypes.length)];
    
    const newEntry: CacheEntryInfo = {
      key: `resume:${this.generateRandomId()}:job:${this.generateRandomId()}:${randomType}`,
      size: Math.floor(Math.random() * 20000) + 3000,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 3600000), // 1 hour from now
      accessCount: 0,
      lastAccessed: now,
      type: randomType === 'comprehensive' ? 'comprehensive' : 'partial',
      hasResumeData: true,
      hasJobData: true,
      piiScrubbed: true
    };

    this.mockEntries.unshift(newEntry); // Add to beginning
    this.mockStats.totalEntries = this.mockEntries.length;
    this.mockStats.memoryUsage = this.mockEntries.reduce((total, entry) => total + entry.size, 0);
    
    this.notifyEntryListeners();
  }

  private cleanupExpiredEntries() {
    const now = new Date();
    const initialCount = this.mockEntries.length;
    
    this.mockEntries = this.mockEntries.filter(entry => entry.expiresAt > now);
    
    if (this.mockEntries.length !== initialCount) {
      this.mockStats.totalEntries = this.mockEntries.length;
      this.mockStats.memoryUsage = this.mockEntries.reduce((total, entry) => total + entry.size, 0);
      this.notifyEntryListeners();
    }
  }

  private generateRandomId(): string {
    return Math.random().toString(36).substr(2, 6);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.mockStats));
  }

  private notifyEntryListeners() {
    this.entryListeners.forEach(listener => listener([...this.mockEntries]));
  }

  /**
   * Get current cache statistics
   */
  getStats(): CacheStats {
    return { ...this.mockStats };
  }

  /**
   * Get all cache entries
   */
  getEntries(): CacheEntryInfo[] {
    return [...this.mockEntries];
  }

  /**
   * Subscribe to cache stats updates
   */
  addStatsListener(listener: (stats: CacheStats) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to cache entries updates
   */
  addEntriesListener(listener: (entries: CacheEntryInfo[]) => void): () => void {
    this.entryListeners.push(listener);
    return () => {
      const index = this.entryListeners.indexOf(listener);
      if (index > -1) {
        this.entryListeners.splice(index, 1);
      }
    };
  }

  /**
   * Clear all cache entries (for testing)
   */
  clearCache(): void {
    this.mockEntries = [];
    this.mockStats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalEntries: 0,
      memoryUsage: 0
    };
    this.notifyListeners();
    this.notifyEntryListeners();
  }

  /**
   * Force a cache cleanup
   */
  cleanup(): number {
    const initialCount = this.mockEntries.length;
    this.cleanupExpiredEntries();
    return initialCount - this.mockEntries.length;
  }

  /**
   * Simulate cache hit for testing
   */
  simulateHit(): void {
    this.mockStats.hits += 1;
    const totalRequests = this.mockStats.hits + this.mockStats.misses;
    this.mockStats.hitRate = totalRequests > 0 ? this.mockStats.hits / totalRequests : 0;
    
    if (this.mockEntries.length > 0) {
      const randomEntry = this.mockEntries[Math.floor(Math.random() * this.mockEntries.length)];
      randomEntry.accessCount += 1;
      randomEntry.lastAccessed = new Date();
    }
    
    this.notifyListeners();
    this.notifyEntryListeners();
  }

  /**
   * Simulate cache miss for testing
   */
  simulateMiss(): void {
    this.mockStats.misses += 1;
    const totalRequests = this.mockStats.hits + this.mockStats.misses;
    this.mockStats.hitRate = totalRequests > 0 ? this.mockStats.hits / totalRequests : 0;
    this.notifyListeners();
  }
}

// Export singleton instance
export const cacheMonitor = new CacheMonitorService();

/**
 * Utility functions for cache operations
 */
export const CacheServiceUtils = {
  /**
   * Format cache key for display
   */
  formatCacheKey: (key: string): string => {
    if (key.length <= 50) return key;
    return key.substring(0, 25) + '...' + key.substring(key.length - 22);
  },

  /**
   * Format memory size for display
   */
  formatMemorySize: (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  },

  /**
   * Format time ago for display
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
  },

  /**
   * Get expiry status
   */
  getExpiryStatus: (expiresAt: Date): { status: 'expired' | 'expiring' | 'fresh'; timeLeft: string } => {
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return { status: 'expired', timeLeft: 'expired' };
    }
    
    const minutes = Math.floor(timeLeft / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 10) {
      return { status: 'expiring', timeLeft: `${minutes}m left` };
    }
    
    if (hours > 0) {
      return { status: 'fresh', timeLeft: `${hours}h ${minutes % 60}m left` };
    }
    
    return { status: 'fresh', timeLeft: `${minutes}m left` };
  }
};