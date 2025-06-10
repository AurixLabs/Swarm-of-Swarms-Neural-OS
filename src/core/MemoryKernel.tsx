
import { BrowserEventEmitter } from './BrowserEventEmitter';
import { v4 as uuidv4 } from 'uuid';
import { MemoryManipulation } from './MemoryManipulation';
import { createSystemEvent } from './utils/eventUtils';
import { UniversalKernel, Module, ModuleOptions, ModuleMetadata } from './UniversalKernel';
import { Memory, MemoryType, MemoryPriority, MemoryQuery, MemoryMetadata, TemporalScope, MemoryEventType } from './interfaces/MemoryTypes';

export interface MemoryModule extends Module {
  onMemoryEvent(
    eventType: MemoryEventType, 
    handler: (memory: Memory, event: any) => void
  ): () => void;
  
  storeMemory(memory: Memory): Promise<Memory>;
  retrieveMemory(id: string): Promise<Memory | undefined>;
  queryMemories(query: MemoryQuery): Promise<Memory[]>;
  updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | undefined>;
  deleteMemory(id: string): Promise<boolean>;
  
  linkMemories(sourceId: string, targetId: string): Promise<boolean>;
  fragmentMemory(memory: Memory): Promise<any[] | undefined>;
  mergeMemories(memory1: Memory, memory2: Memory): Promise<Memory | undefined>;
  archiveMemory(memory: Memory): Promise<Memory | undefined>;
  contextualizeMemory(memory: Memory, context: any): Promise<Memory | undefined>;
  prioritizeMemory(memory: Memory, priority: MemoryPriority): Promise<Memory | undefined>;
}

export class MemoryKernel extends UniversalKernel {
  private memories: Map<string, Memory> = new Map();
  private memoryModules: Map<string, MemoryModule> = new Map();
  private memoryManipulation: MemoryManipulation = new MemoryManipulation();
  
  constructor() {
    super();
    this.initializeEventHandlers();
  }
  
  private initializeEventHandlers(): void {
    // Initialize event handlers using the existing events property from parent
  }

  public override registerModule(moduleId: string, module: Module, options: ModuleOptions = {}): boolean {
    const memoryModule = module as MemoryModule;
    if (!memoryModule.id) {
      console.error('Module must have an id property');
      return false;
    }
    
    if (!this.memoryModules.has(memoryModule.id)) {
      this.memoryModules.set(memoryModule.id, memoryModule);
      return true;
    }
    return false;
  }

  public override unregisterModule(moduleId: string): boolean {
    if (this.memoryModules.has(moduleId)) {
      this.memoryModules.delete(moduleId);
      return true;
    }
    return false;
  }

  public override getModule<T extends Module>(moduleId: string): T | undefined {
    return this.memoryModules.get(moduleId) as unknown as T | undefined;
  }

  public listModules(): string[] {
    return Array.from(this.memoryModules.keys());
  }

  public async storeMemory(memory: Memory): Promise<Memory> {
    const id = memory.id || uuidv4();
    const newMemory = { ...memory, id };
    this.memories.set(id, newMemory);
    
    this.emitMemoryEvent('MEMORY_STORED', newMemory);
    
    return newMemory;
  }

  public async retrieveMemory(id: string): Promise<Memory | undefined> {
    const memory = this.memories.get(id);
    
    if (memory) {
      this.emitMemoryEvent('MEMORY_RETRIEVED', memory);
    }
    
    return memory;
  }

  public async queryMemories(query: MemoryQuery): Promise<Memory[]> {
    const results: Memory[] = [];
    
    for (const memory of this.memories.values()) {
      if (query.type && memory.type !== query.type) continue;
      if (query.tags && !query.tags.every(tag => memory.tags.includes(tag))) continue;
      if (query.minConfidence && memory.metadata.confidence < query.minConfidence) continue;
      if (query.domain && !query.domain.every(domain => memory.context.domain.includes(domain))) continue;
      if (query.temporal && memory.context.temporal !== query.temporal) continue;
      
      results.push(memory);
    }
    
    this.emitMemoryEvent('MEMORY_RECALLED', { query, count: results.length });
    
    return results;
  }

