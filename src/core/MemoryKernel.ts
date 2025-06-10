import { BrowserEventEmitter, createSystemEvent } from '@/core/events';
import { BaseKernel } from './BaseKernel';
import { MemoryEntry } from '../types/MemoryEntry';
import { MemoryFilter } from '../types/MemoryFilter';
import { MemoryQueryResult } from '../types/MemoryQueryResult';
import { v4 as uuidv4 } from 'uuid';

export class MemoryKernel extends BaseKernel {
  private memories: MemoryEntry[] = [];
  private eventEmitter: BrowserEventEmitter;

  constructor() {
    super();
    this.eventEmitter = new BrowserEventEmitter();
    console.log('🧠 Memory Kernel initialized');
  }

  /**
   * Adds a new memory entry to the kernel.
   * @param content The content of the memory.
   * @param metadata Optional metadata for the memory.
   * @returns The ID of the newly created memory entry.
   */
  addMemory(content: string, metadata?: any): string {
    const id = uuidv4();
    const timestamp = Date.now();
    const entry: MemoryEntry = {
      id,
      content,
      metadata,
      timestamp,
    };

    this.memories.push(entry);

    // Emit a system event indicating a new memory was added
    this.eventEmitter.emit('system_event', createSystemEvent('memory_added', { memoryId: id, content }));

    return id;
  }

  /**
   * Retrieves a memory entry by its ID.
   * @param id The ID of the memory entry to retrieve.
   * @returns The memory entry if found, otherwise undefined.
   */
  getMemoryById(id: string): MemoryEntry | undefined {
    return this.memories.find((memory) => memory.id === id);
  }

  /**
   * Queries the memory entries based on a filter.
   * @param filter The filter to apply to the memory entries.
   * @returns An array of memory query results that match the filter.
   */
  queryMemories(filter: MemoryFilter): MemoryQueryResult[] {
    const results: MemoryQueryResult[] = this.memories
      .filter((memory) => {
        if (filter.metadata) {
          for (const key in filter.metadata) {
            if (filter.metadata.hasOwnProperty(key)) {
              if (memory.metadata && memory.metadata[key] !== filter.metadata[key]) {
                return false;
              }
            }
          }
        }
        return true;
      })
      .map((memory) => ({
        id: memory.id,
        content: memory.content,
        metadata: memory.metadata,
        timestamp: memory.timestamp,
        score: 0.8, //Basic score for now
      }));

    return results;
  }

  /**
   * Updates an existing memory entry.
   * @param id The ID of the memory entry to update.
   * @param content The new content for the memory entry.
   * @param metadata Optional new metadata for the memory entry.
   * @returns True if the memory entry was successfully updated, false otherwise.
   */
  updateMemory(id: string, content: string, metadata?: any): boolean {
    const index = this.memories.findIndex((memory) => memory.id === id);
    if (index === -1) {
      return false;
    }

    this.memories[index] = {
      id,
      content,
      metadata,
      timestamp: Date.now(),
    };

    // Emit a system event indicating a memory was updated
    this.eventEmitter.emit('system_event', createSystemEvent('memory_updated', { memoryId: id, content }));

    return true;
  }

  /**
   * Deletes a memory entry by its ID.
   * @param id The ID of the memory entry to delete.
   * @returns True if the memory entry was successfully deleted, false otherwise.
   */
  deleteMemory(id: string): boolean {
    const index = this.memories.findIndex((memory) => memory.id === id);
    if (index === -1) {
      return false;
    }

    this.memories.splice(index, 1);

    // Emit a system event indicating a memory was deleted
    this.eventEmitter.emit('system_event', createSystemEvent('memory_deleted', { memoryId: id }));

    return true;
  }

  /**
   * Lists all memory entries in the kernel.
   * @returns An array of all memory entries.
   */
  listMemories(): MemoryEntry[] {
    return [...this.memories];
  }

  /**
   * Clears all memory entries from the kernel.
   */
  clearMemories(): void {
    this.memories = [];

    // Emit a system event indicating all memories were cleared
    this.eventEmitter.emit('system_event', createSystemEvent('memories_cleared', {}));
  }

  /**
   * Gets the number of memory entries in the kernel.
   * @returns The number of memory entries.
   */
  getMemoryCount(): number {
    return this.memories.length;
  }

  /**
   * Emits a custom event.
   * @param eventName The name of the event to emit.
   * @param payload The payload to include with the event.
   */
  emit(eventName: string, payload: any): void {
    this.eventEmitter.emit(eventName, payload);
  }

  /**
   * Registers a handler for a custom event.
   * @param eventName The name of the event to handle.
   * @param handler The handler function to call when the event is emitted.
   */
  on(eventName: string, handler: (payload: any) => void): void {
    this.eventEmitter.on(eventName, handler);
  }
}
