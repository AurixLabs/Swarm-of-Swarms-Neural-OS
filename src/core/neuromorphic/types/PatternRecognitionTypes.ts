
/**
 * Interface for pattern recognition results
 */
export interface PatternRecognitionResult {
  /** 
   * The recognized pattern identifier or label
   */
  patternId: string;
  
  /**
   * Confidence level of the recognition (0-1)
   */
  confidence: number;
  
  /**
   * Similarity scores for top matches
   */
  similarityScores: Array<{
    patternId: string;
    similarity: number;
  }>;
  
  /**
   * Time taken to recognize the pattern (ms)
   */
  recognitionTime: number;
  
  /**
   * Energy used for recognition (arbitrary units)
   */
  energyUsed: number;
}

/**
 * Interface for pattern storage
 */
export interface StoredPattern {
  /**
   * Unique identifier for the pattern
   */
  id: string;
  
  /**
   * Human-readable label for the pattern
   */
  label: string;
  
  /**
   * The actual pattern data (neural activation values)
   */
  data: number[];
  
  /**
   * When the pattern was last accessed/used
   */
  lastAccessed: number;
  
  /**
   * How many times this pattern has been recognized
   */
  recognitionCount: number;
  
  /**
   * Metadata for the pattern
   */
  metadata?: Record<string, any>;
}

/**
 * Options for pattern recognition
 */
export interface PatternRecognitionOptions {
  /**
   * Threshold for considering a pattern as recognized (0-1)
   */
  recognitionThreshold?: number;
  
  /**
   * Maximum number of similar patterns to return
   */
  maxSimilarPatterns?: number;
  
  /**
   * Whether to perform layer-by-layer recognition
   */
  hierarchicalRecognition?: boolean;
  
  /**
   * Whether to update the stored pattern based on the new input
   */
  adaptiveUpdate?: boolean;
  
  /**
   * Whether to use fast approximate matching
   */
  fastMatching?: boolean;
  
  /**
   * Recognition threshold (0-1)
   */
  threshold?: number;
  
  /**
   * Whether to learn from this pattern
   */
  enableLearning?: boolean;
  
  /**
   * Enable evolutionary optimization of patterns
   */
  enableEvolution?: boolean;
}

/**
 * Similarity measure types
 */
export type SimilarityMeasure = 
  | 'euclidean'
  | 'cosine' 
  | 'hamming'
  | 'correlation'
  | 'spike_time';

/**
 * Enum for similarity measures (to be used as values)
 */
export enum SimilarityMeasureEnum {
  EUCLIDEAN = 'euclidean',
  COSINE = 'cosine',
  HAMMING = 'hamming',
  CORRELATION = 'correlation',
  SPIKE_TIME = 'spike_time'
}

