
/**
 * Pattern types for the SpikePatternProcessor
 */

import { SimilarityMeasure } from './PatternRecognitionTypes';

export interface SpikePatternOptions {
  /**
   * Pattern detection threshold (0-1)
   */
  threshold: number;
  
  /**
   * Whether to learn from this pattern
   */
  enableLearning: boolean;
  
  /**
   * Maximum distance for pattern matching
   */
  maxDistance?: number;
  
  /**
   * Associated agent IDs to process this pattern
   */
  agentIds?: string[];

  /**
   * Enable evolutionary optimization of patterns
   */
  enableEvolution?: boolean;
  
  /**
   * Use quantum-inspired processing
   */
  useQuantumProcessing?: boolean;
  
  /**
   * Use high-performance mode for large pattern sets
   */
  highPerformanceMode?: boolean;
  
  /**
   * Similarity measure to use for pattern matching
   */
  similarityMeasure?: SimilarityMeasure;
}

export interface PatternRecognitionResult {
  label: string | null;
  similarity: number;
  matches: Array<{ label: string; similarity: number }>;
}

export interface PatternEvolutionStats {
  label: string;
  generations: number;
  fitness: number;
  improvementRate?: number;
  lastEvolutionTime?: number;
}

export interface PatternPerformanceMetrics {
  recognitionTime: number;
  energyUsage: number;
  memoryFootprint: number;
  accuracyScore: number;
}
