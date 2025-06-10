
/**
 * SpikePatternProcessor - Processes neuromorphic spike patterns for pattern
 * recognition and learning, providing a bridge between our WASM agents and 
 * the neuromorphic brain system.
 */
import { SpikeNetInterpreter, SpikeNetConfig } from './WasmInterpreter';
import { SpikePatternOptions, PatternRecognitionResult } from './types/PatternTypes';
import { PatternEvolution } from './PatternEvolution';
import { PatternUtils } from './PatternUtils';

export class SpikePatternProcessor {
  private interpreter: SpikeNetInterpreter;
  private patterns: Map<string, Uint8Array> = new Map();
  private distances: Map<string, number> = new Map();
  private patternEvolution: PatternEvolution;
  
  constructor(config?: SpikeNetConfig) {
    // If no config provided, create a default one suitable for pattern recognition
    if (!config) {
      config = {
        inputSize: 32,
        outputSize: 16,
        hiddenSize: 24,
        weights: new Int8Array(32 * 24 + 24 * 16),
        thresholds: new Uint16Array(24 + 16)
      };
      
      // Initialize with random weights and thresholds
      this.initializeRandomWeights(config);
    }
    
    this.interpreter = new SpikeNetInterpreter(config);
    this.patternEvolution = new PatternEvolution();
  }
  
  /**
   * Initialize random weights and thresholds
   */
  private initializeRandomWeights(config: SpikeNetConfig): void {
    for (let i = 0; i < config.weights.length; i++) {
      config.weights[i] = Math.floor(Math.random() * 256) - 128;
    }
    
    for (let i = 0; i < config.thresholds.length; i++) {
      config.thresholds[i] = Math.floor(Math.random() * 1000) + 500;
    }
  }
  
  /**
   * Store a pattern with a given label
   */
  public storePattern(label: string, pattern: Uint8Array): void {
    this.patterns.set(label, new Uint8Array(pattern));
    console.log(`Stored pattern: ${label} with ${pattern.reduce((a, b) => a + b, 0)} active bits`);
  }
  
  /**
   * Recognize a pattern against stored patterns
   * Returns the best matching pattern and its similarity score
   */
  public recognizePattern(
    input: Uint8Array | number, 
    options: SpikePatternOptions = { threshold: 0.7, enableLearning: false }
  ): PatternRecognitionResult {
    // Convert number to Uint8Array if needed (for spike pattern integer input)
    let inputPattern: Uint8Array;
    if (typeof input === 'number') {
      inputPattern = PatternUtils.integerToSpikePattern(input);
    } else {
      inputPattern = input;
    }
    
    // Process through interpreter
    const outputSpikes = this.interpreter.process(inputPattern);
    
    // Find best matching pattern
    let bestMatch = null;
    let bestSimilarity = 0;
    const matches: Array<{ label: string; similarity: number }> = [];
    
    for (const [label, pattern] of this.patterns.entries()) {
      const similarity = PatternUtils.calculateSimilarity(outputSpikes, pattern);
      this.distances.set(label, similarity);
      
      matches.push({ label, similarity });
      
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = label;
      }
    }
    
    // Sort matches by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);
    
    // Process with agents if specified
    if (options.agentIds && options.agentIds.length > 0) {
      this.processWithAgents(inputPattern, options.agentIds);
    }
    
    // Evolve patterns if evolution is enabled
    if (options.enableEvolution && bestMatch && options.enableLearning) {
      const pattern = this.patterns.get(bestMatch);
      if (pattern) {
        const evolvedPattern = this.patternEvolution.evolvePattern(
          bestMatch, 
          pattern,
          outputSpikes,
          PatternUtils.calculateSimilarity
        );
        
        // Update pattern if it was evolved
        if (pattern !== evolvedPattern) {
          this.patterns.set(bestMatch, evolvedPattern);
        }
      }
    }
    
    // If no match found or similarity below threshold
    if (bestSimilarity < options.threshold) {
      return { label: null, similarity: bestSimilarity, matches };
    }
    
    // Update fitness score of the matched pattern
    if (bestMatch) {
      this.patternEvolution.updateFitness(bestMatch, bestSimilarity);
    }
    
    return { label: bestMatch, similarity: bestSimilarity, matches };
  }
  
  /**
   * Process a pattern through connected WASM agents
   */
  private async processWithAgents(pattern: Uint8Array, agentIds: string[]): Promise<void> {
    try {
      // Convert pattern to integer representation (up to 32 bits)
      const intPattern = PatternUtils.spikePatternToInteger(pattern);
      
      // Process through each agent
      for (const agentId of agentIds) {
        try {
          // Note: hyperAgentManager removed - would need real WASM agent system
          console.log(`Would process pattern ${intPattern} with agent ${agentId} when agent system is available`);
        } catch (error) {
          console.error(`Error processing pattern with agent ${agentId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing pattern with agents:', error);
    }
  }
  
  /**
   * Get current neuron state from the interpreter
   */
  public getNeuronState() {
    return this.interpreter.getNeuronState();
  }
  
  /**
   * Get all stored patterns
   */
  public getStoredPatterns(): Map<string, Uint8Array> {
    return new Map(this.patterns);
  }
  
  /**
   * Get evolution statistics for patterns
   */
  public getEvolutionStats() {
    return this.patternEvolution.getEvolutionStats();
  }
  
  /**
   * Clear all stored patterns
   */
  public clearPatterns(): void {
    this.patterns.clear();
    this.distances.clear();
    this.patternEvolution.reset();
  }
}
