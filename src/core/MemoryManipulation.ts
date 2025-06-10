
import { Memory, MemoryType, MemoryPriority, TemporalScope } from './interfaces/MemoryTypes';
import { v4 as uuidv4 } from 'uuid';

export class MemoryManipulation {
  public fragmentMemory(memory: Memory): { success: boolean; fragments?: any[] } {
    if (!memory) return { success: false };
    
    // Handle both string and object content
    const contentStr = typeof memory.content === 'string' 
      ? memory.content 
      : JSON.stringify(memory.content);
    
    const fragments = [
      { content: contentStr.substring(0, 50) },
      { content: contentStr.substring(50, 100) },
      { content: contentStr.substring(100) }
    ];
    
    return { success: true, fragments };
  }

  public mergeMemories(memory1: Memory, memory2: Memory): Memory {
    // Handle string or object contents appropriately
    let mergedContent;
    
    if (typeof memory1.content === 'string' && typeof memory2.content === 'string') {
      mergedContent = `${memory1.content} ${memory2.content}`;
    } else {
      // For object contents, create a merged object
      mergedContent = {
        ...((typeof memory1.content === 'object') ? memory1.content : { content: memory1.content }),
        ...((typeof memory2.content === 'object') ? memory2.content : { content: memory2.content })
      };
    }
    
    return {
      id: uuidv4(),
      type: MemoryType.SEMANTIC,
      content: mergedContent,
      metadata: {
        source: 'memory_merge',
        confidence: (memory1.metadata.confidence + memory2.metadata.confidence) / 2,
        emotionalValence: (memory1.metadata.emotionalValence + memory2.metadata.emotionalValence) / 2,
        salience: (memory1.metadata.salience + memory2.metadata.salience) / 2,
        isPrivate: memory1.metadata.isPrivate || memory2.metadata.isPrivate,
        encoding: { format: 'text', version: '1.0' },
        timestamp: Date.now() // Add timestamp property
      },
      priority: MemoryPriority.MEDIUM,
      associativeStrength: (memory1.associativeStrength + memory2.associativeStrength) / 2,
      context: {
        temporal: TemporalScope.RECENT,
        domain: [...new Set([...memory1.context.domain, ...memory2.context.domain])]
      },
      linkedMemories: [memory1.id!, memory2.id!],
      tags: [...new Set([...memory1.tags, ...memory2.tags])]
    };
  }

  public archiveMemory(memory: Memory): Memory {
    return {
      ...memory,
      context: {
        ...memory.context,
        temporal: TemporalScope.ARCHIVED
      }
    };
  }

  public contextualizeMemory(memory: Memory, context: any): Memory {
    return {
      ...memory,
      context: { ...memory.context, ...context }
    };
  }

  public prioritizeMemory(memory: Memory, priority: MemoryPriority): Memory {
    return {
      ...memory,
      priority
    };
  }
}
