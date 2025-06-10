
import { UniversalKernel } from '../kernels/UniversalKernel';

export interface MemoryEntry {
  id: string;
  content: any;
  timestamp: number;
  type: 'conversation' | 'system' | 'user' | 'temporal';
  metadata?: Record<string, any>;
}

export interface MemoryQuery {
  type?: string;
  timeRange?: { start: number; end: number };
  limit?: number;
  searchTerm?: string;
}

class MemoryKernelImpl extends UniversalKernel {
  private memoryStore: Map<string, MemoryEntry> = new Map();
  private maxMemorySize = 10000; // Maximum number of entries

  constructor() {
    super('memory-kernel');
    this.initialize();
  }

  async initialize(): Promise<boolean> {
    const success = await super.initialize();
    if (success) {
      this.setState('memorySize', 0);
      this.setState('maxSize', this.maxMemorySize);
      console.log('✅ MemoryKernel initialized with clean memory store');
    }
    return success;
  }

  getCapabilities(): string[] {
    return [
      'store-memory',
      'retrieve-memory', 
      'search-memory',
      'temporal-memory',
      'conversation-memory',
      'memory-cleanup'
    ];
  }

  // Store memory entry
  store(content: any, type: MemoryEntry['type'] = 'system', metadata?: Record<string, any>): string {
    try {
      const id = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const entry: MemoryEntry = {
        id,
        content,
        timestamp: Date.now(),
        type,
        metadata
      };

      this.memoryStore.set(id, entry);
      this.setState('memorySize', this.memoryStore.size);
      
      // Cleanup if we exceed max size
      this.cleanup();
      
      this.emitEvent({
        type: 'MEMORY_STORED',
        payload: { id, type, size: this.memoryStore.size },
        timestamp: Date.now()
      });

      return id;
    } catch (error) {
      console.error('Error storing memory:', error);
      return '';
    }
  }

  // Retrieve specific memory by ID
  retrieve(id: string): MemoryEntry | null {
    try {
      const entry = this.memoryStore.get(id);
      if (entry) {
        this.emitEvent({
          type: 'MEMORY_ACCESSED',
          payload: { id, type: entry.type },
          timestamp: Date.now()
        });
      }
      return entry || null;
    } catch (error) {
      console.error('Error retrieving memory:', error);
      return null;
    }
  }

  // Query memories with filters
  query(queryParams: MemoryQuery): MemoryEntry[] {
    try {
      let results = Array.from(this.memoryStore.values());

      // Filter by type
      if (queryParams.type) {
        results = results.filter(entry => entry.type === queryParams.type);
      }

      // Filter by time range
      if (queryParams.timeRange) {
        results = results.filter(entry => 
          entry.timestamp >= queryParams.timeRange!.start &&
          entry.timestamp <= queryParams.timeRange!.end
        );
      }

      // Search in content
      if (queryParams.searchTerm) {
        results = results.filter(entry => {
          const contentStr = typeof entry.content === 'string' 
            ? entry.content 
            : JSON.stringify(entry.content);
          return contentStr.toLowerCase().includes(queryParams.searchTerm!.toLowerCase());
        });
      }

      // Sort by timestamp (newest first)
      results.sort((a, b) => b.timestamp - a.timestamp);

      // Apply limit
      if (queryParams.limit) {
        results = results.slice(0, queryParams.limit);
      }

      this.emitEvent({
        type: 'MEMORY_QUERIED',
        payload: { 
          queryParams, 
          resultCount: results.length,
          memorySize: this.memoryStore.size 
        },
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error('Error querying memory:', error);
      return [];
    }
  }

  // Store conversation memory
  storeConversation(message: string, role: 'user' | 'assistant', metadata?: Record<string, any>): string {
    return this.store(
      { message, role }, 
      'conversation', 
      { ...metadata, role }
    );
  }

  // Get recent conversations
  getRecentConversations(limit: number = 10): MemoryEntry[] {
    return this.query({
      type: 'conversation',
      limit
    });
  }

  // Store temporal event
  storeTemporalEvent(domain: string, event: any): string {
    return this.store(
      event,
      'temporal',
      { domain, eventType: 'temporal' }
    );
  }

  // Get temporal events for a domain
  getTemporalEvents(domain: string, timeRange?: { start: number; end: number }): MemoryEntry[] {
    const results = this.query({
      type: 'temporal',
      timeRange
    });

    return results.filter(entry => 
      entry.metadata?.domain === domain
    );
  }

  // Memory management
  private cleanup(): void {
    if (this.memoryStore.size > this.maxMemorySize) {
      // Remove oldest entries first
      const entries = Array.from(this.memoryStore.values())
        .sort((a, b) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, this.memoryStore.size - this.maxMemorySize);
      
      for (const entry of toRemove) {
        this.memoryStore.delete(entry.id);
      }
      
      this.setState('memorySize', this.memoryStore.size);
      
      console.log(`🧹 Memory cleanup: removed ${toRemove.length} old entries`);
    }
  }

  // Clear all memory (use with caution)
  clear(): void {
    const previousSize = this.memoryStore.size;
    this.memoryStore.clear();
    this.setState('memorySize', 0);
    
    this.emitEvent({
      type: 'MEMORY_CLEARED',
      payload: { previousSize },
      timestamp: Date.now()
    });
    
    console.log(`🧹 Memory cleared: removed ${previousSize} entries`);
  }

  // Get memory statistics
  getStats() {
    const typeStats: Record<string, number> = {};
    
    for (const entry of this.memoryStore.values()) {
      typeStats[entry.type] = (typeStats[entry.type] || 0) + 1;
    }

    return {
      totalEntries: this.memoryStore.size,
      maxSize: this.maxMemorySize,
      utilizationPercent: (this.memoryStore.size / this.maxMemorySize) * 100,
      typeBreakdown: typeStats,
      oldestEntry: Math.min(...Array.from(this.memoryStore.values()).map(e => e.timestamp)),
      newestEntry: Math.max(...Array.from(this.memoryStore.values()).map(e => e.timestamp))
    };
  }
}

// Export singleton instance
export const memoryKernel = new MemoryKernelImpl();
export default memoryKernel;
