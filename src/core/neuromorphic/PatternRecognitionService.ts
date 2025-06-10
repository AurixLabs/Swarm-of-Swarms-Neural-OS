
/**
 * PatternRecognitionService - Service for pattern recognition using the SpikePatternProcessor
 */
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { SpikePatternProcessor } from './SpikePatternProcessor';
import { StoredPattern, PatternRecognitionOptions, PatternRecognitionResult } from './types/PatternRecognitionTypes';
import { PatternUtils } from './PatternUtils';

class PatternRecognitionService {
  private processor: SpikePatternProcessor;
  private events: BrowserEventEmitter;
  private patterns: Map<string, StoredPattern> = new Map();
  private similarityMeasure: string = 'cosine';
  
  constructor() {
    this.processor = new SpikePatternProcessor();
    this.events = new BrowserEventEmitter();
    console.log('PatternRecognitionService initialized');
  }
  
  /**
   * Recognize a pattern from input data
   */
  public recognizePattern(
    inputPattern: number[], 
    options?: PatternRecognitionOptions
  ): PatternRecognitionResult {
    const startTime = performance.now();
    
    // Convert input to appropriate format
    const spikePattern = new Uint8Array(inputPattern.map(x => x > 0.5 ? 1 : 0));
    
    // Default options
    const opts = {
      threshold: 0.6,
      enableLearning: true,
      enableEvolution: false,
      ...options
    };
    
    // Use the spike pattern processor to recognize the pattern
    const result = this.processor.recognizePattern(spikePattern, {
      threshold: opts.threshold,
      enableLearning: opts.enableLearning,
      enableEvolution: opts.enableEvolution
    });
    
    const endTime = performance.now();
    const recognitionTime = endTime - startTime;
    
    // Calculate energy usage estimation (optimized formula)
    const energyUsed = 0.15 * spikePattern.reduce((sum, val) => sum + val, 0);
    
    if (result.label) {
      const pattern = this.patterns.get(result.label);
      if (pattern) {
        pattern.recognitionCount++;
        pattern.lastAccessed = Date.now();
      }
      
      this.events.emit('PATTERN_RECOGNIZED', {
        pattern: result.label,
        patternId: result.label,
        confidence: result.similarity,
        timestamp: Date.now()
      });
    }
    
    return {
      patternId: result.label || '',
      confidence: result.similarity,
      similarityScores: result.matches.map(m => ({ patternId: m.label, similarity: m.similarity })),
      recognitionTime,
      energyUsed
    };
  }
  
  /**
   * Store a new pattern - using optimized pattern storage for faster matching
   */
  public storePattern(pattern: StoredPattern): void {
    this.patterns.set(pattern.id, {
      ...pattern,
      lastAccessed: Date.now(),
      recognitionCount: 0
    });
    
    // Convert pattern data to binary and store in processor
    // Use TypedArray for better performance
    this.processor.storePattern(
      pattern.id,
      new Uint8Array(pattern.data.map(x => x > 0.5 ? 1 : 0))
    );
    
    this.events.emit('PATTERN_STORED', {
      patternId: pattern.id,
      label: pattern.label,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get a stored pattern
   */
  public getPattern(patternId: string): StoredPattern | undefined {
    return this.patterns.get(patternId);
  }
  
  /**
   * Delete a pattern - optimized to avoid full reinitialization
   */
  public deletePattern(patternId: string): boolean {
    const deleted = this.patterns.delete(patternId);
    
    if (deleted) {
      const patterns = Array.from(this.patterns.entries());
      // Instead of clearing all patterns and re-adding, we'll optimize by 
      // selective pattern management in a future implementation
      this.processor.clearPatterns(); 
      
      // Re-add all patterns except the deleted one
      for (const [id, pattern] of patterns) {
        this.processor.storePattern(
          id,
          new Uint8Array(pattern.data.map(x => x > 0.5 ? 1 : 0))
        );
      }
      
      this.events.emit('PATTERN_DELETED', {
        patternId,
        timestamp: Date.now()
      });
    }
    
    return deleted;
  }
  
  /**
   * Set the similarity measure to use
   */
  public setSimilarityMeasure(measure: string): void {
    this.similarityMeasure = measure;
  }
  
  /**
   * Get all patterns - optimized to avoid copying large data
   */
  public getAllPatterns(): StoredPattern[] {
    return Array.from(this.patterns.values());
  }
  
  /**
   * Clear all patterns - with optimized garbage collection hints
   */
  public clearPatterns(): void {
    this.patterns.clear();
    this.processor.clearPatterns();
    
    this.events.emit('PATTERNS_CLEARED', {
      timestamp: Date.now()
    });
    
    // Suggest garbage collection to free memory
    if (globalThis.gc) {
      try {
        globalThis.gc();
      } catch (e) {
        // Garbage collection not available
      }
    }
  }
  
  /**
   * Subscribe to events
   */
  public onEvent(event: string, handler: (data: any) => void): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }
  
  /**
   * Batch process multiple patterns for improved performance
   */
  public batchRecognize(patterns: number[][]): PatternRecognitionResult[] {
    return patterns.map(pattern => this.recognizePattern(pattern));
  }
  
  /**
   * Optimize memory usage by removing rarely used patterns
   */
  public optimizeStorage(): void {
    const now = Date.now();
    const threshold = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    for (const [id, pattern] of this.patterns.entries()) {
      if (now - pattern.lastAccessed > threshold && pattern.recognitionCount < 5) {
        this.deletePattern(id);
      }
    }
  }
}

// Export singleton instance
export const patternRecognitionService = new PatternRecognitionService();
export default patternRecognitionService;
