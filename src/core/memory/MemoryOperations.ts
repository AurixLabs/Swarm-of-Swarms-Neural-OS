
import { Memory, MemoryQuery, MemoryType, MemoryPriority, TemporalScope } from '../interfaces/MemoryTypes';

export class MemoryOperations {
  private memories: Map<string, Memory> = new Map();

  public storeMemory(memory: Memory): string {
    const id = this.generateId();
    memory.id = id;
    this.memories.set(id, memory);
    return id;
  }

  public retrieveMemory(id: string): Memory | undefined {
    return this.memories.get(id);
  }

  public updateMemory(id: string, updates: Partial<Memory>): boolean {
    const memory = this.memories.get(id);
    if (!memory) return false;
    
    const updatedMemory = { ...memory, ...updates };
    this.memories.set(id, updatedMemory);
    return true;
  }

  public deleteMemory(id: string): boolean {
    return this.memories.delete(id);
  }

  public recallMemories(query: MemoryQuery): Memory[] {
    const results: Memory[] = [];
    
    for (const memory of this.memories.values()) {
      if (query.type && memory.type !== query.type) continue;
      if (query.tags && !query.tags.every(tag => memory.tags.includes(tag))) continue;
      if (query.minConfidence && memory.metadata.confidence < query.minConfidence) continue;
      if (query.domain && !query.domain.some(domain => memory.context.domain.includes(domain))) continue;
      
      results.push(memory);
    }
    
    return results;
  }

  public forgetMemories(query: MemoryQuery): string[] {
    const forgottenIds: string[] = [];
    
    for (const [id, memory] of this.memories.entries()) {
      if (query.type && memory.type !== query.type) continue;
      if (query.tags && !query.tags.every(tag => memory.tags.includes(tag))) continue;
      if (query.minConfidence && memory.metadata.confidence < query.minConfidence) continue;
      if (query.domain && !query.domain.some(domain => memory.context.domain.includes(domain))) continue;
      
      this.memories.delete(id);
      forgottenIds.push(id);
    }
    
    return forgottenIds;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public clear(): void {
    this.memories.clear();
  }
}
