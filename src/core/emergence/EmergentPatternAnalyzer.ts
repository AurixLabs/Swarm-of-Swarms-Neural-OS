
/**
 * EmergentPatternAnalyzer.ts
 * 
 * Analyzes patterns in system behavior to detect emergent properties
 */

export interface PatternMetrics {
  [key: string]: number;
}

export interface PatternData {
  name: string;
  metrics: PatternMetrics;
  timestamp: number;
  context?: Record<string, any>;
}

export class EmergentPatternAnalyzer {
  private patterns: Map<string, PatternData[]> = new Map();
  
  /**
   * Analyze a pattern in system behavior
   */
  public analyzePattern(data: PatternData): boolean {
    // Store the pattern data
    if (!this.patterns.has(data.name)) {
      this.patterns.set(data.name, []);
    }
    
    this.patterns.get(data.name)?.push({
      ...data,
      timestamp: data.timestamp || Date.now()
    });
    
    // Perform analysis on the pattern
    this.detectEmergentProperties(data.name);
    
    return true;
  }
  
  /**
   * Detect emergent properties in the patterns
   */
  private detectEmergentProperties(patternName: string): void {
    const patternData = this.patterns.get(patternName);
    if (!patternData || patternData.length < 3) return;
    
    // Analyze temporal patterns
    const timestamps = patternData.map(p => p.timestamp);
    const intervals = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i-1]);
    }
    
    // Check for periodicity
    const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - meanInterval, 2), 0) / intervals.length;
    const isPeriodic = variance / meanInterval < 0.2; // Low variance indicates periodicity
    
    if (isPeriodic) {
      console.log(`Emergent property detected: ${patternName} shows periodic behavior`);
    }
    
    // Analyze metric correlations
    if (patternData.length > 5) {
      const metrics = Object.keys(patternData[0].metrics);
      
      for (let i = 0; i < metrics.length; i++) {
        for (let j = i + 1; j < metrics.length; j++) {
          const metric1 = metrics[i];
          const metric2 = metrics[j];
          
          const values1 = patternData.map(p => p.metrics[metric1]);
          const values2 = patternData.map(p => p.metrics[metric2]);
          
          const correlation = this.calculateCorrelation(values1, values2);
          
          if (Math.abs(correlation) > 0.7) {
            console.log(`Emergent property detected: Strong correlation (${correlation.toFixed(2)}) between ${metric1} and ${metric2} in ${patternName}`);
          }
        }
      }
    }
  }
  
  /**
   * Calculate Pearson correlation coefficient between two arrays
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return 0;
    return numerator / denominator;
  }
  
  /**
   * Clear pattern data
   */
  public clearPatterns(): void {
    this.patterns.clear();
  }
  
  /**
   * Get all pattern data
   */
  public getAllPatterns(): Record<string, PatternData[]> {
    const result: Record<string, PatternData[]> = {};
    
    for (const [key, value] of this.patterns.entries()) {
      result[key] = [...value];
    }
    
    return result;
  }
}
