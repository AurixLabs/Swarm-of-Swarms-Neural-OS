
import { DistributedEthicalGuard } from './DistributedEthicalGuard';
import { ethicsEngine } from './EthicsEngine';

/**
 * EthicsCrossReferenceValidator
 * 
 * Validates ethical decisions across multiple subsystems to ensure
 * consistency and prevent bypass of ethical constraints.
 */
export class EthicsCrossReferenceValidator {
  private static instance: EthicsCrossReferenceValidator;
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): EthicsCrossReferenceValidator {
    if (!EthicsCrossReferenceValidator.instance) {
      EthicsCrossReferenceValidator.instance = new EthicsCrossReferenceValidator();
    }
    return EthicsCrossReferenceValidator.instance;
  }
  
  /**
   * Validate an ethical decision across systems
   */
  public validateDecision(decision: any): boolean {
    // Get status of distributed ethical guard
    const guardStatus = DistributedEthicalGuard.getCrossReferenceStatus();
    
    // If the guard isn't operational, reject the decision
    if (guardStatus.guardStatus !== 'operational') {
      console.warn('Ethical guard not operational, rejecting decision');
      return false;
    }
    
    // If the ethics engine isn't operational, use fallback validation
    if (guardStatus.engineStatus !== 'operational') {
      return this.fallbackValidation(decision);
    }
    
    // Both systems are operational, use cross-validation
    return this.crossValidate(decision);
  }
  
  /**
   * Validate using the ethics engine if available, otherwise fallback to basic check
   */
  private fallbackValidation(decision: any): boolean {
    console.warn('Using fallback ethical validation');
    const check = DistributedEthicalGuard.performBasicEthicalCheck(
      decision.type || 'unknown',
      decision
    );
    return check.approved;
  }
  
  /**
   * Cross-validate using both ethics engine and distributed guard
   */
  private crossValidate(decision: any): boolean {
    // First check with ethics engine
    const engineResult = ethicsEngine.validateAction(decision);
    
    // If engine rejects, no need to check with guard
    if (!engineResult.valid) {
      return false;
    }
    
    // Engine approves, now check with guard
    const guardResult = DistributedEthicalGuard.validateCriticalOperation(
      decision.type || 'unknown',
      'high',
      decision
    );
    
    // Only approve if both systems approve
    return guardResult.validated;
  }

  /**
   * Get validation status across systems
   */
  public getValidationStatus() {
    const guardStatus = DistributedEthicalGuard.getCrossReferenceStatus();
    
    return {
      timestamp: Date.now(),
      overallStatus: guardStatus.valid ? 'operational' : 'degraded',
      systems: {
        ethicsEngine: guardStatus.engineStatus,
        ethicalGuard: guardStatus.guardStatus
      }
    };
  }
}

export const ethicsCrossReferenceValidator = EthicsCrossReferenceValidator.getInstance();
