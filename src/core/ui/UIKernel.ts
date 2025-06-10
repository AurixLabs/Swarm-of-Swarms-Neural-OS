
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { UIComponentRegistry } from './UIComponentRegistry';
import { kernelEventSystem } from '../events/KernelEventSystem';

// Create a unique Symbol for kernel verification
export const UI_KERNEL_SIGNATURE = Symbol.for('CognitiveModularArchitecture.UIKernel');

export class UIKernel {
  public events: BrowserEventEmitter;
  public componentRegistry: UIComponentRegistry;
  private cognitiveUIEnabled: boolean = true;
  private stateStore: Map<string, any> = new Map();
  private readonly instanceId: string;
  private lastVerifiedTimestamp: number;
  private readonly _signature = UI_KERNEL_SIGNATURE;

  constructor() {
    this.events = new BrowserEventEmitter();
    this.componentRegistry = new UIComponentRegistry();
    this.instanceId = this.generateInstanceId();
    this.lastVerifiedTimestamp = Date.now();
    
    // Register with KernelEventSystem
    kernelEventSystem.registerKernel('ui', this._signature);
    
    // Initialize event handlers
    this.initializeEventHandlers();
    
    // Initialize security monitoring
    this.initializeSecurityMonitoring();
    
    // Make the UI kernel globally available (safely)
    if (typeof window !== 'undefined') {
      // Use Symbol to make the reference harder to tamper with
      const kernelSymbol = Symbol.for('uiKernel');
      
      try {
        // Only define the property if it doesn't already exist
        if (!Object.getOwnPropertySymbols(window).some(s => s === kernelSymbol)) {
          Object.defineProperty(window, kernelSymbol, {
            value: this,
            writable: false,
            configurable: false
          });
        }
      } catch (error) {
        // If error occurs (e.g., property already defined), just log it
        console.warn('Unable to define uiKernel on window:', error);
      }
    }
  }

