
import { UnifiedBaseKernel } from '../unified/UnifiedBaseKernel';
import { RegulatoryEventEmitter, RegulatoryEvent, RegulatoryEventType } from './RegulatoryEventEmitter';
import { RegulatoryState } from './RegulatoryState';
import { SecurityValidator } from './SecurityValidator';
import { SecurityManager } from './SecurityManager';
import { RuleManager } from './RuleManager';
import { createContext, useContext, ReactNode } from 'react';

export interface RegulatoryPolicy {
  id: string;
  name: string;
  description: string;
  active: boolean;
  jurisdictions: string[];
  requirements: string[];
}

export type { RegulatoryEvent };

export class RegulatoryKernel extends UnifiedBaseKernel {
  protected readonly regulatoryState: RegulatoryState;
  protected readonly ruleManager: RuleManager;
  protected readonly securityManager: SecurityManager;
  protected readonly securityValidator: SecurityValidator;
  
  constructor() {
    super('regulatory');
    this.regulatoryState = new RegulatoryState();
    this.securityManager = new SecurityManager();
    this.securityValidator = new SecurityValidator(this.securityManager);
    this.ruleManager = new RuleManager();
  }

  public get regulatoryEvents() {
    return this.events;
  }
  
  public override getState<T>(key: string): T | undefined {
    return this.regulatoryState.getState<T>(key);
  }
  
  public override setState<T>(key: string, value: T): void {
    this.regulatoryState.setState(key, value);
    this.emitKernelEvent('STATE_CHANGED', { key, value, timestamp: Date.now() });
  }
  
  public validateModule(context: any) {
    return this.ruleManager.executeValidation(context);
  }
  
  public getModuleHistory(moduleId: string) {
    return [];
  }

  public validateRules(): boolean {
    return this.ruleManager.validateRules();
  }

  public registerRule(rule: any): void {
    this.ruleManager.registerRule(rule);
  }

  public getSecurityMetrics() {
    return {
      timestamp: Date.now(),
      securityStatus: 'secure',
      activeThreats: 0,
      mitigatedThreats: 0,
      complianceScore: 100
    };
  }

  registerPolicy(policy: RegulatoryPolicy): string {
    const policies = this.regulatoryState.getState<RegulatoryPolicy[]>('policies') || [];
    const newPolicies = [...policies, policy];
    this.regulatoryState.setState('policies', newPolicies);
    return policy.id;
  }

  getPolicy(policyId: string): RegulatoryPolicy | null {
    const policies = this.regulatoryState.getState<RegulatoryPolicy[]>('policies') || [];
    return policies.find(p => p.id === policyId) || null;
  }

  listActivePolicies(): RegulatoryPolicy[] {
    const policies = this.regulatoryState.getState<RegulatoryPolicy[]>('policies') || [];
    return policies.filter(p => p.active);
  }

  updatePolicy(policyId: string, updates: Partial<RegulatoryPolicy>): boolean {
    const policies = this.regulatoryState.getState<RegulatoryPolicy[]>('policies') || [];
    const index = policies.findIndex(p => p.id === policyId);
    
    if (index === -1) return false;
    
    policies[index] = { ...policies[index], ...updates };
    this.regulatoryState.setState('policies', policies);
    return true;
  }

  removePolicy(policyId: string): boolean {
    const policies = this.regulatoryState.getState<RegulatoryPolicy[]>('policies') || [];
    const filtered = policies.filter(p => p.id !== policyId);
    
    if (filtered.length === policies.length) return false;
    
    this.regulatoryState.setState('policies', filtered);
    return true;
  }

  public validateOperation(operation: any): boolean {
    return true;
  }

  public generateComplianceReport(): any {
    return {
      timestamp: Date.now(),
      status: 'compliant',
      policies: this.listActivePolicies().length,
      violations: 0
    };
  }
}

// Create a singleton instance
export const regulatoryKernel = new RegulatoryKernel();

// React context for regulatory kernel access
const RegulatoryContext = createContext<RegulatoryKernel | null>(null);

export const RegulatoryProvider = ({ children }: { children: ReactNode }) => (
  <RegulatoryContext.Provider value={regulatoryKernel}>
    {children}
  </RegulatoryContext.Provider>
);

export const useRegulatory = () => {
  const context = useContext(RegulatoryContext);
  if (!context) {
    throw new Error('useRegulatory must be used within a RegulatoryProvider');
  }
  return context;
};