  public async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | undefined> {
    const memory = this.memories.get(id);
    if (!memory) return undefined;
    
    const updatedMemory = { ...memory, ...updates };
    this.memories.set(id, updatedMemory);
    
    this.emitMemoryEvent('MEMORY_UPDATED', updatedMemory);
    
    return updatedMemory;
  }

  public async deleteMemory(id: string): Promise<boolean> {
    if (!this.memories.has(id)) return false;
    
    this.memories.delete(id);
    
    this.emitMemoryEvent('MEMORY_DELETED', { memoryId: id });
    
    return true;
  }

  public async linkMemories(sourceId: string, targetId: string): Promise<boolean> {
    const sourceMemory = this.memories.get(sourceId);
    const targetMemory = this.memories.get(targetId);
    
    if (!sourceMemory || !targetMemory) return false;
    
    if (!sourceMemory.linkedMemories) {
      sourceMemory.linkedMemories = [];
    }
    
    if (!sourceMemory.linkedMemories.includes(targetId)) {
      sourceMemory.linkedMemories.push(targetId);
      this.emitMemoryEvent('MEMORY_LINKED', { sourceId, targetId });
      return true;
    }
    
    return false;
  }

  public async fragmentMemory(memory: Memory): Promise<any[] | undefined> {
    const result = this.memoryManipulation.fragmentMemory(memory);
    
    if (result.success && result.fragments) {
      this.emitMemoryEvent('MEMORY_FRAGMENTED', { memoryId: memory.id, fragments: result.fragments });
      return result.fragments;
    }
    
    return undefined;
  }

  public async mergeMemories(memory1: Memory, memory2: Memory): Promise<Memory | undefined> {
    if (!memory1 || !memory2) return undefined;
    
    const mergedMemory = this.memoryManipulation.mergeMemories(memory1, memory2);
    
    if (mergedMemory) {
      this.memories.set(mergedMemory.id!, mergedMemory);
      this.emitMemoryEvent('MEMORY_MERGED', { memory1Id: memory1.id, memory2Id: memory2.id, mergedMemoryId: mergedMemory.id });
      return mergedMemory;
    }
    
    return undefined;
  }

  public async archiveMemory(memory: Memory): Promise<Memory | undefined> {
    if (!memory) return undefined;
    
    const archivedMemory = this.memoryManipulation.archiveMemory(memory);
    
    if (archivedMemory) {
      this.memories.set(archivedMemory.id!, archivedMemory);
      this.emitMemoryEvent('MEMORY_ARCHIVED', { memoryId: memory.id });
      return archivedMemory;
    }
    
    return undefined;
  }

  public async contextualizeMemory(memory: Memory, context: any): Promise<Memory | undefined> {
    if (!memory) return undefined;
    
    const contextualizedMemory = this.memoryManipulation.contextualizeMemory(memory, context);
    
    if (contextualizedMemory) {
      this.memories.set(contextualizedMemory.id!, contextualizedMemory);
      this.emitMemoryEvent('MEMORY_CONTEXTUALIZED', { memoryId: memory.id, context });
      return contextualizedMemory;
    }
    
    return undefined;
  }

  public async prioritizeMemory(memory: Memory, priority: MemoryPriority): Promise<Memory | undefined> {
    if (!memory) return undefined;
    
    const prioritizedMemory = this.memoryManipulation.prioritizeMemory(memory, priority);
    
    if (prioritizedMemory) {
      this.memories.set(prioritizedMemory.id!, prioritizedMemory);
      this.emitMemoryEvent('MEMORY_PRIORITIZED', { memoryId: memory.id, priority });
      return prioritizedMemory;
    }
    
    return undefined;
  }

  private emitMemoryEvent(eventType: MemoryEventType, payload: any): void {
    const event = createSystemEvent(eventType, payload);
    this.events.emit(eventType, event);
  }

  public onMemoryEvent(
    eventType: MemoryEventType, 
    handler: (memory: Memory, event: any) => void
  ): () => void {
    this.events.on(eventType, (event: any) => {
      handler(event.payload, event);
    });
    
    return () => this.events.off(eventType, handler);
  }
  
  public shutdown(): void {
    this.memories.clear();
    this.memoryModules.clear();
    this.events.removeAllListeners();
  }
}

export const memoryKernel = new MemoryKernel();
