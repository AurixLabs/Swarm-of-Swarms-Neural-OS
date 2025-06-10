import { BrowserEventEmitter } from './BrowserEventEmitter';

export interface KernelState {
  [key: string]: any;
}

export abstract class UniversalKernel<T extends KernelState> {
  protected kernelId: string;
  private state: T;
  private listeners: Map<string, Function[]> = new Map();

  constructor(id: string, initialState: T) {
    this.kernelId = id;
    this.state = initialState;
  }

  /**
   * Get the current kernel state
   */
  getState(): T {
    return { ...this.state };
  }

  /**
   * Update kernel state
   */
  protected updateState(updates: Partial<T>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.emit('state:changed', { oldState, newState: this.state });
  }

  /**
   * Get kernel ID
   */
  getId(): string {
    return this.kernelId;
  }

  /**
   * Add event listener
   */
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  protected emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in kernel ${this.kernelId} event listener:`, error);
        }
      });
    }
  }

  /**
   * Initialize the kernel
   */
  abstract initialize?(): Promise<void>;
}
