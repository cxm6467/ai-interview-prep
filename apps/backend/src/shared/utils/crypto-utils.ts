/**
 * Cryptographic utility functions
 * 
 * Centralized crypto operations using Node.js built-in crypto module
 * for consistent hash generation across the application.
 */

import crypto from 'crypto';

/**
 * Generate a SHA-256 hash of the input content
 * 
 * @param content - Content to hash
 * @param length - Optional length to truncate hash (default: full hash)
 * @returns Hex-encoded hash string
 */
export function generateHash(content: string, length?: number): string {
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return length ? hash.substring(0, length) : hash;
}

/**
 * Generate a content hash for caching purposes
 * 
 * @param content - Content to hash
 * @returns Short hex-encoded hash (16 characters)
 */
export function generateContentHash(content: string): string {
  return generateHash(content, 16);
}

/**
 * Generate an ETag for HTTP caching
 * 
 * @param content - Content to generate ETag from
 * @returns ETag string in quotes
 */
export function generateETag(content: string): string {
  const hash = generateHash(JSON.stringify(content), 16);
  return `"${hash}"`;
}

/**
 * Generate a secure cache key
 * 
 * @param components - Array of components to include in the key
 * @param prefix - Optional prefix for the key
 * @returns Secure cache key
 */
export function generateCacheKey(components: string[], prefix?: string): string {
  const baseKey = components.join(':');
  const keyWithPrefix = prefix ? `${prefix}:${baseKey}` : baseKey;
  return generateHash(keyWithPrefix, 32);
}

/**
 * Generate a unique analysis ID
 * 
 * @returns Unique analysis ID
 */
export function generateAnalysisId(): string {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${randomBytes}`;
}