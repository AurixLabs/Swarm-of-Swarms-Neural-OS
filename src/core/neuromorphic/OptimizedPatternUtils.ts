
/**
 * OptimizedPatternUtils - High-performance utility functions for pattern processing
 */

export class OptimizedPatternUtils {
  // Cache for similarity calculations
  private static readonly similarityCache = new Map<string, number>();
  private static cacheHits = 0;
  private static cacheMisses = 0;
  
  /**
   * Calculate similarity between two patterns (optimized)
   */
  public static calculateSimilarity(pattern1: Uint8Array, pattern2: Uint8Array): number {
    // Generate cache key from patterns
    const cacheKey = this.generateCacheKey(pattern1, pattern2);
    
    // Check cache first for better performance
    if (this.similarityCache.has(cacheKey)) {
      this.cacheHits++;
      return this.similarityCache.get(cacheKey)!;
    }
    
    this.cacheMisses++;
    
    // Calculate similarity using vectorized operations
    const similarity = this.computeSimilarity(pattern1, pattern2);
    
    // Store in cache (with limit to avoid memory growth)
    if (this.similarityCache.size < 10000) {
      this.similarityCache.set(cacheKey, similarity);
    }
    
    return similarity;
  }
  
  /**
   * Compute cache key for pattern similarity
   */
  private static generateCacheKey(pattern1: Uint8Array, pattern2: Uint8Array): string {
    return `${pattern1.byteLength}_${pattern2.byteLength}_${pattern1[0]}_${pattern2[0]}`;
  }
  
  /**
   * Compute similarity between patterns
   */
  private static computeSimilarity(pattern1: Uint8Array, pattern2: Uint8Array): number {
    const length = Math.min(pattern1.length, pattern2.length);
    let matches = 0;
    let totalBits = 0;
    
    // Use block processing for better CPU cache utilization
    const blockSize = 8;
    const fullBlocks = Math.floor(length / blockSize);
    
    for (let i = 0; i < fullBlocks; i++) {
      const idx = i * blockSize;
      
      for (let j = 0; j < blockSize; j++) {
        const index = idx + j;
        if (pattern1[index] > 0 && pattern2[index] > 0) {
          matches++;
        }
        if (pattern1[index] > 0 || pattern2[index] > 0) {
          totalBits++;
        }
      }
    }
    
    // Handle remaining elements
    for (let i = fullBlocks * blockSize; i < length; i++) {
      if (pattern1[i] > 0 && pattern2[i] > 0) {
        matches++;
      }
      if (pattern1[i] > 0 || pattern2[i] > 0) {
        totalBits++;
      }
    }
    
    // If no active bits in either pattern, they are considered 0% similar
    return totalBits === 0 ? 0 : matches / totalBits;
  }
  
  /**
   * Convert integer to spike pattern
   */
  public static integerToSpikePattern(value: number): Uint8Array {
    const pattern = new Uint8Array(32);
    
    // Use bit operations for faster conversion
    let mask = 1;
    for (let i = 0; i < 32; i++) {
      pattern[i] = (value & mask) !== 0 ? 1 : 0;
      mask <<= 1;
    }
    
    return pattern;
  }
  
  /**
   * Convert spike pattern to integer
   */
  public static spikePatternToInteger(pattern: Uint8Array): number {
    let value = 0;
    
    for (let i = 0; i < Math.min(pattern.length, 32); i++) {
      if (pattern[i] > 0) {
        value |= (1 << i);
      }
    }
    
    return value;
  }
  
  /**
   * Process pattern using quantum-inspired operations
   */
  public static processQuantumThought(pattern: number): number {
    // Apply XNOR gate operation and rotation
    const mask = 0xFFFFFFFF;
    const output = ~(pattern ^ mask) & 0xFFFFFFFF;
    const rotate = (output >>> 3) | (output << 29);
    
    return rotate ^ pattern;
  }
  
  /**
   * Reset cache statistics
   */
  public static resetCache(): void {
    this.similarityCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
  
  /**
   * Get cache usage statistics
   */
  public static getCacheStats(): { hits: number; misses: number; hitRatio: number } {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRatio: total > 0 ? this.cacheHits / total : 0
    };
  }
  
  /**
   * Calculate Hamming distance between patterns
   */
  public static hammingDistance(pattern1: Uint8Array, pattern2: Uint8Array): number {
    const length = Math.min(pattern1.length, pattern2.length);
    let distance = 0;
    
    for (let i = 0; i < length; i++) {
      if (pattern1[i] !== pattern2[i]) {
        distance++;
      }
    }
    
    return distance;
  }
  
  /**
   * Compress pattern for storage efficiency
   */
  public static compressPattern(pattern: Uint8Array): Uint8Array {
    const result = new Array<number>();
    let count = 1;
    let current = pattern[0];
    
    for (let i = 1; i < pattern.length; i++) {
      if (pattern[i] === current && count < 255) {
        count++;
      } else {
        result.push(current, count);
        current = pattern[i];
        count = 1;
      }
    }
    
    result.push(current, count);
    return new Uint8Array(result);
  }
  
  /**
   * Decompress pattern
   */
  public static decompressPattern(compressed: Uint8Array): Uint8Array {
    const result = new Array<number>();
    
    for (let i = 0; i < compressed.length; i += 2) {
      const value = compressed[i];
      const count = compressed[i + 1];
      
      for (let j = 0; j < count; j++) {
        result.push(value);
      }
    }
    
    return new Uint8Array(result);
  }
}
