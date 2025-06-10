
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { createSystemEvent, ensureEventTimestamp } from '../utils/eventUtils';

// Define the regulatory event types
export type RegulatoryEventType = 
  | 'COMPLIANCE_CHECK_COMPLETED'
  | 'REGULATION_UPDATED'
  | 'COMPLIANCE_VIOLATION_DETECTED'
  | 'COMPLIANCE_REPORT_GENERATED'
  | 'GOVERNANCE_POLICY_UPDATED'
  | 'SOVEREIGNTY_MODE_CHANGED'
  | 'CONTENT_VALIDATION_COMPLETED'
  | 'JURISDICTION_CHANGED'
  | 'REPORTING_RESPONSIBILITY_DELEGATED'; 

// Regulatory event interface
export interface RegulatoryEvent {
  type: RegulatoryEventType;
  payload: any;
}

// Browser-based event emitter for regulatory events
export class RegulatoryEventBus extends BrowserEventEmitter {
  /**
   * Emit a properly formatted regulatory event
   */
  public emitRegulatoryEvent<T extends RegulatoryEvent>(event: T): boolean {
    return this.emit(event.type, event.payload);
  }
  
  /**
   * Register an event handler
   */
  public onRegulatoryEvent<T extends RegulatoryEvent>(eventType: T['type'], handler: (payload: any) => void): () => void {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }

  /**
   * Override emitEvent to maintain compatibility
   */
  public override emitEvent(event: string | { type: string; payload?: any }): any {
    if (typeof event === 'string') {
      return this.emit(event);
    } else {
      return this.emit(event.type, event.payload);
    }
  }
}