  /**
   * Initialize event handlers for system events
   */
  private initializeEventHandlers(): void {
    // Handle handshake requests
    this.events.on('KERNEL_HANDSHAKE_REQUEST', (payload) => {
      if (payload.kernelId === 'ui') {
        console.log('Received handshake request from', payload.sourceKernelId);
        
        // Respond to the handshake
        this.events.emit('KERNEL_HANDSHAKE_RESPONSE', {
          targetKernelId: payload.sourceKernelId,
          sourceKernelId: 'ui',
          handshakeId: payload.handshakeId,
          kernelSignature: this._signature,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Verify if a kernel is authentic
   */
  public static verify(kernel: any): boolean {
    return kernel && kernel._signature === UI_KERNEL_SIGNATURE;
  }

  private generateInstanceId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private initializeSecurityMonitoring(): void {
    // Monitor for unauthorized modifications
    setInterval(() => this.verifyKernelIntegrity(), 30000);
  }

  private verifyKernelIntegrity(): void {
    const currentTimestamp = Date.now();
    
    // Check for time manipulation
    if (currentTimestamp < this.lastVerifiedTimestamp) {
      this.reportViolation('time_manipulation', {
        severity: 'critical',
        message: 'Time manipulation detected'
      });
    }
    
    this.lastVerifiedTimestamp = currentTimestamp;
    
    // Verify kernel instance
    if (typeof window !== 'undefined') {
      const storedKernel = window[Symbol.for('uiKernel')];
      if (storedKernel !== this) {
        this.reportViolation('kernel_tampering', {
          severity: 'critical',
          message: 'UI Kernel instance tampering detected'
        });
      }
    }
  }

  // Simple violation reporting method
  private reportViolation(type: string, details: any): void {
    console.warn(`Security violation detected: ${type}`, details);
    
    // Use kernel event system to report violations
    kernelEventSystem.emit('ui', 'SECURITY_VIOLATION', {
      type,
      details,
      timestamp: Date.now()
    });
  }

  /**
   * Initiate a handshake with another kernel
   */
  public initiateHandshake(kernelId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const handshakeId = Date.now().toString();
      
      // Set up a one-time listener for the response
      const handler = (payload: any) => {
        if (payload.handshakeId === handshakeId && payload.targetKernelId === 'ui') {
          this.events.off('KERNEL_HANDSHAKE_RESPONSE', handler);
          
          // Verify the signature
          const isVerified = kernelEventSystem.verifyKernel(kernelId, payload.kernelSignature);
          resolve(isVerified);
        }
      };
      
      this.events.on('KERNEL_HANDSHAKE_RESPONSE', handler);
      
      // Send the handshake request
      this.events.emit('KERNEL_HANDSHAKE_REQUEST', {
        kernelId,
        handshakeId,
        sourceKernelId: 'ui',
        timestamp: Date.now()
      });
      
      // Set a timeout
      setTimeout(() => {
        this.events.off('KERNEL_HANDSHAKE_RESPONSE', handler);
        resolve(false);
      }, 5000);
    });
  }

  public registerComponent(componentId: string): boolean {
    try {
      return this.componentRegistry.registerComponent({
        id: componentId,
        name: componentId,
        type: 'component',
        location: 'unknown',
        component: null
      });
    } catch (error) {
      console.error(`Error registering component ${componentId}:`, error);
      return false;
    }
  }

  public unregisterComponent(componentId: string): boolean {
    try {
      return this.componentRegistry.unregisterComponent(componentId);
    } catch (error) {
      console.error(`Error unregistering component ${componentId}:`, error);
      return false;
    }
  }

  public isComponentRegistered(componentId: string): boolean {
    try {
      return this.componentRegistry.isComponentRegistered(componentId);
    } catch (error) {
      console.error(`Error checking component registration ${componentId}:`, error);
      return false;
    }
  }

  public setState(key: string, value: any): void {
    try {
      // Add checksum to state updates
      const checksum = this.calculateStateChecksum(value);
      this.stateStore.set(key, {
        value,
        checksum,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`Error setting state for key ${key}:`, error);
    }
  }

  public getState(key: string): any {
    try {
      const state = this.stateStore.get(key);
      if (!state) return null;

      // Verify state integrity
      if (this.calculateStateChecksum(state.value) !== state.checksum) {
        this.reportViolation('state_tampering', {
          severity: 'critical',
          message: 'State integrity violation detected'
        });
        return null;
      }

      return state.value;
    } catch (error) {
      console.error(`Error getting state for key ${key}:`, error);
      return null;
    }
  }

  private calculateStateChecksum(value: any): string {
    try {
      const str = JSON.stringify(value) + this.instanceId;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(36);
    } catch (error) {
      console.error('Error calculating checksum:', error);
      return 'invalid';
    }
  }

  public isCognitiveUIEnabled(): boolean {
    return this.cognitiveUIEnabled;
  }

  public setCognitiveUIEnabled(enabled: boolean): void {
    try {
      this.cognitiveUIEnabled = enabled;
      this.events.emit('COGNITIVE_UI_CHANGED', { enabled, timestamp: Date.now() });
    } catch (error) {
      console.error('Error setting cognitive UI state:', error);
    }
  }

  public subscribe(eventType: string, handler: (payload: any) => void): () => void {
    try {
      this.events.on(eventType, handler);
      return () => {
        try {
          this.events.off(eventType, handler);
        } catch (offError) {
          console.error(`Error unsubscribing from event ${eventType}:`, offError);
        }
      };
    } catch (error) {
      console.error(`Error subscribing to event ${eventType}:`, error);
      return () => {}; // Return a no-op function
    }
  }

  public broadcast(eventType: string, payload: any): void {
    try {
      this.events.emit(eventType, payload);
    } catch (error) {
      console.error(`Error broadcasting event ${eventType}:`, error);
    }
  }

  private modules: Map<string, any> = new Map();

  public registerModule(moduleId: string, module: any): void {
    try {
      this.modules.set(moduleId, module);
    } catch (error) {
      console.error(`Error registering module ${moduleId}:`, error);
    }
  }

  public getModule(moduleId: string): any {
    try {
      return this.modules.get(moduleId);
    } catch (error) {
      console.error(`Error getting module ${moduleId}:`, error);
      return null;
    }
  }

  public listModules(): string[] {
    try {
      return Array.from(this.modules.keys());
    } catch (error) {
      console.error('Error listing modules:', error);
      return [];
    }
  }
}

// Create a global instance that can be used for testing/debugging
// Only create a new instance if one doesn't already exist
export const uiKernel = typeof window !== 'undefined' && 
  window[Symbol.for('uiKernel')] instanceof UIKernel ? 
  window[Symbol.for('uiKernel')] : new UIKernel();

// Create a type declaration for window
declare global {
  interface Window {
    [key: symbol]: any; // This allows any symbol as an index
  }
}
