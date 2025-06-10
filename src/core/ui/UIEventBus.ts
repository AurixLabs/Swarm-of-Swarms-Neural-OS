
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { UIEvent } from '../types/UIEventTypes';

export class UIEventBus extends BrowserEventEmitter {
  emit(type: UIEvent['type'], payload: any): boolean {
    return super.emit(type, payload);
  }
  
  on(eventType: UIEvent['type'], handler: (payload: any) => void): this {
    return super.on(eventType, handler);
  }
  
  off(eventType: UIEvent['type'], handler: (payload: any) => void): this {
    return super.off(eventType, handler);
  }
  
  emitEvent(event: UIEvent | { type: UIEvent['type']; payload: any }): boolean {
    if ('type' in event) {
      return this.emit(event.type, event.payload);
    }
    return false;
  }
  
  onEvent(eventType: UIEvent['type'], handler: (payload: any) => void): () => void {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }
  
  // Fix the type of eventType to match UIEvent['type']
  broadcast(eventType: UIEvent['type'], payload: any): boolean {
    return this.emit(eventType, payload);
  }
}
