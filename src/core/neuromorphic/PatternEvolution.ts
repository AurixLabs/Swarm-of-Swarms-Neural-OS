
/**
 * PatternEvolution - Handles the evolutionary aspects of pattern recognition
 */

export class PatternEvolution {
  private evolutionGenerations: Map<string, number> = new Map();
  private fitnessScores: Map<string, number> = new Map();
  
  /**
   * Evolve a pattern to improve recognition over time
   * Uses a simple genetic algorithm approach
   */
  public evolvePattern(
    label: string, 
    pattern: Uint8Array, 
    outputSpikes: Uint8Array,
    similarityFunction: (p1: Uint8Array, p2: Uint8Array) => number
  ): Uint8Array {
    // Only evolve every few recognitions
    const genCount = this.evolutionGenerations.get(label) || 0;
    this.evolutionGenerations.set(label, genCount + 1);
    
    if (genCount % 5 !== 0) return pattern; // Only evolve every 5 recognitions
    
    // Create a mutated copy of the pattern
    const evolvedPattern = new Uint8Array(pattern);
    
    // Apply mutations (flip a few bits randomly)
    const mutationRate = 0.05;
    for (let i = 0; i < evolvedPattern.length; i++) {
      if (Math.random() < mutationRate) {
        // Flip this bit
        evolvedPattern[i] = evolvedPattern[i] > 0 ? 0 : 1;
      }
    }
    
    // Calculate similarity of original and evolved pattern against output
    const originalSimilarity = similarityFunction(outputSpikes, pattern);
    const evolvedSimilarity = similarityFunction(outputSpikes, evolvedPattern);
    
    // If evolved is better, replace the original
    if (evolvedSimilarity > originalSimilarity) {
      console.log(`Evolved pattern ${label}: fitness improved from ${originalSimilarity.toFixed(4)} to ${evolvedSimilarity.toFixed(4)}`);
      return evolvedPattern;
    }
    
    return pattern;
  }
  
  /**
   * Update fitness score for a pattern
   */
  public updateFitness(label: string, similarity: number): void {
    const currentScore = this.fitnessScores.get(label) || 0;
    this.fitnessScores.set(label, currentScore + similarity);
  }
  
  /**
   * Get evolution statistics for patterns
   */
  public getEvolutionStats(): Array<{ label: string; generations: number; fitness: number }> {
    return Array.from(this.evolutionGenerations.keys()).map(label => ({
      label,
      generations: this.evolutionGenerations.get(label) || 0,
      fitness: this.fitnessScores.get(label) || 0
    }));
  }
  
  /**
   * Reset evolution data
   */
  public reset(): void {
    this.evolutionGenerations.clear();
    this.fitnessScores.clear();
  }
}
