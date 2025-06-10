import { BaseKnowledgeDomain } from './BaseKnowledgeDomain';
import { artsKnowledgeDomain } from './domains/ArtsKnowledgeDomain';

export class KnowledgeRegistry {
  private static instance: KnowledgeRegistry;
  private domains: Map<string, BaseKnowledgeDomain> = new Map();
  private initialized = false;
  
  private constructor() {}
  
  public static getInstance(): KnowledgeRegistry {
    if (!KnowledgeRegistry.instance) {
      KnowledgeRegistry.instance = new KnowledgeRegistry();
    }
    return KnowledgeRegistry.instance;
  }

  public initialize(): void {
    if (this.initialized) return;
    
    // Register core domains
    this.registerDomain(artsKnowledgeDomain);
    
    this.initialized = true;
  }

  public registerDomain(domain: BaseKnowledgeDomain): void {
    if (this.domains.has(domain.id)) {
      console.warn(`Knowledge domain with ID ${domain.id} already registered.`);
      return;
    }
    this.domains.set(domain.id, domain);
    console.log(`Registered knowledge domain: ${domain.name} (${domain.id})`);
  }

  public unregisterDomain(domainId: string): void {
    if (!this.domains.has(domainId)) {
      console.warn(`Knowledge domain with ID ${domainId} not found.`);
      return;
    }
    this.domains.delete(domainId);
    console.log(`Unregistered knowledge domain: ${domainId}`);
  }

  public getDomain(domainId: string): BaseKnowledgeDomain | undefined {
    return this.domains.get(domainId);
  }

  public listDomains(): string[] {
    return Array.from(this.domains.keys());
  }
}

// Export singleton instance
export const knowledgeRegistry = KnowledgeRegistry.getInstance();
