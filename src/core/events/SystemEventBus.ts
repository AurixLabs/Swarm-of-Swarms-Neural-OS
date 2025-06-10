
import { createSystemEvent, ensureEventTimestamp } from '../utils/eventUtils';
import { BrowserEventEmitter } from '../BrowserEventEmitter';

export type EventHandler = (payload: any) => void;

export interface SystemEvent {
  type: string;
  payload: any;
  timestamp: number;
}

/**
 * System Event Bus for handling system-wide events
 * Extended to be compatible with BrowserEventEmitter
 */
export class SystemEventBus extends BrowserEventEmitter {
  /**
   * Emit a typed event to all registered handlers
   */
  public override emitEvent(event: string | Partial<SystemEvent> | { type: string; payload: any }): any {
    if (typeof event === 'string') {
      return super.emit(event, {});
    } else if ('type' in event && 'payload' in event) {
      const eventWithTimestamp = ensureEventTimestamp(event as SystemEvent);
      return this.emit(eventWithTimestamp.type, eventWithTimestamp.payload);
    }
    return false;
  }
  
  /**
   * Broadcast an event to all listeners
   * @param eventType The event type
   * @param payload The event payload
   */
  public broadcast(eventType: string, payload: any): boolean {
    return this.emit(eventType, payload);
  }
}
