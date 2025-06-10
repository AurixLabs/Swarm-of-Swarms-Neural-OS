
import { PersistentMemoryManager } from './PersistentMemoryManager';
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { Memory, MemoryType, MemoryPriority, TemporalScope } from '../interfaces/MemoryTypes';
import { browserStorageAdapter } from '../adapters/browser/BrowserStorageAdapter';

/**
 * AgentMemoryManager - Enhanced memory management for AI agents
 * with multi-layered persistence and optimization for low-resource environments
 */
export class AgentMemoryManager {
  private static instance: AgentMemoryManager;
  private events: BrowserEventEmitter;
  private memoryManager: PersistentMemoryManager;
  private agentMemories = new Map<string, Array<Memory>>();
  private syncInterval: number | null = null;
  private storageAdapter = browserStorageAdapter;
  private deviceCapabilities = {
    isLowEndDevice: false,
    isLowBattery: false,
    isOffline: false
  };
  
  private constructor(events: BrowserEventEmitter) {
    this.events = events;
    this.memoryManager = PersistentMemoryManager.getInstance(events);
    this.detectDeviceCapabilities();
    this.setupEventListeners();
    this.startSyncInterval();
  }
  
  public static getInstance(events: BrowserEventEmitter): AgentMemoryManager {
    if (!AgentMemoryManager.instance) {
      AgentMemoryManager.instance = new AgentMemoryManager(events);
    }
    return AgentMemoryManager.instance;
  }
  
