
import { useState, useEffect, useCallback } from 'react';
import { PersistentMemoryManager } from './PersistentMemoryManager';
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { Memory, MemoryType, MemoryPriority, TemporalScope } from '../interfaces/MemoryTypes';
import { v4 as uuidv4 } from 'uuid';

// Global shared event emitter for all agents
const sharedEvents = new BrowserEventEmitter();

// Initialize the memory manager as a singleton
const memoryManager = PersistentMemoryManager.getInstance(sharedEvents);

/**
 * Hook for AI agents to access persistent memory across modules
 * 
 * @param agentId Unique identifier for the agent
 * @returns Memory operations for this agent
 */
export function useAgentMemory(agentId: string) {
  const [lastMemoryOp, setLastMemoryOp] = useState<string | null>(null);
  
  // Store memory for this agent
  const storeMemory = useCallback(async (
    content: any,
    type: MemoryType = MemoryType.SEMANTIC,
    options: {
      tags?: string[],
      priority?: MemoryPriority,
      domain?: string[],
      temporal?: TemporalScope,
      confidence?: number,
      isPrivate?: boolean
    } = {}
  ): Promise<string> => {
    // Create a memory object
    const memory: Memory = {
      type,
      content,
      metadata: {
        source: agentId,
        confidence: options.confidence ?? 0.9,
        emotionalValence: 0,
        salience: 0.5,
        isPrivate: options.isPrivate ?? false,
        encoding: {
          format: typeof content === 'string' ? 'text' : 'json',
          version: '1.0'
        },
        timestamp: Date.now() // Added the required timestamp property
      },
      priority: options.priority ?? MemoryPriority.MEDIUM,
      associativeStrength: 0.5,
      context: {
        temporal: options.temporal ?? TemporalScope.RECENT,
        domain: options.domain ?? ['general']
      },
      tags: options.tags ?? ['default'],
    };
    
    const id = await memoryManager.storeMemory(memory);
    setLastMemoryOp(`store:${id}`);
    return id;
  }, [agentId]);
  
  // Retrieve memory by id
  const retrieveMemory = useCallback((id: string): Memory | undefined => {
    const memory = memoryManager.getMemory(id);
    if (memory) {
      setLastMemoryOp(`retrieve:${id}`);
    }
    return memory;
  }, []);
  
  // Query memories
  const queryMemories = useCallback((query: {
    type?: MemoryType,
    tags?: string[],
    domain?: string[],
    minConfidence?: number,
    temporal?: TemporalScope
  }) => {
    const results = memoryManager.queryMemories(query);
    setLastMemoryOp(`query:${results.length}`);
    return results;
  }, []);
  
  // Query memories for this agent specifically
  const queryAgentMemories = useCallback((query: {
    type?: MemoryType,
    tags?: string[],
    domain?: string[],
    minConfidence?: number,
    temporal?: TemporalScope
  } = {}) => {
    // Add agent source to query filter
    const results = memoryManager.queryMemories(query).filter(
      memory => memory.metadata.source === agentId
    );
    setLastMemoryOp(`queryAgent:${results.length}`);
    return results;
  }, [agentId]);
  
  // Update existing memory
  const updateMemory = useCallback((id: string, updates: Partial<Memory>) => {
    const result = memoryManager.updateMemory(id, updates);
    if (result) {
      setLastMemoryOp(`update:${id}`);
    }
    return result;
  }, []);
  
  // Delete memory
  const deleteMemory = useCallback((id: string) => {
    const result = memoryManager.deleteMemory(id);
    if (result) {
      setLastMemoryOp(`delete:${id}`);
    }
    return result;
  }, []);
  
  // Subscribe to memory events when this hook mounts
  useEffect(() => {
    const handleMemoryStored = (data: { memory: Memory }) => {
      if (data.memory.metadata.source !== agentId) {
        // Another agent stored a memory, can react if needed
        console.log(`Agent ${agentId} noticed new memory from ${data.memory.metadata.source}`);
      }
    };
    
    // Subscribe to memory events
    sharedEvents.on('memory:stored', handleMemoryStored);
    
    // Cleanup subscriptions
    return () => {
      sharedEvents.off('memory:stored', handleMemoryStored);
    };
  }, [agentId]);
  
  return {
    storeMemory,
    retrieveMemory,
    queryMemories,
    queryAgentMemories,
    updateMemory,
    deleteMemory,
    lastMemoryOp
  };
}

/**
 * Create a unique agent ID
 */
export function createAgentId(agentName: string): string {
  return `agent:${agentName}:${uuidv4().slice(0, 8)}`;
}
