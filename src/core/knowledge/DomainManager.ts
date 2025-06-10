
import { KnowledgeDomain, KnowledgeResponse } from '../types/KnowledgeDomainTypes';
import { KnowledgeEventManager } from './KnowledgeEventManager';

export class DomainManager {
  private domains: Map<string, KnowledgeDomain>;
  private eventManager: KnowledgeEventManager;

  constructor(eventManager: KnowledgeEventManager) {
    this.domains = new Map();
    this.eventManager = eventManager;
  }

  public registerDomain(domain: KnowledgeDomain): void {
    if (this.domains.has(domain.id)) {
      console.warn(`Domain with ID ${domain.id} already registered`);
      return;
    }

    this.domains.set(domain.id, domain);
    domain.initialize();
    
    this.eventManager.emit({
      type: 'domain:registered',
      payload: {
        domainId: domain.id,
        domainType: domain.type || 'unknown',
        domainName: domain.name
      },
      timestamp: Date.now()
    });
  }

  public unregisterDomain(domainId: string): boolean {
    const domain = this.domains.get(domainId);
    if (!domain) return false;

    if (domain.shutdown) {
      domain.shutdown();
    }
    this.domains.delete(domainId);
    
    this.eventManager.emit({
      type: 'domain:unregistered',
      payload: { domainId },
      timestamp: Date.now()
    });
    
    return true;
  }

  public getDomain(domainId: string): KnowledgeDomain | undefined {
    return this.domains.get(domainId);
  }

  public listDomains(): { id: string; name: string; type: string; weight: number }[] {
    return Array.from(this.domains.values()).map(domain => ({
      id: domain.id,
      name: domain.name,
      type: domain.type || 'unknown',
      weight: domain.getWeight ? domain.getWeight() : 1.0
    }));
  }

  public getEnabledDomains(): KnowledgeDomain[] {
    return Array.from(this.domains.values());
  }

  public async queryDomains(question: string, context?: any): Promise<Map<string, KnowledgeResponse>> {
    const results = new Map<string, KnowledgeResponse>();
    const enabledDomains = this.getEnabledDomains();
    
    const queryPromises = enabledDomains.map(async domain => {
      try {
        if (domain.query) {
          const startTime = Date.now();
          const response = await domain.query(question, context);
          const endTime = Date.now();
          
          results.set(domain.id, {
            ...response,
            confidence: response.confidence * (domain.getWeight ? domain.getWeight() : 1.0),
            metadata: {
              ...response.metadata,
              processingTime: endTime - startTime
            }
          });
        }
      } catch (error) {
        console.error(`Error querying domain ${domain.id}:`, error);
      }
    });
    
    await Promise.all(queryPromises);
    return results;
  }
}
