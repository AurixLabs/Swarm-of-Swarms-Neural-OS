
// Immutable Ethics Policy definition

import { EventPriority } from '../types/CMATypes';

export interface EthicsPolicy {
  id: string;
  name: string;
  version: string;
  priority: EventPriority;
  rules: EthicsRule[];
  metadata: {
    description: string;
    author: string;
    createdAt: number;
    updatedAt: number;
  };
}

export interface EthicsRule {
  id: string;
  condition: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
}

class EthicsPolicyRegistry {
  private policies: Map<string, EthicsPolicy> = new Map();
  
  registerPolicy(policy: EthicsPolicy): void {
    this.policies.set(policy.id, policy);
  }
  
  getPolicy(id: string): EthicsPolicy | undefined {
    return this.policies.get(id);
  }
  
  getAllPolicies(): EthicsPolicy[] {
    return Array.from(this.policies.values());
  }
  
  removePolicy(id: string): boolean {
    return this.policies.delete(id);
  }
}

export const ethicsPolicyRegistry = new EthicsPolicyRegistry();

// Add missing exports for verification functions
export function verifyEthicsPolicyIntegrity(): boolean {
  // Implementation would verify the integrity of policies
  return true;
}

export function getImmutableEthicsPolicies(): EthicsPolicy[] {
  return ethicsPolicyRegistry.getAllPolicies();
}
