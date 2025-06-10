
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { CognitiveDomain, DomainType } from './CognitiveDomain';

export class DomainRegistry {
  private static instance: DomainRegistry;
  private domains: Map<string, CognitiveDomain> = new Map();
  private eventEmitter = new BrowserEventEmitter();
  
  private constructor() {
    // Initialize with any core domains
  }
  
  public static getInstance(): DomainRegistry {
    if (!this.instance) {
      this.instance = new DomainRegistry();
    }
    return this.instance;
  }
  
  public createDomain(type: DomainType, name: string): CognitiveDomain {
    const id = `domain_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const domain = new CognitiveDomain(id, type, name);
    
    this.domains.set(id, domain);
    
    this.eventEmitter.emit('domain:registered', {
      domainId: id,
      type,
      name
    });
    
    return domain;
  }
  
  public getDomain(domainId: string): CognitiveDomain | undefined {
    return this.domains.get(domainId);
  }
  
  public listDomains(): { id: string; name: string; type: DomainType }[] {
    return Array.from(this.domains.values()).map(domain => ({
      id: domain.id,
      name: domain.name,
      type: domain.type
    }));
  }
  
  public findDomainsByType(type: DomainType): CognitiveDomain[] {
    return Array.from(this.domains.values()).filter(domain => domain.type === type);
  }
  
  public findDomainsByName(pattern: string): CognitiveDomain[] {
    const regex = new RegExp(pattern, 'i');
    return Array.from(this.domains.values()).filter(domain => regex.test(domain.name));
  }
  
  public connectDomains(sourceDomainId: string, targetDomainId: string): boolean {
    const sourceDomain = this.getDomain(sourceDomainId);
    const targetDomain = this.getDomain(targetDomainId);
    
    if (!sourceDomain || !targetDomain) {
      return false;
    }
    
    const result = sourceDomain.connectToDomain(targetDomainId);
    
    if (result) {
      this.eventEmitter.emit('domains:connected', {
        sourceDomainId,
        targetDomainId,
        timestamp: Date.now()
      });
    }
    
    return result;
  }
  
  public exportState(): Record<string, any> {
    const state: Record<string, any> = {};
    
    this.domains.forEach((domain, id) => {
      state[id] = {
        type: domain.type,
        name: domain.name,
        connections: domain.getConnections(),
        metadata: domain.getMetadata()
        // Note: For a real implementation, we would export entities and relations too
      };
    });
    
    return state;
  }
  
  public importState(state: any): boolean {
    try {
      // Clear existing domains
      this.domains.clear();
      
      // Import domains from state
      Object.entries(state).forEach(([id, domainData]: [string, any]) => {
        const domain = new CognitiveDomain(
          id,
          domainData.type,
          domainData.name
        );
        
        // Restore connections
        if (Array.isArray(domainData.connections)) {
          domainData.connections.forEach((connectedId: string) => {
            domain.connectToDomain(connectedId);
          });
        }
        
        // Restore metadata
        if (domainData.metadata) {
          domain.updateMetadata(domainData.metadata);
        }
        
        this.domains.set(id, domain);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import domain state:', error);
      return false;
    }
  }
  
  // Event subscription
  public on(event: string, handler: (data: any) => void): () => void {
    this.eventEmitter.on(event, handler);
    return () => this.eventEmitter.off(event, handler);
  }
  
  public off(event: string, handler: (data: any) => void): void {
    this.eventEmitter.off(event, handler);
  }
}

// Export singleton instance
export const domainRegistry = DomainRegistry.getInstance();
