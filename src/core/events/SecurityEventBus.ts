
import { BrowserEventEmitter } from '../BrowserEventEmitter';

// Security Event types
export type SecurityEventType = 
  | 'system-security-breach'
  | 'data-exfiltration'
  | 'data-exfiltration-attempt'
  | 'esbuild-exploit-attempt'
  | 'time_manipulation'
  | 'kernel_tampering'
  | 'state_tampering'
  | 'potential_reverse_engineering'
  | 'network-lockdown'
  | 'system-modification'
  | 'SECURITY_POLICY_ADDED'
  | 'SECURITY_POLICY_REMOVED'
  | 'SECURITY_STATE_CHANGED';

export type SecurityEvent = { 
  type: SecurityEventType; 
  payload: any 
};

// Security Event Bus for decoupled communication
export class SecurityEventBus extends BrowserEventEmitter {
  emit(eventType: SecurityEventType, payload: any): boolean {
    return super.emit(eventType, payload);
  }
  
  on(eventType: SecurityEventType, handler: (payload: any) => void): this {
    return super.on(eventType, handler);
  }
  
  emitEvent(event: SecurityEventType | SecurityEvent): any {
    if (typeof event === 'string') {
      return this.emit(event, undefined);
    } else {
      return this.emit(event.type, event.payload);
    }
  }
  
  onEvent(eventType: SecurityEventType, handler: (payload: any) => void): () => void {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }
}

// Export a singleton instance
export const securityEvents = new SecurityEventBus();
