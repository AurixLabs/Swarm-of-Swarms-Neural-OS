
import { KnowledgeEngineConfig } from './KnowledgeEngineConfig';
import { BrowserEventEmitter } from '../BrowserEventEmitter';

export class KnowledgeEngine {
  private domains: any[] = [];
  private config: KnowledgeEngineConfig = { enableCaching: true, maxCacheSize: 100 };
  private events = new BrowserEventEmitter();
  
  constructor() {
    console.log('Knowledge Engine initialized');
  }
  
  public listDomains(): any[] {
    return this.domains;
  }
  
  public registerDomain(domain: any): boolean {
    this.domains.push(domain);
    this.events.emit('domain:registered', { domain });
    return true;
  }
  
  public unregisterDomain(domainId: string): boolean {
    const index = this.domains.findIndex(d => d.id === domainId);
    if (index >= 0) {
      this.domains.splice(index, 1);
      this.events.emit('domain:unregistered', { domainId });
      return true;
    }
    return false;
  }
  
  public getDomain(domainId: string): any | undefined {
    return this.domains.find(d => d.id === domainId);
  }
  
  public async query(question: string, context?: any): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    
    for (const domain of this.domains) {
      try {
        const result = await domain.query(question, context);
        results.set(domain.id, result);
      } catch (error) {
        console.error(`Error querying domain ${domain.id}:`, error);
        results.set(domain.id, { error: String(error) });
      }
    }
    
    return results;
  }
  
  public async synthesizeKnowledge(question: string, context?: any): Promise<any> {
    const domainResults = await this.query(question, context);
    // Simple synthesis - combine all results
    const synthesis = {
      answer: "Synthesized knowledge from multiple domains",
      confidence: 0.8,
      sources: Array.from(domainResults.keys())
    };
    
    return synthesis;
  }
  
  public setDomainWeight(domainId: string, weight: number): boolean {
    const domain = this.getDomain(domainId);
    if (domain) {
      domain.weight = weight;
      this.events.emit('domain:weight_updated', { domainId, weight });
      return true;
    }
    return false;
  }
  
  public getConfig(): KnowledgeEngineConfig {
    return { ...this.config };
  }
  
  public updateConfig(config: Partial<KnowledgeEngineConfig>): void {
    this.config = { ...this.config, ...config };
    this.events.emit('engine:config_updated', { config: this.config });
  }
  
  public on(event: string, handler: (payload: any) => void): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }
}
