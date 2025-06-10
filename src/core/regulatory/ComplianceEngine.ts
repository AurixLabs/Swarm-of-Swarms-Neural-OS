import { BrowserEventEmitter, createSystemEvent } from '@/core/events';

export interface ComplianceRule {
  id: string;
  regulation: string;
  description: string;
  check: (context: any) => boolean;
  severity: 'info' | 'warning' | 'violation';
}

export class ComplianceEngine extends BrowserEventEmitter {
  private rules: ComplianceRule[] = [];
  private violations: Array<{ rule: string; context: any; timestamp: number }> = [];
  private isActive = true;

  constructor() {
    super();
    this.initializeDefaultRules();
  }

  public addRule(rule: ComplianceRule): void {
    this.rules.push(rule);
    this.emit('rule_added', rule);
  }

  public removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
    this.emit('rule_removed', ruleId);
  }

  public evaluate(context: any): void {
    if (!this.isActive) return;

    this.rules.forEach(rule => {
      try {
        if (!rule.check(context)) {
          const violation = {
            rule: rule.id,
            context: context,
            timestamp: Date.now()
          };
          this.violations.push(violation);
          this.emit('compliance_violation', violation);
          console.warn(`Compliance Violation: ${rule.description}`);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    });
  }

  public getViolations(): Array<{ rule: string; context: any; timestamp: number }> {
    return [...this.violations];
  }

  public clearViolations(): void {
    this.violations = [];
    this.emit('violations_cleared');
  }

  public activate(): void {
    this.isActive = true;
    this.emit('engine_activated');
  }

  public deactivate(): void {
    this.isActive = false;
    this.emit('engine_deactivated');
  }

  private initializeDefaultRules(): void {
    // Example rules (can be expanded)
    this.addRule({
      id: 'data_privacy_1',
      regulation: 'GDPR',
      description: 'Ensure personal data is encrypted at rest.',
      check: (context: any) => context.dataEncryptionEnabled,
      severity: 'warning'
    });

    this.addRule({
      id: 'access_control_1',
      regulation: 'HIPAA',
      description: 'Verify access logs are audited regularly.',
      check: (context: any) => context.accessLogsAudited,
      severity: 'info'
    });
  }
}
