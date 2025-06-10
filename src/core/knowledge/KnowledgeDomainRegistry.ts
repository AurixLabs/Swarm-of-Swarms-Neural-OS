
// Browser-compatible EventEmitter implementation
class BrowserEventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

export interface KnowledgeDomain {
  id: string;
  name: string;
  type: string;
  weight: number;
  isActive: boolean;
  capabilities: string[];
  query(question: string, context?: any): Promise<any>;
}

export class KnowledgeDomainRegistry extends BrowserEventEmitter {
  private domains: Map<string, KnowledgeDomain> = new Map();
  private isInitialized = false;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('🧠 Knowledge Domain Registry initializing...');
      
      // Register default domains
      this.registerDefaultDomains();
      
      this.isInitialized = true;
      this.emit('registry:initialized');
      console.log('✅ Knowledge Domain Registry initialized');
    } catch (error) {
      console.error('❌ Error initializing Knowledge Domain Registry:', error);
    }
  }

  private registerDefaultDomains(): void {
    // Register basic knowledge domains
    const defaultDomains = [
      {
        id: 'general',
        name: 'General Knowledge',
        type: 'base',
        weight: 1.0,
        isActive: true,
        capabilities: ['general_queries', 'basic_reasoning'],
        query: async (question: string) => ({
          answer: `General knowledge response for: ${question}`,
          confidence: 0.7,
          source: 'general'
        })
      },
      {
        id: 'technical',
        name: 'Technical Knowledge',
        type: 'specialized',
        weight: 1.2,
        isActive: true,
        capabilities: ['code_analysis', 'system_design', 'troubleshooting'],
        query: async (question: string) => ({
          answer: `Technical analysis for: ${question}`,
          confidence: 0.8,
          source: 'technical'
        })
      }
    ];

    defaultDomains.forEach(domain => {
      this.domains.set(domain.id, domain as KnowledgeDomain);
    });
  }

  registerDomain(domain: KnowledgeDomain): void {
    this.domains.set(domain.id, domain);
    this.emit('domain:registered', domain);
  }

  unregisterDomain(domainId: string): boolean {
    const success = this.domains.delete(domainId);
    if (success) {
      this.emit('domain:unregistered', domainId);
    }
    return success;
  }

  getDomain(domainId: string): KnowledgeDomain | undefined {
    return this.domains.get(domainId);
  }

  listDomains(): KnowledgeDomain[] {
    return Array.from(this.domains.values());
  }

  getActiveDomains(): KnowledgeDomain[] {
    return this.listDomains().filter(domain => domain.isActive);
  }

  setDomainWeight(domainId: string, weight: number): boolean {
    const domain = this.domains.get(domainId);
    if (domain) {
      domain.weight = weight;
      this.emit('domain:weight_updated', { domainId, weight });
      return true;
    }
    return false;
  }

  async queryDomains(question: string, context?: any): Promise<Map<string, any>> {
    const results = new Map();
    const activeDomains = this.getActiveDomains();

    for (const domain of activeDomains) {
      try {
        const result = await domain.query(question, context);
        results.set(domain.id, result);
      } catch (error) {
        console.error(`Error querying domain ${domain.id}:`, error);
        results.set(domain.id, { error: error.message });
      }
    }

    return results;
  }

  getMetrics(): any {
    return {
      totalDomains: this.domains.size,
      activeDomains: this.getActiveDomains().length,
      domainTypes: this.getDomainTypeDistribution(),
      averageWeight: this.getAverageWeight()
    };
  }

  private getDomainTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    this.listDomains().forEach(domain => {
      distribution[domain.type] = (distribution[domain.type] || 0) + 1;
    });
    return distribution;
  }

  private getAverageWeight(): number {
    const domains = this.listDomains();
    if (domains.length === 0) return 0;
    const totalWeight = domains.reduce((sum, domain) => sum + domain.weight, 0);
    return totalWeight / domains.length;
  }
}

export const knowledgeDomainRegistry = new KnowledgeDomainRegistry();
