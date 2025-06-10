
import { BrowserEventEmitter } from '../BrowserEventEmitter';

// Define AI-specific event types
export type AIEventType = 
  | 'INTENT_ANALYZED'
  | 'RESPONSE_GENERATED'
  | 'MODEL_CHANGED'
  | 'CONTEXT_UPDATED'
  | 'ETHICS_VIOLATION';

export type AIEvent = { 
  type: AIEventType; 
  payload: any 
};

// AI Event Bus for decoupled AI communication
export class AIEventBus extends BrowserEventEmitter {
  emit(eventType: AIEventType, payload: any): boolean {
    return super.emit(eventType, payload);
  }
  
  on(eventType: AIEventType, handler: (payload: any) => void): this {
    return super.on(eventType, handler);
  }
  
  emitEvent(event: AIEventType | AIEvent): any {
    if (typeof event === 'string') {
      return this.emit(event, undefined);
    } else {
      return this.emit(event.type, event.payload);
    }
  }
  
  onEvent(eventType: AIEventType, handler: (payload: any) => void): () => void {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }
}

// Export a singleton instance
export const aiEvents = new AIEventBus();
