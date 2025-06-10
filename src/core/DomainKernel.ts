
import { UniversalKernel, Module, ModuleMetadata } from './UniversalKernel';
import { BrowserEventEmitter } from './BrowserEventEmitter';
import { CognitiveDomain, DomainType } from './domains/CognitiveDomain';
import { domainRegistry } from './domains/DomainRegistry';
import { securityBridge } from './security/SecurityBridge';
import { createSystemEvent } from './utils/eventUtils';

/**
 * Domain-related event types
 */
export type DomainEventType = 
  | 'DOMAIN_CREATED'
  | 'DOMAIN_DELETED'
  | 'DOMAIN_UPDATED'
  | 'DOMAINS_CONNECTED'
  | 'DOMAIN_ENTITY_ADDED'
  | 'DOMAIN_ENTITY_UPDATED'
  | 'DOMAIN_ENTITY_REMOVED'
  | 'DOMAIN_RELATION_CREATED';

/**
 * Domain Kernel
 * 
 * Manages cognitive domains that function as self-contained knowledge networks,
 * replacing traditional internet access with domain-specific knowledge and entity
 * relationships.
 */
export class DomainKernel extends UniversalKernel {
  private domains: Map<string, CognitiveDomain> = new Map();
  public override events = new BrowserEventEmitter();
  
  constructor() {
    super();
    
    // Register with security bridge
    securityBridge.registerKernel('domain');
    
    // Setup event forwarding from domain registry
    domainRegistry.on('domain:registered', this.handleDomainRegistered);
    domainRegistry.on('domain:unregistered', this.handleDomainUnregistered);
    domainRegistry.on('domains:connected', this.handleDomainsConnected);
    domainRegistry.on('domain:event', this.handleDomainEvent);
    
    // Initialize with core domains
    this.setupCoreDomains();
  }
  
  /**
   * Set up core cognitive domains
   */
  private setupCoreDomains(): void {
    // Create foundation domains for key subject areas
    this.createDomain(DomainType.KNOWLEDGE, 'General Knowledge');
    this.createDomain(DomainType.SOCIAL, 'Social Interactions');
    this.createDomain(DomainType.PHILOSOPHICAL, 'Philosophical Concepts');
    this.createDomain(DomainType.REGULATORY, 'Regulatory Framework');
    this.createDomain(DomainType.SCIENTIFIC, 'Scientific Knowledge');
    this.createDomain(DomainType.CREATIVE, 'Creative Concepts');
    this.createDomain(DomainType.ANALYTICAL, 'Analytical Methods');
    this.createDomain(DomainType.CULTURAL, 'Cultural Understanding');
    
    // Connect related domains
    const domains = domainRegistry.listDomains();
    
    // Connect philosophical to regulatory and scientific
    const philosophicalDomains = domains.filter(d => d.type === DomainType.PHILOSOPHICAL);
    const regulatoryDomains = domains.filter(d => d.type === DomainType.REGULATORY);
    const scientificDomains = domains.filter(d => d.type === DomainType.SCIENTIFIC);
    
    if (philosophicalDomains.length > 0 && regulatoryDomains.length > 0) {
      domainRegistry.connectDomains(philosophicalDomains[0].id, regulatoryDomains[0].id);
    }
    
    if (philosophicalDomains.length > 0 && scientificDomains.length > 0) {
      domainRegistry.connectDomains(philosophicalDomains[0].id, scientificDomains[0].id);
    }
    
    // Connect knowledge domain to all other domains
    const knowledgeDomains = domains.filter(d => d.type === DomainType.KNOWLEDGE);
    if (knowledgeDomains.length > 0) {
      domains.forEach(domain => {
        if (domain.id !== knowledgeDomains[0].id) {
          domainRegistry.connectDomains(knowledgeDomains[0].id, domain.id);
        }
      });
    }
  }
  
  /**
   * Create a new cognitive domain
   */
  public createDomain(type: DomainType, name: string): CognitiveDomain {
    const domain = domainRegistry.createDomain(type, name);
    this.domains.set(domain.id, domain);
    
    this.broadcast('domain:created', {
      id: domain.id,
      type: domain.type,
      name: domain.name
    });
    
    return domain;
  }
  
  /**
   * Get a domain by ID
   */
  public getDomain(domainId: string): CognitiveDomain | undefined {
    return this.domains.get(domainId) || domainRegistry.getDomain(domainId);
  }
  
  /**
   * Connect two domains
   */
  public connectDomains(sourceDomainId: string, targetDomainId: string): boolean {
    return domainRegistry.connectDomains(sourceDomainId, targetDomainId);
  }
  
  /**
   * Find domains by type
   */
  public findDomainsByType(type: DomainType): CognitiveDomain[] {
    return domainRegistry.findDomainsByType(type);
  }
  
