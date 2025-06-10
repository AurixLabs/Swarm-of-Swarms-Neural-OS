
import { systemKernel } from '../SystemKernel';
import { memoryKernel } from '../MemoryKernel';
import { PersistentMemoryManager } from './PersistentMemoryManager';
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { Memory } from '../interfaces/MemoryTypes';

/**
 * MemoryIntegration - Connects the PersistentMemoryManager with the system and memory kernels
 * 
 * This class ensures that memories stored through the PersistentMemoryManager are also
 * accessible via the MemoryKernel, and that memories stored through the MemoryKernel
 * are persisted by the PersistentMemoryManager.
 */
export class MemoryIntegration {
  private static instance: MemoryIntegration;
  private events: BrowserEventEmitter;
  private memoryManager: PersistentMemoryManager;
  
  private constructor(events: BrowserEventEmitter) {
    this.events = events;
    this.memoryManager = PersistentMemoryManager.getInstance(events);
    this.setupEventHandlers();
  }
  
  public static getInstance(events: BrowserEventEmitter): MemoryIntegration {
    if (!MemoryIntegration.instance) {
      MemoryIntegration.instance = new MemoryIntegration(events);
    }
    return MemoryIntegration.instance;
  }
  
  private setupEventHandlers(): void {
    // Listen for memory events from the memory kernel
    memoryKernel.onMemoryEvent('MEMORY_STORED', (memory: Memory, event: any) => {
      // Persist the memory
      this.memoryManager.storeMemory(memory);
    });
    
    memoryKernel.onMemoryEvent('MEMORY_UPDATED', (memory: Memory, event: any) => {
      if (memory.id) {
        this.memoryManager.updateMemory(memory.id, memory);
      }
    });
    
    memoryKernel.onMemoryEvent('MEMORY_DELETED', (memory: Memory, event: any) => {
      // Fix: Extract memoryId from event payload for delete operations
      if (event && event.payload && event.payload.memoryId) {
        this.memoryManager.deleteMemory(event.payload.memoryId);
      } else if (memory.id) {
        this.memoryManager.deleteMemory(memory.id);
      }
    });
    
    // Listen for memory events from PersistentMemoryManager
    this.events.on('memory:stored', async (data: { memory: Memory }) => {
      if (data && data.memory) {
        // Store in memory kernel as well
        await memoryKernel.storeMemory(data.memory);
      }
    });
    
    this.events.on('memory:updated', async (data: { memory: Memory }) => {
      if (data && data.memory && data.memory.id) {
        // Update in memory kernel
        await memoryKernel.updateMemory(data.memory.id, data.memory);
      }
    });
    
    this.events.on('memory:deleted', async (data: { memoryId: string }) => {
      if (data && data.memoryId) {
        // Delete from memory kernel
        await memoryKernel.deleteMemory(data.memoryId);
      }
    });
    
    // Register with system kernel to support inter-kernel communication
    systemKernel.setState('memory:integration:ready', true);
  }
  
  /**
   * Initialize the integration
   */
  public initialize(): void {
    console.log('Memory integration initialized');
    this.events.emit('memory:integration:initialized', { 
      timestamp: Date.now()
    });
  }
}

/**
 * Create and initialize the memory integration
 */
export const initializeMemoryIntegration = (events: BrowserEventEmitter): MemoryIntegration => {
  const integration = MemoryIntegration.getInstance(events);
  integration.initialize();
  return integration;
};
