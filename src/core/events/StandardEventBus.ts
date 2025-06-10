
import { BrowserEventEmitter } from '../BrowserEventEmitter';

/**
 * StandardEventBus - Enhanced event system with full compatibility
 */
export class StandardEventBus extends BrowserEventEmitter {
  constructor() {
    super();
  }

  /**
   * Enhanced emit with better error handling
   */
  public override emit(eventType: string, payload?: any): boolean {
    try {
      return super.emit(eventType, payload);
    } catch (error) {
      console.error(`Error emitting event ${eventType}:`, error);
      return false;
    }
  }

  /**
   * Enhanced emitEvent with validation
   */
  public override emitEvent(event: string | { type: string; payload?: any }): any {
    try {
      return super.emitEvent(event);
    } catch (error) {
      const eventType = typeof event === 'string' ? event : event.type;
      console.error(`Error emitting event ${eventType}:`, error);
      return false;
    }
  }

  /**
   * Enhanced onEvent with error handling
   */
  public override onEvent(eventType: string, handler: Function): () => void {
    try {
      return super.onEvent(eventType, handler);
    } catch (error) {
      console.error(`Error registering event handler for ${eventType}:`, error);
      return () => {}; // Return empty unsubscribe function
    }
  }

  /**
   * Batch emit multiple events
   */
  public emitBatch(events: Array<{ type: string; payload?: any }>): boolean[] {
    return events.map(event => this.emit(event.type, event.payload));
  }

  /**
   * Add event middleware
   */
  public addMiddleware(middleware: (eventType: string, payload: any) => boolean): void {
    // Store original emit
    const originalEmit = this.emit.bind(this);
    
    // Override emit with middleware
    this.emit = (eventType: string, payload?: any): boolean => {
      try {
        if (middleware(eventType, payload)) {
          return originalEmit(eventType, payload);
        }
        return false;
      } catch (error) {
        console.error('Error in event middleware:', error);
        return originalEmit(eventType, payload);
      }
    };
  }
}

// Create singleton instance
export const standardEventBus = new StandardEventBus();
export default standardEventBus;
