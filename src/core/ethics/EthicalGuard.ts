import { BrowserEventEmitter, createSystemEvent } from '@/core/events';
import { nanoid } from 'nanoid';

export interface EthicalConstraint {
  id: string;
  name: string;
  description: string;
  severity: 'advisory' | 'warning' | 'blocking';
  evaluate: (context: any) => boolean;
}

export class EthicalGuard extends BrowserEventEmitter {
  private constraints: EthicalConstraint[] = [];
  private violations: Array<{ id: string; constraint: string; context: any; timestamp: number }> = [];
  private isActive = true;

  constructor() {
    super();
    this.initializeDefaultConstraints();
  }

  addConstraint(constraint: EthicalConstraint): void {
    this.constraints.push(constraint);
    this.emit('constraint_added', constraint);
  }

  removeConstraint(constraintId: string): void {
    this.constraints = this.constraints.filter(c => c.id !== constraintId);
    this.emit('constraint_removed', constraintId);
  }

  evaluateContext(context: any): void {
    if (!this.isActive) return;

    this.constraints.forEach(constraint => {
      try {
        if (!constraint.evaluate(context)) {
          const violation = {
            id: nanoid(),
            constraint: constraint.id,
            context: context,
            timestamp: Date.now()
          };
          this.violations.push(violation);

          this.emit('ethical_violation', violation);

          if (constraint.severity === 'blocking') {
            console.warn(`🛑 Blocking ethical violation: ${constraint.name}`);
            throw new Error(`Ethical violation: ${constraint.name}`);
          } else {
            console.warn(`⚠️ Ethical warning: ${constraint.name}`);
          }
        }
      } catch (error) {
        console.error(`Error evaluating constraint ${constraint.id}:`, error);
        this.emit('constraint_evaluation_failed', { constraintId: constraint.id, error: error.message });
      }
    });
  }

  getViolations(): Array<{ id: string; constraint: string; context: any; timestamp: number }> {
    return [...this.violations];
  }

  clearViolations(): void {
    this.violations = [];
    this.emit('violations_cleared');
  }

  activate(): void {
    this.isActive = true;
    this.emit('activated');
  }

  deactivate(): void {
    this.isActive = false;
    this.emit('deactivated');
  }

  private initializeDefaultConstraints(): void {
    // Example constraints (can be expanded)
    this.addConstraint({
      id: 'no-harm',
      name: 'Do No Harm',
      description: 'Ensure actions do not cause harm to individuals or society.',
      severity: 'blocking',
      evaluate: (context) => !context.potentialHarm
    });

    this.addConstraint({
      id: 'privacy-respect',
      name: 'Respect Privacy',
      description: 'Protect user data and privacy.',
      severity: 'warning',
      evaluate: (context) => context.privacySettings?.allowDataCollection
    });

    this.addConstraint({
      id: 'fairness',
      name: 'Ensure Fairness',
      description: 'Avoid biased outcomes.',
      severity: 'advisory',
      evaluate: (context) => !context.biasedOutcome
    });
  }
}
