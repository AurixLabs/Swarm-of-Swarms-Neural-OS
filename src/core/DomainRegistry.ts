
/**
 * Domain Registry - Manages knowledge domains and their capabilities
 */

export interface KnowledgeDomain {
  id: string;
  name: string;
  type: 'specialized' | 'general' | 'hybrid';
  capabilities: string[];
  weight: number;
  status: 'active' | 'idle' | 'learning';
}

export interface DomainQuery {
  question: string;
  context?: Record<string, any>;
  requiredCapabilities?: string[];
}

export interface DomainResponse {
  answer: string;
  confidence: number;
  sources: string[];
  reasoning: string;
}

export class DomainRegistry {
  private domains: Map<string, KnowledgeDomain> = new Map();
  private domainHandlers: Map<string, (query: DomainQuery) => Promise<DomainResponse>> = new Map();

  constructor() {
    this.initializeDefaultDomains();
  }

  private initializeDefaultDomains() {
    // Core system domains
    this.registerDomain({
      id: 'system',
      name: 'System Operations',
      type: 'specialized',
      capabilities: ['monitoring', 'diagnostics', 'performance'],
      weight: 1.0,
      status: 'active'
    });

    this.registerDomain({
      id: 'security',
      name: 'Security & Ethics',
      type: 'specialized',
      capabilities: ['threat-detection', 'ethical-reasoning', 'compliance'],
      weight: 1.0,
      status: 'active'
    });

    this.registerDomain({
      id: 'ai',
      name: 'Artificial Intelligence',
      type: 'specialized',
      capabilities: ['reasoning', 'learning', 'pattern-recognition'],
      weight: 1.0,
      status: 'active'
    });

    this.registerDomain({
      id: 'memory',
      name: 'Memory & Storage',
      type: 'specialized',
      capabilities: ['storage', 'retrieval', 'indexing'],
      weight: 1.0,
      status: 'active'
    });
  }

  registerDomain(domain: KnowledgeDomain): boolean {
    try {
      this.domains.set(domain.id, domain);
      return true;
    } catch (error) {
      console.error(`Failed to register domain ${domain.id}:`, error);
      return false;
    }
  }

  getDomain(id: string): KnowledgeDomain | undefined {
    return this.domains.get(id);
  }

  getAllDomains(): KnowledgeDomain[] {
    return Array.from(this.domains.values());
  }

  getActiveDomains(): KnowledgeDomain[] {
    return this.getAllDomains().filter(domain => domain.status === 'active');
  }

  findDomainsByCapability(capability: string): KnowledgeDomain[] {
    return this.getAllDomains().filter(domain => 
      domain.capabilities.includes(capability)
    );
  }

  async queryDomain(domainId: string, query: DomainQuery): Promise<DomainResponse | null> {
    const handler = this.domainHandlers.get(domainId);
    if (!handler) {
      return null;
    }

    try {
      return await handler(query);
    } catch (error) {
      console.error(`Error querying domain ${domainId}:`, error);
      return null;
    }
  }

  registerDomainHandler(
    domainId: string, 
    handler: (query: DomainQuery) => Promise<DomainResponse>
  ): boolean {
    try {
      this.domainHandlers.set(domainId, handler);
      return true;
    } catch (error) {
      console.error(`Failed to register handler for domain ${domainId}:`, error);
      return false;
    }
  }

  updateDomainWeight(domainId: string, weight: number): boolean {
    const domain = this.domains.get(domainId);
    if (domain) {
      domain.weight = Math.max(0, Math.min(1, weight)); // Clamp between 0 and 1
      return true;
    }
    return false;
  }

  setDomainStatus(domainId: string, status: KnowledgeDomain['status']): boolean {
    const domain = this.domains.get(domainId);
    if (domain) {
      domain.status = status;
      return true;
    }
    return false;
  }

  getSystemMetrics() {
    const domains = this.getAllDomains();
    return {
      totalDomains: domains.length,
      activeDomains: domains.filter(d => d.status === 'active').length,
      averageWeight: domains.reduce((sum, d) => sum + d.weight, 0) / domains.length,
      capabilities: Array.from(new Set(domains.flatMap(d => d.capabilities))),
      registeredHandlers: this.domainHandlers.size
    };
  }
}

// Export singleton instance
export const domainRegistry = new DomainRegistry();
