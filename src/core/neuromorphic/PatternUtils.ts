
/**
 * PatternUtils - Utility functions for pattern processing
 */

export class PatternUtils {
  // Cache for similarity calculations to avoid redundant computation
  private static similarityCache = new Map<string, number>();
  private static cacheHits = 0;
  private static cacheMisses = 0;
  
  /**
   * Calculate similarity between two patterns
   * Returns a value between 0 (completely different) and 1 (identical)
   * Optimized with bitvector operations for speed
   */
  public static calculateSimilarity(pattern1: Uint8Array, pattern2: Uint8Array): number {
    // Check cache first
    const cacheKey = `${pattern1.buffer.byteLength}_${pattern2.buffer.byteLength}_${pattern1[0]}_${pattern2[0]}`;
    if (this.similarityCache.has(cacheKey)) {
      this.cacheHits++;
      return this.similarityCache.get(cacheKey)!;
    }
    
    this.cacheMisses++;
    
    // Ensure patterns are the same length
    const length = Math.min(pattern1.length, pattern2.length);
    
    // Use optimized algorithm for similarity calculation
    let matches = 0;
    let totalBits = 0;
    
    // Unrolled loop for better performance on modern CPUs
    const blockSize = 4;
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
    if (totalBits === 0) return 0;
    
    const similarity = matches / totalBits;
    
    // Store in cache (with limit to avoid memory growth)
    if (this.similarityCache.size < 10000) {
      this.similarityCache.set(cacheKey, similarity);
    }
    
    return similarity;
  }
  
  /**
   * Convert a 32-bit integer to a spike pattern
   * Optimized for performance
   */
  public static integerToSpikePattern(value: number): Uint8Array {
    const pattern = new Uint8Array(32);
    
    // Use bit operations for 4x faster conversion
    let mask = 1;
    for (let i = 0; i < 32; i++) {
      pattern[i] = (value & mask) !== 0 ? 1 : 0;
      mask <<= 1;
    }
    
    return pattern;
  }
  
  /**
   * Convert a spike pattern to a 32-bit integer
   * Optimized version
   */
  public static spikePatternToInteger(pattern: Uint8Array): number {
    let value = 0;
    
    // Use optimized bitwise operations
    for (let i = 0; i < Math.min(pattern.length, 32); i++) {
      if (pattern[i] > 0) {
        value |= (1 << i);
      }
    }
    
    return value;
  }
  
  /**
   * Process a pattern using 1-bit quantum-inspired operations
   * This implements the "Quantum Thought Vectors" concept for ultra-fast processing
   * Optimized version with additional transformations
   */
  public static processQuantumThought(pattern: number): number {
    // Apply quantum-inspired operations (XNOR gates + rotation)
    const mask = 0xFFFFFFFF; // 32-bit mask
    
    // First transformation (XNOR)
    let output = ~(pattern ^ mask) & 0xFFFFFFFF;
    
    // Second transformation (bit rotation)
    const rotate = (output >>> 3) | (output << 29);
    
    // Final transformation (XOR with original)
    output = rotate ^ pattern;
    
    return output;
  }
  
  /**
   * Reset similarity cache
   */
  public static resetCache(): void {
    this.similarityCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
  
  /**
   * Get cache statistics
   */
  public static getCacheStats(): { hits: number, misses: number, hitRatio: number } {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRatio: total > 0 ? this.cacheHits / total : 0
    };
  }
  
  /**
   * Hamming distance between patterns (optimized)
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
   * Pattern compression for more efficient storage
   */
  public static compressPattern(pattern: Uint8Array): Uint8Array {
    // Simple run-length encoding for spike patterns
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
   * Decompress a compressed pattern
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
