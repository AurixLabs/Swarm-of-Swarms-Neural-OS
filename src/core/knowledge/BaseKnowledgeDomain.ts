
import { KnowledgeDomain, KnowledgeResponse, KnowledgeCapability, KnowledgeSource } from '../types/KnowledgeDomainTypes';
import { BrowserEventEmitter } from '../BrowserEventEmitter';

/**
 * BaseKnowledgeDomain - Abstract base class for all knowledge domains
 * 
 * Provides common functionality and enforces the KnowledgeDomain interface
 */
export abstract class BaseKnowledgeDomain implements KnowledgeDomain {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  private domainWeight: number = 1.0;
  protected events = new BrowserEventEmitter();
  protected initialized: boolean = false;
  protected stateMap: Map<string, any> = new Map();
  
  constructor(id: string, name: string, type: string) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
  
  public initialize(): boolean {
    if (this.initialized) return true;
    
    this.initialized = true;
    console.log(`${this.name} knowledge domain initialized`);
    this.events.emit('domain:initialized', { id: this.id, timestamp: Date.now() });
    
    return true;
  }
  
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  public shutdown(): void {
    this.initialized = false;
    this.events.removeAllListeners();
    console.log(`${this.name} knowledge domain shutdown`);
  }
  
  public abstract query(question: string, context?: any): Promise<KnowledgeResponse>;
  
  public abstract getCapabilities(): KnowledgeCapability[];
  
  public getWeight(): number {
    return this.domainWeight;
  }
  
  public setWeight(weight: number): void {
    this.domainWeight = Math.max(0, Math.min(1, weight)); // Constrain to [0,1]
    this.events.emit('weight:updated', { 
      id: this.id, 
      weight: this.domainWeight, 
      timestamp: Date.now() 
    });
  }
  
  public getState(key: string): any {
    return this.stateMap.get(key);
  }
  
  public setState(key: string, value: any): void {
    this.stateMap.set(key, value);
  }
  
  protected createResponse(
    answer: string, 
    confidence: number = 0.8,
    sources: KnowledgeSource[] = [],
    relatedConcepts: string[] = []
  ): KnowledgeResponse {
    return {
      answer,
      confidence,
      sources,
      relatedConcepts,
      metadata: {
        domainId: this.id,
        domainType: this.type,
        processingTime: 0, // Will be set by caller
        timestamp: Date.now()
      }
    };
  }
  
  public on(event: string, handler: (data: any) => void): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }
}
