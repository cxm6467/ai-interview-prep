/**
 * @fileoverview File Cache Service for uploaded documents
 * 
 * This service caches parsed file content to avoid re-parsing the same files.
 * Uses file content hash and metadata for cache keys.
 */

/**
 * Cached file entry
 */
export interface CachedFileEntry {
  fileHash: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  parsedContent: string;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

/**
 * File cache statistics
 */
export interface FileCacheStats {
  totalFiles: number;
  totalSize: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
}

/**
 * Service for caching parsed file content
 */
class FileCacheService {
  private cache = new Map<string, CachedFileEntry>();
  private stats = {
    hits: 0,
    misses: 0
  };
  private listeners: Array<(entries: CachedFileEntry[]) => void> = [];
  private statsListeners: Array<(stats: FileCacheStats) => void> = [];
  private maxCacheSize = 50; // Maximum number of files to cache
  private maxCacheMemory = 10 * 1024 * 1024; // 10MB max cache size

  constructor() {
    // Cache starts empty - files will be added when processed
  }

  /**
   * Generate a hash for file content
   */
  private async generateFileHash(content: string | ArrayBuffer): Promise<string> {
    const encoder = new TextEncoder();
    const data = typeof content === 'string' ? encoder.encode(content) : content;
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }

  /**
   * Check if a file is cached and return parsed content
   */
  async getFromCache(file: File): Promise<string | null> {
    try {
      // Create a hash from file content
      const fileContent = await file.arrayBuffer();
      const fileHash = await this.generateFileHash(fileContent);
      
      const cached = this.cache.get(fileHash);
      if (cached) {
        // Update access info
        cached.lastAccessed = new Date();
        cached.accessCount++;
        
        this.stats.hits++;
        
        this.notifyListeners();
        this.notifyStatsListeners();
        
        return cached.parsedContent;
      }
      
      this.stats.misses++;
      this.notifyStatsListeners();
      return null;
    } catch (error) {
      console.error('Error checking file cache:', error);
      this.stats.misses++;
      this.notifyStatsListeners();
      return null;
    }
  }

  /**
   * Add parsed file content to cache
   */
  async addToCache(file: File, parsedContent: string): Promise<void> {
    try {
      // Generate hash from file content
      const fileContent = await file.arrayBuffer();
      const fileHash = await this.generateFileHash(fileContent);
      
      // Check if we need to evict entries
      this.evictIfNecessary();
      
      const entry: CachedFileEntry = {
        fileHash,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        parsedContent,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 1
      };
      
      this.cache.set(fileHash, entry);
      this.notifyListeners();
      this.notifyStatsListeners();
    } catch (error) {
      console.error('Error adding to file cache:', error);
    }
  }

  /**
   * Evict entries if cache is too large
   */
  private evictIfNecessary(): void {
    // Check count limit
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldestEntry();
    }
    
    // Check memory limit
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.fileSize + entry.parsedContent.length * 2, 0);
    
    if (totalSize > this.maxCacheMemory) {
      this.evictLargestEntry();
    }
  }

  /**
   * Evict the oldest cache entry
   */
  private evictOldestEntry(): void {
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
   * Evict the largest cache entry
   */
  private evictLargestEntry(): void {
    let largestKey = '';
    let largestSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      const entrySize = entry.fileSize + entry.parsedContent.length * 2;
      if (entrySize > largestSize) {
        largestSize = entrySize;
        largestKey = key;
      }
    }
    
    if (largestKey) {
      this.cache.delete(largestKey);
    }
  }

  /**
   * Get all cached files
   */
  getCachedFiles(): CachedFileEntry[] {
    return Array.from(this.cache.values())
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
  }

  /**
   * Get cache statistics
   */
  getStats(): FileCacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.fileSize, 0);
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      totalFiles: entries.length,
      totalSize,
      cacheHits: this.stats.hits,
      cacheMisses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Clear all cached files
   */
  clearCache(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
    this.notifyListeners();
    this.notifyStatsListeners();
  }

  /**
   * Remove a specific file from cache
   */
  removeFromCache(fileHash: string): boolean {
    const removed = this.cache.delete(fileHash);
    if (removed) {
      this.notifyListeners();
      this.notifyStatsListeners();
    }
    return removed;
  }

  /**
   * Subscribe to cache entries updates
   */
  addEntriesListener(listener: (entries: CachedFileEntry[]) => void): () => void {
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
  addStatsListener(listener: (stats: FileCacheStats) => void): () => void {
    this.statsListeners.push(listener);
    return () => {
      const index = this.statsListeners.indexOf(listener);
      if (index > -1) {
        this.statsListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    const entries = this.getCachedFiles();
    this.listeners.forEach(listener => listener(entries));
  }

  private notifyStatsListeners(): void {
    const stats = this.getStats();
    this.statsListeners.forEach(listener => listener(stats));
  }
}

// Export singleton instance
export const fileCacheService = new FileCacheService();

/**
 * Utility functions for file cache operations
 */
export const FileCacheUtils = {
  /**
   * Format file size for display
   */
  formatFileSize: (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  },


  /**
   * Get file type icon
   */
  getFileTypeIcon: (fileType: string): string => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📎';
  },

  /**
   * Format filename for display (truncate if too long)
   */
  formatFileName: (fileName: string, maxLength = 30): string => {
    if (fileName.length <= maxLength) return fileName;
    const ext = fileName.split('.').pop();
    const name = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncated = name.substring(0, maxLength - 3 - (ext?.length || 0));
    return `${truncated}...${ext ? `.${ext}` : ''}`;
  },

};