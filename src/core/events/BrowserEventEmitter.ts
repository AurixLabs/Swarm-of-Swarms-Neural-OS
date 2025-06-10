
// Browser-compatible event emitter implementation
export class BrowserEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  off(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  emitEvent(eventData: any): void {
    this.emit(eventData.type, eventData);
  }
}

// Export helper functions that were being used
export function createSystemEvent(type: string, payload: any) {
  return {
    id: `event-${Date.now()}`,
    type,
    payload,
    timestamp: Date.now()
  };
}

export function createMemoryMetadata(key: string, data: any) {
  return {
    temporalKey: key,
    data,
    timestamp: Date.now()
  };
}

// Create singleton instance
export const browserEventEmitter = new BrowserEventEmitter();
export default BrowserEventEmitter;