  /**
   * Find domains by name pattern
   */
  public findDomainsByName(pattern: string): CognitiveDomain[] {
    return domainRegistry.findDomainsByName(pattern);
  }
  
  /**
   * Get all domains
   */
  public getAllDomains(): { id: string; name: string; type: DomainType }[] {
    return domainRegistry.listDomains();
  }
  
  /**
   * Handle domain registration events
   */
  private handleDomainRegistered = (event: any): void => {
    const { domainId, type, name } = event.payload;
    const domain = domainRegistry.getDomain(domainId);
    
    if (domain) {
      this.domains.set(domainId, domain);
      
      this.broadcast('domain:registered', {
        domainId,
        type,
        name,
        timestamp: Date.now()
      });
    }
  };
  
  /**
   * Handle domain unregistration events
   */
  private handleDomainUnregistered = (event: any): void => {
    const { domainId } = event.payload;
    this.domains.delete(domainId);
    
    this.broadcast('domain:unregistered', {
      domainId,
      timestamp: Date.now()
    });
  };
  
  /**
   * Handle domains connection events
   */
  private handleDomainsConnected = (event: any): void => {
    const { sourceDomainId, targetDomainId } = event.payload;
    
    this.broadcast('domains:connected', {
      sourceDomainId,
      targetDomainId,
      timestamp: Date.now()
    });
  };
  
  /**
   * Handle domain events
   */
  private handleDomainEvent = (event: any): void => {
    // Forward the event with domain kernel context
    this.broadcast(`domain:${event.domainId}:${event.type}`, event);
    this.broadcast('domain:event', event);
  };
  
  /**
   * Subscribe to domain events
   */
  public onDomainEvent(eventType: string, handler: (event: any) => void): () => void {
    this.events.on(eventType, handler);
    return () => this.events.off(eventType, handler);
  }
  
  /**
   * Find entities across domains by criteria
   */
  public queryAcrossDomains(criteria: any): any[] {
    const results: any[] = [];
    
    // Search in all domains
    this.domains.forEach(domain => {
      const entities = domain.queryEntities(criteria);
      entities.forEach(entity => {
        results.push({
          domainId: domain.id,
          domainName: domain.name,
          domainType: domain.type,
          entity
        });
      });
    });
    
    return results;
  }
  
  /**
   * Export all domain states
   */
  public exportAllDomains(): Record<string, any> {
    return domainRegistry.exportState();
  }
  
  /**
   * Import domain states
   */
  public importAllDomains(state: any): boolean {
    return domainRegistry.importState(state);
  }
  
  /**
   * Shutdown the domain kernel
   */
  public shutdown(): void {
    // Unsubscribe from domain registry events
    domainRegistry.on('domain:registered', this.handleDomainRegistered);
    domainRegistry.on('domain:unregistered', this.handleDomainUnregistered);
    domainRegistry.on('domains:connected', this.handleDomainsConnected);
    domainRegistry.on('domain:event', this.handleDomainEvent);
    
    // Clear domains
    this.domains.clear();
    
    // Remove event listeners
    this.events.removeAllListeners();
    
    this.broadcast('domain:kernel:shutdown', { timestamp: Date.now() });
  }
}

// Export singleton instance
export const domainKernel = new DomainKernel();

// React hook for domain kernel access
import { useCallback, useState, useEffect } from 'react';

export const useDomainKernel = () => {
  const [domains, setDomains] = useState(domainKernel.getAllDomains());
  
  useEffect(() => {
    const updateDomains = () => {
      setDomains(domainKernel.getAllDomains());
    };
    
    // Subscribe to domain events
    const unsubscribeCreated = domainKernel.onDomainEvent('domain:registered', updateDomains);
    const unsubscribeDeleted = domainKernel.onDomainEvent('domain:unregistered', updateDomains);
    
    return () => {
      unsubscribeCreated();
      unsubscribeDeleted();
    };
  }, []);
  
  const createDomain = useCallback((type: DomainType, name: string) => {
    return domainKernel.createDomain(type, name);
  }, []);
  
  const connectDomains = useCallback((sourceId: string, targetId: string) => {
    return domainKernel.connectDomains(sourceId, targetId);
  }, []);
  
  return {
    domains,
    createDomain,
    connectDomains,
    getDomain: domainKernel.getDomain.bind(domainKernel),
    findDomainsByType: domainKernel.findDomainsByType.bind(domainKernel),
    findDomainsByName: domainKernel.findDomainsByName.bind(domainKernel),
    queryAcrossDomains: domainKernel.queryAcrossDomains.bind(domainKernel),
    kernel: domainKernel
  };
};
