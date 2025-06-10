import { BrowserEventEmitter } from './BrowserEventEmitter';
import { systemKernel } from './SystemKernel';
import { ethicalReasoningKernel } from './ethics/EthicalReasoningKernel';

export interface SecurityAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface SafetyViolation {
  id: string;
  type: 'ethical' | 'security' | 'privacy' | 'fairness';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  context?: Record<string, any>;
}

export interface SafetyConstraint {
  id: string;
  description: string;
  type: 'ethical' | 'security' | 'privacy' | 'fairness';
  enforceAutomatically: boolean;
  validator: (action: any, context: any) => boolean;
}

export class SafetyNet {
  private static instance: SafetyNet;
  private eventEmitter: BrowserEventEmitter;
  private constraints: Map<string, SafetyConstraint> = new Map();
  private violations: SafetyViolation[] = [];
  private alerts: SecurityAlert[] = [];
  private isEnabled: boolean = true;
  
  private constructor() {
    this.eventEmitter = new BrowserEventEmitter();
    this.initializeDefaultConstraints();
  }
  
  public static getInstance(): SafetyNet {
    if (!SafetyNet.instance) {
      SafetyNet.instance = new SafetyNet();
    }
    return SafetyNet.instance;
  }
  
  private initializeDefaultConstraints(): void {
    // Add default ethical constraints
    this.addConstraint({
      id: 'ethical-harm-prevention',
      description: 'Prevent actions that could cause harm to users or others',
      type: 'ethical',
      enforceAutomatically: true,
      validator: (action, context) => {
        // Use ethical reasoning kernel to evaluate
        const decision = ethicalReasoningKernel.evaluateAction(
          typeof action === 'string' ? action : JSON.stringify(action),
          context
        );
        return decision.decision;
      }
    });
    
    // Add default security constraints
    this.addConstraint({
      id: 'security-data-access',
      description: 'Prevent unauthorized data access',
      type: 'security',
      enforceAutomatically: true,
      validator: (action, context) => {
        // Simple check for demonstration
        if (action.accessType === 'read' && action.dataType === 'sensitive') {
          return context.hasPermission === true;
        }
        return true;
      }
    });
  }
  
  public addConstraint(constraint: SafetyConstraint): boolean {
    if (this.constraints.has(constraint.id)) {
      return false;
    }
    
    this.constraints.set(constraint.id, constraint);
    this.eventEmitter.emit('CONSTRAINT_ADDED', { constraint });
    return true;
  }
  
  public removeConstraint(constraintId: string): boolean {
    const result = this.constraints.delete(constraintId);
    if (result) {
      this.eventEmitter.emit('CONSTRAINT_REMOVED', { constraintId });
    }
    return result;
  }
  
  public validateAction(action: any, context: any = {}): {
    isValid: boolean;
    violations: SafetyViolation[];
  } {
    if (!this.isEnabled) {
      return { isValid: true, violations: [] };
    }
    
    const violations: SafetyViolation[] = [];
    
    for (const [id, constraint] of this.constraints.entries()) {
      try {
        const isValid = constraint.validator(action, context);
        
        if (!isValid) {
          const violation: SafetyViolation = {
            id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: constraint.type,
            description: `Violated constraint: ${constraint.description}`,
            severity: 'medium', // Default severity
            timestamp: Date.now(),
            context: {
              constraintId: id,
              action,
              context
            }
          };
          
          violations.push(violation);
          this.recordViolation(violation);
          
          if (constraint.enforceAutomatically) {
            this.eventEmitter.emit('VIOLATION_DETECTED', { violation });
            
            // Also emit to system kernel for broader awareness
            systemKernel.events.emit('SAFETY_VIOLATION', { violation });
          }
        }
      } catch (error) {
        console.error(`Error validating constraint ${id}:`, error);
        
        // Create an alert for the validation error
        this.createAlert({
          severity: 'medium',
          source: 'safety_net',
          message: `Error validating constraint ${id}: ${error.message}`,
          metadata: { constraintId: id, error: error.toString() }
        });
      }
    }
    
    return {
      isValid: violations.length === 0,
      violations
    };
  }
  
  public createAlert(options: Omit<SecurityAlert, 'id' | 'timestamp'>): SecurityAlert {
    const alert: SecurityAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...options,
      timestamp: Date.now()
    };
    
    this.alerts.push(alert);
    
    // Trim alerts if there are too many
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
    
    this.eventEmitter.emit('SECURITY_ALERT', alert);
    
    // Also emit to system kernel for broader awareness
    systemKernel.events.emit('SECURITY_ALERT', alert);
    
    return alert;
  }
  
  private recordViolation(violation: SafetyViolation): void {
    this.violations.push(violation);
    
    // Trim violations if there are too many
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-1000);
    }
  }
  
  public getViolations(): SafetyViolation[] {
    return [...this.violations];
  }
  
  public getAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }
  
  public getConstraints(): SafetyConstraint[] {
    return Array.from(this.constraints.values());
  }
  
  public enable(): void {
    this.isEnabled = true;
    this.eventEmitter.emit('SAFETY_NET_ENABLED', {});
  }
  
  public disable(): void {
    this.isEnabled = false;
    this.eventEmitter.emit('SAFETY_NET_DISABLED', {});
    
    // Create a critical alert when safety net is disabled
    this.createAlert({
      severity: 'critical',
      source: 'safety_net',
      message: 'Safety Net has been disabled - system protections are inactive',
      metadata: { disabledAt: new Date().toISOString() }
    });
  }
  
  public isActive(): boolean {
    return this.isEnabled;
  }
  
  public registerAlertHandler(handler: (alert: SecurityAlert) => void): () => void {
    const unsubscribe = this.eventEmitter.on('SECURITY_ALERT', handler);
    return () => this.eventEmitter.off('SECURITY_ALERT', handler);
  }
  
  public registerViolationHandler(handler: (violation: SafetyViolation) => void): () => void {
    const unsubscribe = this.eventEmitter.on('VIOLATION_DETECTED', (data) => handler(data.violation));
    return () => this.eventEmitter.off('VIOLATION_DETECTED', (data) => handler(data.violation));
  }
  
  public clearViolations(): void {
    this.violations = [];
    this.eventEmitter.emit('VIOLATIONS_CLEARED', {});
  }
  
  public clearAlerts(): void {
    this.alerts = [];
    this.eventEmitter.emit('ALERTS_CLEARED', {});
  }
}

// Export the singleton instance
export const safetyNet = SafetyNet.getInstance();
