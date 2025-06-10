
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { MemoryEventType } from '../interfaces/MemoryEventTypes';

// Memory Event types
export type MemoryEvent = 
  | { type: 'MEMORY_STORED'; payload: any }
  | { type: 'MEMORY_RETRIEVED'; payload: any }
  | { type: 'MEMORY_UPDATED'; payload: any }
  | { type: 'MEMORY_DELETED'; payload: any }
  | { type: 'MEMORY_LINKED'; payload: any }
  | { type: 'MEMORY_STATE_CHANGED'; payload: any }
  | { type: MemoryEventType; payload: any };

// Memory Event Bus for decoupled communication
export class MemoryEventBus extends BrowserEventEmitter {
  emitEvent<T extends MemoryEvent>(event: T) {
    this.emit(event.type, event.payload);
    return event;
  }
  
  onEvent<T extends MemoryEvent>(eventType: T['type'], handler: (payload: any) => void) {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }
}

// Export a singleton instance
export const memoryEvents = new MemoryEventBus();
