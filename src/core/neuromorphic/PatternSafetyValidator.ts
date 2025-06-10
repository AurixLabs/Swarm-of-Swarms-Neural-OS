
/**
 * PatternSafetyValidator - Validates pattern operations for production safety
 */

import { safetyNet } from '../safety/SafetyNet';

export class PatternSafetyValidator {
  /**
   * Validate pattern data for safety and correctness
   */
  public static validatePattern(pattern: Uint8Array | number[]): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check if pattern exists
    if (!pattern) {
      issues.push('Pattern is undefined or null');
      return { isValid: false, issues };
    }
    
    // Check pattern size
    if (pattern.length === 0) {
      issues.push('Pattern has zero length');
    } else if (pattern.length > 10000) {
      issues.push('Pattern exceeds maximum recommended size (10000)');
    }
    
    // Check pattern values
    for (let i = 0; i < pattern.length; i++) {
      const value = pattern[i];
      if (typeof value !== 'number') {
        issues.push(`Pattern contains non-numeric value at index ${i}`);
      } else if (value < 0) {
        issues.push(`Pattern contains negative value at index ${i}`);
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
  
  /**
   * Validate similarity measures
   */
  public static validateSimilarityMeasure(measure: string): boolean {
    const validMeasures = ['euclidean', 'cosine', 'hamming', 'correlation', 'spike_time'];
    return validMeasures.includes(measure);
  }
  
  /**
   * Validate pattern recognition options
   */
  public static validateRecognitionOptions(options: any): {
    isValid: boolean;
    issues: string[];
    safeOptions: any;
  } {
    const issues: string[] = [];
    const safeOptions = { ...options };
    
    // Check threshold
    if (options.threshold !== undefined) {
      if (typeof options.threshold !== 'number' || options.threshold < 0 || options.threshold > 1) {
        issues.push('Threshold must be a number between 0 and 1');
        safeOptions.threshold = 0.7; // Default safe value
      }
    }
    
    // Check enableLearning
    if (options.enableLearning !== undefined && typeof options.enableLearning !== 'boolean') {
      issues.push('enableLearning must be a boolean');
      safeOptions.enableLearning = false; // Default safe value
    }
    
    // Check enableEvolution
    if (options.enableEvolution !== undefined && typeof options.enableEvolution !== 'boolean') {
      issues.push('enableEvolution must be a boolean');
      safeOptions.enableEvolution = false; // Default safe value
    }
    
    // Log issues to the safety system if found
    if (issues.length > 0) {
      safetyNet.captureError(
        `Pattern validation issues: ${issues.join(', ')}`,
        'pattern-safety-validator',
        'MEDIUM'
      );
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      safeOptions
    };
  }
  
  /**
   * Sanitize pattern data by ensuring values are binary (0 or 1)
   */
  public static sanitizePattern(pattern: Uint8Array | number[]): Uint8Array {
    // Create safe copy
    const safePattern = new Uint8Array(pattern.length);
    
    // Ensure all values are either 0 or 1
    for (let i = 0; i < pattern.length; i++) {
      safePattern[i] = pattern[i] > 0 ? 1 : 0;
    }
    
    return safePattern;
  }
  
  /**
   * Perform comprehensive safety check for pattern operations
   */
  public static performSafetyCheck(
    patternData: any,
    options: any,
    operationType: 'store' | 'recognize' | 'delete'
  ): {
    safeToExecute: boolean;
    sanitizedPattern?: Uint8Array;
    sanitizedOptions?: any;
    reason?: string;
  } {
    // Validate pattern data
    if (!patternData && operationType !== 'delete') {
      return {
        safeToExecute: false,
        reason: 'Pattern data is required for this operation'
      };
    }
    
    let sanitizedPattern: Uint8Array | undefined;
    
    // For operations that use pattern data
    if (patternData && operationType !== 'delete') {
      const validation = this.validatePattern(patternData);
      
      if (!validation.isValid) {
        return {
          safeToExecute: false,
          reason: `Invalid pattern: ${validation.issues.join(', ')}`
        };
      }
      
      // Sanitize the pattern
      sanitizedPattern = this.sanitizePattern(patternData);
    }
    
    // Validate options
    const optionsValidation = this.validateRecognitionOptions(options || {});
    
    // Return complete safety check result
    return {
      safeToExecute: optionsValidation.isValid || operationType === 'delete',
      sanitizedPattern,
      sanitizedOptions: optionsValidation.safeOptions,
      reason: optionsValidation.isValid ? undefined : optionsValidation.issues.join(', ')
    };
  }
}
