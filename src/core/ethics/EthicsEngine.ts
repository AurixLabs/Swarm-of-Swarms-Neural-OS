
/**
 * Ethics Engine - Core system for ethical validation
 * Implements Deep's suggestions for an ethics validation layer
 */

export interface EthicalConstraint {
  id: string;
  name: string;
  description: string;
  validate: (action: any) => boolean;
}

export interface EthicalValidationResult {
  valid: boolean;
  constraintId?: string;
  message?: string;
}

export class EthicsEngine {
  private static instance: EthicsEngine;
  private _constraints: EthicalConstraint[] = [];
  private _initialized = false;
  
  // Prevent direct instantiation
  private constructor() {
    this.initializeConstraints();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): EthicsEngine {
    if (!EthicsEngine.instance) {
      EthicsEngine.instance = new EthicsEngine();
    }
    return EthicsEngine.instance;
  }
  
  /**
   * Initialize default ethical constraints
   */
  private initializeConstraints(): void {
    this._constraints = [
      {
        id: 'NO_HARM',
        name: 'No Harm Principle',
        description: 'Actions should not cause harm to users or systems',
        validate: (action) => !action.type?.toString().includes('DESTRUCTIVE')
      },
      {
        id: 'USER_CONSENT',
        name: 'User Consent',
        description: 'Actions requiring privacy impact require explicit consent',
        validate: (action) => {
          if (action.requiresConsent) {
            return action.userConsented === true;
          }
          return true;
        }
      },
      {
        id: 'INTEGRITY',
        name: 'System Integrity',
        description: 'Actions should not compromise system security or integrity',
        validate: (action) => !action.bypassesSecurity
      },
      {
        id: 'FAIRNESS',
        name: 'Fairness Principle',
        description: 'Actions should treat all users fairly and without bias',
        validate: (action) => !action.targetGroup || !action.exclusionary
      },
      {
        id: 'TRANSPARENCY',
        name: 'Transparency',
        description: 'Critical actions should be traceable and explainable',
        validate: (action) => !action.isCritical || action.hasExplanation
      }
    ];
    this._initialized = true;
  }
  
  /**
   * Add a new ethical constraint
   */
  public addConstraint(constraint: EthicalConstraint): void {
    const existing = this._constraints.find(c => c.id === constraint.id);
    if (existing) {
      throw new Error(`Constraint with id ${constraint.id} already exists`);
    }
    this._constraints.push(constraint);
  }
  
  /**
   * Remove an ethical constraint
   */
  public removeConstraint(constraintId: string): boolean {
    const initialLength = this._constraints.length;
    this._constraints = this._constraints.filter(c => c.id !== constraintId);
    return initialLength !== this._constraints.length;
  }
  
  /**
   * Check if an action passes all ethical constraints
   */
  public validateAction(action: any): EthicalValidationResult {
    // Check if we're initialized
    if (!this._initialized) {
      return {
        valid: false,
        message: 'Ethics engine not initialized'
      };
    }
    
    // Validate against all constraints
    for (const constraint of this._constraints) {
      try {
        if (!constraint.validate(action)) {
          return {
            valid: false,
            constraintId: constraint.id,
            message: `Action violates ethical constraint: ${constraint.name}`
          };
        }
      } catch (error) {
        console.error(`Error validating constraint ${constraint.id}:`, error);
        return {
          valid: false,
          constraintId: constraint.id,
          message: `Error during ethical validation: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
    
    // All constraints passed
    return { valid: true };
  }
  
  /**
   * Get all registered ethical constraints
   */
  public getConstraints(): EthicalConstraint[] {
    return [...this._constraints];
  }
  
  /**
   * Check if the ethics engine is initialized
   */
  public isInitialized(): boolean {
    return this._initialized;
  }
}

// Export singleton instance
export const ethicsEngine = EthicsEngine.getInstance();
