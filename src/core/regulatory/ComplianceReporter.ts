
import { RegulatoryEventBus } from './RegulatoryEventBus';
import { RegulatoryPolicy } from './RegulatoryPolicy';

/**
 * Interface for compliance violations
 */
export interface ComplianceViolation {
  policyId: string;
  requirement: string;
  timestamp: number;
  details?: any;
}

/**
 * Interface for compliance check results
 */
export interface ComplianceCheckResult {
  valid: boolean;
  violations: ComplianceViolation[];
  timestamp: number;
}

/**
 * Interface for compliance reports
 */
export interface ComplianceReport {
  timestamp: number;
  totalPolicies: number;
  activePolicies: number;
  jurisdictionCoverage: Record<string, number>;
  lastViolations: ComplianceViolation[];
  complianceScore?: number;
}

/**
 * Class responsible for handling compliance reporting functionality
 */
export class ComplianceReporter {
  private events: RegulatoryEventBus;
  private lastViolations: ComplianceViolation[] = [];
  
  constructor(events: RegulatoryEventBus) {
    this.events = events;
  }
  
  /**
   * Validate an operation against policies
   */
  public validateOperation(
    operation: any, 
    activePolicies: RegulatoryPolicy[]
  ): ComplianceCheckResult {
    const violations: ComplianceViolation[] = [];
    
    // Validate operation against active policies
    activePolicies.forEach(policy => {
      const matchesCriteria = policy.requirements.some(requirement => 
        this.checkOperationCompliance(operation, requirement)
      );
      
      if (!matchesCriteria) {
        violations.push({
          policyId: policy.id,
          requirement: policy.requirements[0], // Use first requirement as an example
          timestamp: Date.now(),
          details: operation
        });
      }
    });
    
    // Store violations for reporting
    if (violations.length > 0) {
      this.lastViolations = [...this.lastViolations, ...violations].slice(-10); // Keep last 10 violations
      
      this.events.emitEvent({
        type: 'COMPLIANCE_VIOLATION_DETECTED',
        payload: {
          operation,
          violations,
          timestamp: Date.now()
        }
      });
    }
    
    return { 
      valid: violations.length === 0, 
      violations,
      timestamp: Date.now()
    };
  }

  /**
   * Check if an operation complies with a specific requirement
   */
  private checkOperationCompliance(operation: any, requirement: string): boolean {
    // Simple compliance check logic
    // In a real-world scenario, this would be much more complex
    if (!operation || !requirement) {
      return false;
    }

    // Check if operation type matches requirement
    if (operation.type && requirement.includes(operation.type)) {
      return true;
    }

    // Check if operation name matches requirement
    if (operation.name && requirement.includes(operation.name)) {
      return true;
    }

    // Default to a random compliance check for demonstration
    return Math.random() > 0.5;
  }
  
  /**
   * Generate a compliance report
   */
  public generateComplianceReport(
    activePolicies: RegulatoryPolicy[],
    jurisdictionCoverage: Record<string, number>
  ): ComplianceReport {
    const report: ComplianceReport = {
      timestamp: Date.now(),
      totalPolicies: activePolicies.length,
      activePolicies: activePolicies.length,
      jurisdictionCoverage,
      lastViolations: this.lastViolations,
      complianceScore: this.calculateComplianceScore(activePolicies)
    };
    
    this.events.emitEvent({
      type: 'COMPLIANCE_REPORT_GENERATED',
      payload: report
    });
    
    return report;
  }
  
  /**
   * Calculate compliance score based on active policies and violations
   */
  private calculateComplianceScore(activePolicies: RegulatoryPolicy[]): number {
    if (activePolicies.length === 0) {
      return 100; // Perfect score if no policies to comply with
    }
    
    // Basic implementation - can be enhanced with weights and more complex scoring
    const totalViolations = this.lastViolations.length;
    return Math.max(0, 100 - (totalViolations * 10));
  }
  
  /**
   * Clear stored violations
   */
  public clearViolations(): void {
    this.lastViolations = [];
  }
}

/**
 * Create a ComplianceReporter instance
 */
export function createComplianceReporter(events: RegulatoryEventBus): ComplianceReporter {
  return new ComplianceReporter(events);
}
