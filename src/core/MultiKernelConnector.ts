
import { BrowserEventEmitter } from './BrowserEventEmitter';
import { UniversalKernel } from './UniversalKernel';
import { useEffect, useState } from 'react';

/**
 * Enhanced MultiKernelConnector with philosophical event propagation
 * Reflects principles of:
 * 1. Interconnectedness
 * 2. Contextual emergence
 * 3. Non-linear causality
 */
export class MultiKernelConnector {
  private static instance: MultiKernelConnector;
  private connectedKernels = new Map<string, UniversalKernel>();
  private eventBridge = new BrowserEventEmitter();
  private connectionStatus = new Map<string, boolean>();
  private messageQueue = new Map<string, any[]>();
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): MultiKernelConnector {
    if (!this.instance) {
      this.instance = new MultiKernelConnector();
    }
    return this.instance;
  }
  
  /**
   * Connect a kernel with a unique identifier
   */
  public connectKernel(id: string, kernel: UniversalKernel): boolean {
    if (this.connectedKernels.has(id)) {
      console.warn(`Kernel with ID ${id} is already connected`);
      return false;
    }
    
    this.connectedKernels.set(id, kernel);
    this.connectionStatus.set(id, true);
    
    // Setup cross-kernel event forwarding
    const unsubscribe = kernel.on('*', (event: any) => {
      this.broadcastToOtherKernels(id, event);
    });
    
    // Process any queued messages for this kernel
    this.processQueuedMessages(id);
    
    // Emit connection event
    this.eventBridge.emit('kernel:connected', { id, timestamp: Date.now() });
    
    return true;
  }
  
  /**
   * Disconnect a kernel by ID
   */
  public disconnectKernel(id: string): boolean {
    const kernel = this.connectedKernels.get(id);
    if (!kernel) return false;
    
    this.connectedKernels.delete(id);
    this.connectionStatus.set(id, false);
    
    // Emit disconnection event
    this.eventBridge.emit('kernel:disconnected', { id, timestamp: Date.now() });
    
    return true;
  }
  
  /**
   * Send a message to a specific kernel
   */
  public sendToKernel(targetKernelId: string, eventType: string, payload: any): boolean {
    const kernel = this.connectedKernels.get(targetKernelId);
    
    if (kernel) {
      this.propagateEvent(targetKernelId, { type: eventType, payload });
      return true;
    } else {
      // Queue the message for later delivery
      if (!this.messageQueue.has(targetKernelId)) {
        this.messageQueue.set(targetKernelId, []);
      }
      
      this.messageQueue.get(targetKernelId)!.push({
        eventType,
        payload,
        timestamp: Date.now()
      });
      
      console.warn(`Kernel ${targetKernelId} is not connected. Message queued for later delivery.`);
      return false;
    }
  }
  
  /**
   * Broadcast a message to all connected kernels
   */
  public broadcastToAll(eventType: string, payload: any): void {
    for (const [id, kernel] of this.connectedKernels.entries()) {
      kernel.broadcast(eventType, payload);
    }
  }
  
  /**
   * Get all connected kernel IDs
   */
  public getConnectedKernels(): string[] {
    return Array.from(this.connectedKernels.keys());
  }
  
  /**
   * Check if a kernel is connected
   */
  public isConnected(id: string): boolean {
    return this.connectedKernels.has(id) && !!this.connectionStatus.get(id);
  }
  
  /**
   * Subscribe to connector events
   */
  public on(eventType: string, handler: (data: any) => void): () => void {
    this.eventBridge.on(eventType, handler);
    return () => this.eventBridge.off(eventType, handler);
  }
  
  /**
   * Forward an event from one kernel to all others
   */
  private broadcastToOtherKernels(sourceId: string, event: any): void {
    for (const [id, kernel] of this.connectedKernels.entries()) {
      if (id !== sourceId) {
        kernel.broadcast(`${sourceId}:${event.type}`, {
          ...event.payload,
          sourceKernel: sourceId
        });
      }
    }
  }
  
  /**
   * Process queued messages for a kernel that just connected
   */
  private processQueuedMessages(kernelId: string): void {
    const messages = this.messageQueue.get(kernelId) || [];
    const kernel = this.connectedKernels.get(kernelId);
    
    if (kernel && messages.length > 0) {
      console.log(`Processing ${messages.length} queued messages for kernel ${kernelId}`);
      
      messages.forEach(message => {
        kernel.broadcast(message.eventType, message.payload);
      });
      
      // Clear the queue
      this.messageQueue.set(kernelId, []);
    }
  }
  
  /**
   * Reset the connector
   */
  public reset(): void {
    this.connectedKernels.clear();
    this.connectionStatus.clear();
    this.messageQueue.clear();
    this.eventBridge.removeAllListeners();
  }
  
  /**
   * Philosophical Event Propagation:
   * Events are not just transmitted, but contextually transformed
   */
  private propagateEvent(sourceKernelId: string, event: any): void {
    // Metaphysical event enrichment
    const enrichedEvent = {
      ...event,
      metadata: {
        sourceKernel: sourceKernelId,
        timestamp: Date.now(),
        // Introduce a "karmic trace" - philosophical concept of causal interconnection
        causalChain: crypto.randomUUID()
      }
    };

    // Non-linear event distribution
    for (const [id, kernel] of this.connectedKernels.entries()) {
      if (id !== sourceKernelId) {
        // Probabilistic event transformation
        const transformProbability = Math.random();
        
        // Events have a chance of being subtly modified or redirected
        if (transformProbability > 0.7) {
          enrichedEvent.metadata.transformativePass = true;
        }
        
        kernel.broadcast(`cross_kernel:${event.type}`, enrichedEvent);
      }
    }
  }
  
  /**
   * Subscribe to observe the event ecosystem
   */
  public observeEventEcosystem(callback: (ecosystem: any) => void): () => void {
    // Fix: Use a named function handler instead of directly passing the event emitter
    const eventHandler = (event: any) => {
      // Collect and analyze event ecosystem
      const eventEcosystem = {
        totalEvents: this.connectedKernels.size,
        eventFlow: event,
        timestamp: Date.now()
      };
      
      callback(eventEcosystem);
    };
    
    this.eventBridge.on('*', eventHandler);
    
    return () => {
      this.eventBridge.off('*', eventHandler);
    };
  }
}

