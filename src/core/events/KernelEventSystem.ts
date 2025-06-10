
/**
 * Unified Event Bus for cross-kernel communication
 * This provides a centralized event system for all kernels
 */
export class KernelEventSystem {
  private static instance: KernelEventSystem;
  private _channels = new Map<string, Set<Function>>();
  private _kernelSignatures = new Map<string, symbol>();
  
  // Prevent direct instantiation
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): KernelEventSystem {
    if (!KernelEventSystem.instance) {
      KernelEventSystem.instance = new KernelEventSystem();
    }
    return KernelEventSystem.instance;
  }

  /**
   * Register a kernel with a unique signature
   */
  public registerKernel(kernelId: string, signature: symbol): void {
    this._kernelSignatures.set(kernelId, signature);
  }

  /**
   * Verify kernel authenticity
   */
  public verifyKernel(kernelId: string, signature: symbol): boolean {
    return this._kernelSignatures.get(kernelId) === signature;
  }

  /**
   * Subscribe to events from a specific kernel
   */
  public subscribe(kernel: string, event: string, handler: Function): () => void {
    const key = `${kernel}.${event}`;
    if (!this._channels.has(key)) {
      this._channels.set(key, new Set());
    }
    this._channels.get(key)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this._channels.get(key);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this._channels.delete(key);
        }
      }
    };
  }

  /**
   * Emit an event from a specific kernel
   */
  public emit(kernel: string, event: string, payload: any): void {
    const key = `${kernel}.${event}`;
    const handlers = this._channels.get(key);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${key}:`, error);
        }
      });
    }
    
    // Also emit to global listeners
    const globalHandlers = this._channels.get(`*.${event}`);
    if (globalHandlers) {
      globalHandlers.forEach(handler => {
        try {
          handler({ source: kernel, ...payload });
        } catch (error) {
          console.error(`Error in global event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to events from all kernels
   */
  public subscribeGlobal(event: string, handler: Function): () => void {
    return this.subscribe('*', event, handler);
  }
}

// Export singleton instance
export const kernelEventSystem = KernelEventSystem.getInstance();
