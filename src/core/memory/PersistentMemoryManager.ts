import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { Memory, MemoryType, MemoryPriority, TemporalScope } from '../interfaces/MemoryTypes';
import { cognitiveCache } from '../intelligence/CognitiveCache';
import { v4 as uuidv4 } from 'uuid';

/**
 * PersistentMemoryManager - Manages persistent memory for AI agents across modules
 * 
 * This class provides a unified interface for storing and retrieving memories
 * that persist across module boundaries and application sessions.
 */
export class PersistentMemoryManager {
  private static instance: PersistentMemoryManager;
  private memories: Map<string, Memory> = new Map();
  private events: BrowserEventEmitter;
  private persistenceEnabled = true;
  private storageKey = 'cma-persistent-memories';
  private isLoading = false;
  private isSaving = false;
  private lastSaveTime = 0;
  private saveDebounceTime = 2000; // 2 seconds
  
  /**
   * Private constructor - use getInstance() instead
   */
  private constructor(events: BrowserEventEmitter) {
    this.events = events;
    this.loadFromStorage();
    this.setupAutosave();
    this.setupEventHandlers();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(events: BrowserEventEmitter): PersistentMemoryManager {
    if (!PersistentMemoryManager.instance) {
      PersistentMemoryManager.instance = new PersistentMemoryManager(events);
    }
    return PersistentMemoryManager.instance;
  }
  
  /**
   * Store a memory that persists across modules and sessions
   */
  public async storeMemory(memory: Memory): Promise<string> {
    const id = memory.id || uuidv4();
    const memoryWithId = { ...memory, id };
    
    this.memories.set(id, memoryWithId);
    
    // Add to cache for faster access
    cognitiveCache.set(`memory:${id}`, memoryWithId);
    
    // Schedule save to persistent storage
    this.scheduleSave();
    
    // Emit event for other modules
    this.events.emit('memory:stored', { memory: memoryWithId });
    
    return id;
  }
  
  /**
   * Retrieve a memory by ID
   */
  public getMemory(id: string): Memory | undefined {
    // Try cache first
    const cached = cognitiveCache.get(`memory:${id}`);
    if (cached) {
      return cached;
    }
    
    // Fall back to memory map
    return this.memories.get(id);
  }
  
  /**
   * Query memories based on type, tags, etc.
   */
  public queryMemories(query: { 
    type?: MemoryType, 
    tags?: string[], 
    domain?: string[],
    minConfidence?: number,
    temporal?: TemporalScope
  }): Memory[] {
    const results: Memory[] = [];
    
    for (const memory of this.memories.values()) {
      if (query.type && memory.type !== query.type) continue;
      if (query.tags && !query.tags.every(tag => memory.tags.includes(tag))) continue;
      if (query.minConfidence && memory.metadata.confidence < query.minConfidence) continue;
      if (query.domain && !query.domain.every(domain => memory.context.domain.includes(domain))) continue;
      if (query.temporal && memory.context.temporal !== query.temporal) continue;
      
      results.push(memory);
    }
    
    return results;
  }
  
  /**
   * Update a memory
   */
  public updateMemory(id: string, updates: Partial<Memory>): Memory | undefined {
    const memory = this.memories.get(id);
    if (!memory) return undefined;
    
    const updatedMemory = { ...memory, ...updates };
    this.memories.set(id, updatedMemory);
    
    // Update cache
    cognitiveCache.set(`memory:${id}`, updatedMemory);
    
    // Schedule save
    this.scheduleSave();
    
    // Emit event
    this.events.emit('memory:updated', { memory: updatedMemory });
    
    return updatedMemory;
  }
  
  /**
   * Delete a memory
   */
  public deleteMemory(id: string): boolean {
    const result = this.memories.delete(id);
    
    if (result) {
      // Remove from cache
      cognitiveCache.delete(`memory:${id}`);
      
      // Schedule save
      this.scheduleSave();
      
      // Emit event
      this.events.emit('memory:deleted', { memoryId: id });
    }
    
    return result;
  }
  
  /**
   * Load memories from storage
   */
  private async loadFromStorage(): Promise<void> {
    if (this.isLoading || !this.persistenceEnabled) return;
    
    this.isLoading = true;
    
    try {
      // Load from localStorage
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, Memory>;
        
        // Clear existing memories and repopulate
        this.memories.clear();
        
        Object.entries(parsed).forEach(([id, memory]) => {
          this.memories.set(id, memory);
          // Preload into cache
          cognitiveCache.set(`memory:${id}`, memory);
        });
        
        console.log(`Loaded ${this.memories.size} memories from persistent storage`);
      }
    } catch (error) {
      console.error('Error loading memories from storage:', error);
      this.events.emit('memory:load:error', { error });
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Save memories to storage
   */
  private async saveToStorage(): Promise<void> {
    if (this.isSaving || !this.persistenceEnabled) return;
    
    this.isSaving = true;
    
    try {
      // Convert memories map to object for storage
      const memoriesToSave: Record<string, Memory> = {};
      this.memories.forEach((memory, id) => {
        memoriesToSave[id] = memory;
      });
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(memoriesToSave));
      
      this.lastSaveTime = Date.now();
      console.log(`Saved ${this.memories.size} memories to persistent storage`);
    } catch (error) {
      console.error('Error saving memories to storage:', error);
      this.events.emit('memory:save:error', { error });
    } finally {
      this.isSaving = false;
    }
  }
  
  /**
   * Schedule a save operation with debouncing
   */
  private scheduleSave(): void {
    const now = Date.now();
    const timeSinceLastSave = now - this.lastSaveTime;
    
    if (timeSinceLastSave > this.saveDebounceTime) {
      // Save immediately if it's been a while
      this.saveToStorage();
    } else {
      // Otherwise debounce
      setTimeout(() => {
        this.saveToStorage();
      }, this.saveDebounceTime - timeSinceLastSave);
    }
  }
  
  /**
   * Setup autosave timer
   */
  private setupAutosave(): void {
    // Auto-save every 5 minutes as a backup
    setInterval(() => {
      if (this.persistenceEnabled) {
        this.saveToStorage();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
  
  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Listen for memory operations from other modules
    this.events.on('memory:store:request', (data: { memory: Memory }) => {
      if (data && data.memory) {
        this.storeMemory(data.memory);
      }
    });
    
    this.events.on('memory:retrieve:request', (data: { id: string, replyEvent: string }) => {
      if (data && data.id && data.replyEvent) {
        const memory = this.getMemory(data.id);
        this.events.emit(data.replyEvent, { memory });
      }
    });
    
    // Handle browser events
    if (typeof window !== 'undefined') {
      // Save when user navigates away
      window.addEventListener('beforeunload', () => {
        this.saveToStorage();
      });
    }
  }
  
  /**
   * Enable or disable persistence
   */
  public setPersistenceEnabled(enabled: boolean): void {
    this.persistenceEnabled = enabled;
    
    if (enabled) {
      this.loadFromStorage();
    }
  }
  
  /**
   * Clear all memories
   */
  public clearAllMemories(): void {
    this.memories.clear();
    
    // Clear from cache too
    for (const key of Object.keys(cognitiveCache)) {
      if (key.startsWith('memory:')) {
        cognitiveCache.delete(key);
      }
    }
    
    // Save empty state
    this.saveToStorage();
    
    // Emit event
    this.events.emit('memory:cleared', { timestamp: Date.now() });
  }
}

/**
 * Factory function for creating the PersistentMemoryManager
 */
export const createPersistentMemoryManager = (
  events: BrowserEventEmitter
): PersistentMemoryManager => {
  return PersistentMemoryManager.getInstance(events);
};