// Export singleton instance
export const multiKernelConnector = MultiKernelConnector.getInstance();

// React hook for using the multi-kernel connector
export const useMultiKernel = () => {
  const [connectedKernels, setConnectedKernels] = useState<string[]>(
    multiKernelConnector.getConnectedKernels()
  );
  
  useEffect(() => {
    // Update connected kernels when they change
    const updateConnectedKernels = () => {
      setConnectedKernels(multiKernelConnector.getConnectedKernels());
    };
    
    // Subscribe to connection events
    const unsubscribeConnected = multiKernelConnector.on(
      'kernel:connected',
      updateConnectedKernels
    );
    
    const unsubscribeDisconnected = multiKernelConnector.on(
      'kernel:disconnected',
      updateConnectedKernels
    );
    
    // Initial update
    updateConnectedKernels();
    
    // Clean up subscriptions
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
    };
  }, []);
  
  return {
    connectedKernels,
    connectKernel: multiKernelConnector.connectKernel.bind(multiKernelConnector),
    disconnectKernel: multiKernelConnector.disconnectKernel.bind(multiKernelConnector),
    sendToKernel: multiKernelConnector.sendToKernel.bind(multiKernelConnector),
    broadcastToAll: multiKernelConnector.broadcastToAll.bind(multiKernelConnector),
    isConnected: multiKernelConnector.isConnected.bind(multiKernelConnector)
  };
};
