
import { BrowserEventEmitter } from '../BrowserEventEmitter';

/**
 * Unified Event System - Single source of truth for all kernel communication
 */
export type UnifiedEventType = 
  | 'KERNEL_INITIALIZED'
  | 'KERNEL_SHUTDOWN'
  | 'STATE_CHANGED'
  | 'ERROR_OCCURRED'
  | 'SECURITY_ALERT'
  | 'ETHICS_VIOLATION'
  | 'REGULATORY_UPDATE'
  | 'DOMAIN_REGISTERED'
  | 'MODULE_LOADED';

export interface UnifiedEvent {
  type: UnifiedEventType;
  payload: any;
  timestamp: number;
  source: string;
}

export class UnifiedEventSystem extends BrowserEventEmitter {
  private static instance: UnifiedEventSystem;
  
  private constructor() {
    super();
  }
  
  public static getInstance(): UnifiedEventSystem {
    if (!UnifiedEventSystem.instance) {
      UnifiedEventSystem.instance = new UnifiedEventSystem();
    }
    return UnifiedEventSystem.instance;
  }
  
  public emitUnified(type: UnifiedEventType, payload: any, source: string = 'system'): void {
    const event: UnifiedEvent = {
      type,
      payload,
      timestamp: Date.now(),
      source
    };
    
    this.emit(type, event);
  }
  
  public onUnified(type: UnifiedEventType, handler: (event: UnifiedEvent) => void): () => void {
    this.on(type, handler);
    return () => this.off(type, handler);
  }
  
  // Backwards compatibility
  public override emitEvent(event: string | { type: string; payload?: any }): any {
    if (typeof event === 'string') {
      return this.emit(event, {});
    } else {
      return this.emit(event.type, event.payload);
    }
  }
  
  public override onEvent(eventType: string, handler: Function): () => void {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }
}

export const unifiedEvents = UnifiedEventSystem.getInstance();
