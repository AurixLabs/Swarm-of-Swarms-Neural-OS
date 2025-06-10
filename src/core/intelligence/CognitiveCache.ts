
/**
 * Cognitive Cache
 * Provides memory caching for cognitive operations to improve performance
 */
export class CognitiveCache {
  private cache: Map<string, any> = new Map();
  private maxSize: number = 1000;
  private ttl: number = 300000; // 5 minutes default TTL
  
  /**
   * Set a value in the cache
   */
  set(key: string, value: any, customTtl?: number): void {
    // Clean up if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: customTtl || this.ttl
    });
  }
  
  /**
   * Get a value from the cache
   */
  get(key: string): any {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    if (!this.cache.has(key)) {
      return false;
    }
    
    const entry = this.cache.get(key);
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Remove a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Set the maximum cache size
   */
  setMaxSize(size: number): void {
    this.maxSize = size;
    this.cleanup();
  }
  
  /**
   * Set the default TTL for cache entries
   */
  setDefaultTtl(ttl: number): void {
    this.ttl = ttl;
  }
}

// Export singleton instance
export const cognitiveCache = new CognitiveCache();