  /**
   * Detect device capabilities to optimize memory operations
   */
  private detectDeviceCapabilities(): void {
    // Check if this is likely a low-end device
    if (typeof navigator !== 'undefined') {
      // Check if device has limited memory (< 4GB)
      if ('deviceMemory' in navigator) {
        this.deviceCapabilities.isLowEndDevice = (navigator as any).deviceMemory < 4;
      }
      
      // Check if device is offline
      this.deviceCapabilities.isOffline = !navigator.onLine;
      
      // Listen for online/offline events
      window.addEventListener('online', () => {
        this.deviceCapabilities.isOffline = false;
        this.events.emit('memory:connection:online', { timestamp: Date.now() });
      });
      
      window.addEventListener('offline', () => {
        this.deviceCapabilities.isOffline = true;
        this.events.emit('memory:connection:offline', { timestamp: Date.now() });
      });
      
      // Check battery status if available
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          this.deviceCapabilities.isLowBattery = battery.level < 0.2;
          
          battery.addEventListener('levelchange', () => {
            this.deviceCapabilities.isLowBattery = battery.level < 0.2;
          });
        });
      }
    }
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for memory events from the memory manager
    this.events.on('memory:stored', (data: { memory: Memory }) => {
      if (data.memory && data.memory.metadata && data.memory.metadata.source) {
        const agentId = data.memory.metadata.source;
        this.addToAgentCache(agentId, data.memory);
      }
    });
    
    // Handle beforeunload event to make sure memory is saved
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.forceSyncToStorage();
      });
      
      // Handle page visibility change to optimize memory operations
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          // When page is hidden, sync to storage
          this.syncToStorage();
        } else {
          // When page becomes visible again, reload memories if needed
          this.reloadMemoriesIfNeeded();
        }
      });
    }
  }
  
  /**
   * Start the memory synchronization interval
   */
  private startSyncInterval(): void {
    // Clear any existing interval
    if (this.syncInterval !== null) {
      window.clearInterval(this.syncInterval);
    }
    
    // Determine sync frequency based on device capabilities
    const syncFrequency = this.deviceCapabilities.isLowEndDevice ? 60000 : 30000; // 1 min or 30 sec
    
    this.syncInterval = window.setInterval(() => {
      this.syncToStorage();
    }, syncFrequency);
  }
  
  /**
   * Add a memory to the agent's in-memory cache
   */
  private addToAgentCache(agentId: string, memory: Memory): void {
    if (!this.agentMemories.has(agentId)) {
      this.agentMemories.set(agentId, []);
    }
    
    const memories = this.agentMemories.get(agentId);
    if (memories) {
      // Add to in-memory cache
      memories.push(memory);
      
      // Limit size of in-memory cache for low-end devices
      if (this.deviceCapabilities.isLowEndDevice && memories.length > 100) {
        memories.shift(); // Remove oldest memory
      }
    }
  }
  
  /**
   * Synchronize agent memories to persistent storage
   */
  private syncToStorage(): void {
    // Skip if we're actively recovering memories
    if (this._isRecovering) return;
    
    console.log('Synchronizing agent memories to persistent storage...');
    
    try {
      this.agentMemories.forEach((memories, agentId) => {
        // Store agent memories in local storage for quick recovery
        this.storageAdapter.set(`agent-memories-${agentId}`, {
          timestamp: Date.now(),
          memories: memories
        });
      });
      
      this.events.emit('memory:synced', {
        timestamp: Date.now(),
        agentCount: this.agentMemories.size
      });
    } catch (error) {
      console.error('Error syncing memories to storage:', error);
      this.events.emit('memory:sync:error', { error });
    }
  }
  
  /**
   * Force synchronization to storage (used during page unload)
   */
  private forceSyncToStorage(): void {
    try {
      this.agentMemories.forEach((memories, agentId) => {
        // Use synchronous localStorage as a fallback during page unload
        localStorage.setItem(`agent-memories-${agentId}`, JSON.stringify({
          timestamp: Date.now(),
          memories: memories
        }));
      });
    } catch (error) {
      console.error('Error during force sync:', error);
    }
  }
  
  // Flag to prevent recursive recovery operations
  private _isRecovering = false;
  
  /**
   * Reload agent memories from persistent storage if needed
   */
  private async reloadMemoriesIfNeeded(): Promise<void> {
    if (this._isRecovering) return;
    
    this._isRecovering = true;
    
    try {
      // Get all agent IDs from storage
      const keys = await this.storageAdapter.keys();
      const agentKeys = keys.filter(key => key.startsWith('agent-memories-'));
      
      for (const key of agentKeys) {
        const agentId = key.replace('agent-memories-', '');
        
        // Skip if we already have this agent's memories in memory
        if (this.agentMemories.has(agentId)) continue;
        
        // Load from storage
        const data = await this.storageAdapter.get<{ timestamp: number; memories: Memory[] }>(key);
        
        if (data && data.memories && Array.isArray(data.memories)) {
          this.agentMemories.set(agentId, data.memories);
          
          // Re-register these memories with the memory manager
          for (const memory of data.memories) {
            await this.memoryManager.storeMemory(memory);
          }
        }
      }
      
      this.events.emit('memory:reloaded', {
        timestamp: Date.now(),
        agentCount: this.agentMemories.size
      });
    } catch (error) {
      console.error('Error reloading memories:', error);
      this.events.emit('memory:reload:error', { error });
    } finally {
      this._isRecovering = false;
    }
  }
  
  /**
   * Get all memories for a specific agent
   */
  public getAgentMemories(agentId: string): Memory[] {
    // Try in-memory cache first
    if (this.agentMemories.has(agentId)) {
      return this.agentMemories.get(agentId) || [];
    }
    
    // Otherwise load from storage
    this.loadAgentMemories(agentId);
    
    // Return empty array for now (async loading)
    return [];
  }
  
  /**
   * Load agent memories from storage
   */
  private async loadAgentMemories(agentId: string): Promise<void> {
    try {
      const data = await this.storageAdapter.get<{ timestamp: number; memories: Memory[] }>(`agent-memories-${agentId}`);
      
      if (data && data.memories && Array.isArray(data.memories)) {
        this.agentMemories.set(agentId, data.memories);
        
        this.events.emit('memory:agent:loaded', {
          agentId,
          memoryCount: data.memories.length
        });
      } else {
        // Initialize with empty array if no memories found
        this.agentMemories.set(agentId, []);
      }
    } catch (error) {
      console.error(`Error loading memories for agent ${agentId}:`, error);
      // Initialize with empty array on error
      this.agentMemories.set(agentId, []);
    }
  }
  
  /**
   * Store a memory for a specific agent
   */
  public async storeAgentMemory(
    agentId: string, 
    memory: Omit<Memory, 'id' | 'metadata'> & { metadata?: Partial<Memory['metadata']> }
  ): Promise<Memory> {
    // Add agent metadata
    const memoryWithMeta: Memory = {
      ...memory as any, // Cast to work with partial metadata
      metadata: {
        source: agentId,
        confidence: memory.metadata?.confidence ?? 0.9,
        emotionalValence: memory.metadata?.emotionalValence ?? 0,
        salience: memory.metadata?.salience ?? 0.5,
        isPrivate: memory.metadata?.isPrivate ?? false,
        encoding: memory.metadata?.encoding ?? {
          format: typeof memory.content === 'string' ? 'text' : 'json',
          version: '1.0'
        }
      },
      tags: memory.tags || []
    };
    
    // Store in persistent memory manager
    const storedMemory = await this.memoryManager.storeMemory(memoryWithMeta);
    const returnMemory = typeof storedMemory === 'string' 
      ? { ...memoryWithMeta, id: storedMemory } 
      : storedMemory;
    
    return returnMemory;
  }
  
  /**
   * Add emotional context to stored memories
   * Allows memories with emotional significance to be weighted higher
   */
  public async addEmotionalContext(
    agentId: string, 
    memoryId: string, 
    emotionalValence: number
  ): Promise<boolean> {
    const memories = this.agentMemories.get(agentId);
    if (!memories) return false;
    
    const memoryIndex = memories.findIndex(m => m.id === memoryId);
    if (memoryIndex === -1) return false;
    
    // Update emotional valence
    memories[memoryIndex].metadata.emotionalValence = emotionalValence;
    
    // Update in storage
    this.syncToStorage();
    
    return true;
  }

  /**
   * Simulate memory corruption and recovery (for testing)
   */
  public async simulateCorruptionAndRecovery(): Promise<boolean> {
    try {
      // Simulate memory corruption
      this.agentMemories.clear();
      console.log('Simulated memory corruption: All in-memory data cleared');
      
      // Attempt recovery
      await this.reloadMemoriesIfNeeded();
      
      return this.agentMemories.size > 0;
    } catch (error) {
      console.error('Recovery simulation failed:', error);
      return false;
    }
  }
  
  /**
   * Clear all agent memories (use with caution!)
   */
  public async clearAllAgentMemories(): Promise<void> {
    this.agentMemories.clear();
    
    // Clear from storage
    const keys = await this.storageAdapter.keys();
    const agentKeys = keys.filter(key => key.startsWith('agent-memories-'));
    
    for (const key of agentKeys) {
      await this.storageAdapter.remove(key);
    }
    
    this.events.emit('memory:cleared:all', { timestamp: Date.now() });
  }
}

/**
 * Factory function to create the AgentMemoryManager
 */
export const createAgentMemoryManager = (
  events: BrowserEventEmitter
): AgentMemoryManager => {
  return AgentMemoryManager.getInstance(events);
};

