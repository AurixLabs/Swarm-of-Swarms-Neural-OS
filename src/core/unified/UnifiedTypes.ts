
// Unified type definitions for the CMA system

export interface SwarmModuleMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  configuration?: Record<string, any>;
  permissions?: string[];
  maxAgents: number;
  currentAgents: number;
  swarmCapabilities: string[];
}

export interface BaseKernelInterface {
  validateRequest(request: any): Promise<boolean>;
  getSecurityStatus(): any;
  reportViolation(violation: any): void;
  initialize(): boolean;
  shutdown(): void;
}

export interface DomainKernelInterface extends BaseKernelInterface {
  createDomain(config: any): any;
  connectDomains(domain1: string, domain2: string): boolean;
  getAllDomains(): any[];
}

export interface SecurityKernelInterface extends BaseKernelInterface {
  validateRequest(request: any): Promise<boolean>;
  getViolations(): any[];
  clearViolations(): void;
  addSecurityPolicy(id: string, policy: any): void;
  getSecurityPolicies(): any[];
}

export interface EthicsInterface {
  evaluateAction(action: string, context: any): any;
  registerKernelWithEmbeddedEthics(kernel: any): void;
  stop(): void;
  getState(key: string): any;
  enforceConstraints(constraints: any): void;
}
