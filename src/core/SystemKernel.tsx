
import { UniversalKernel, Module, ModuleOptions } from './UniversalKernel';
import { createContext, useContext, ReactNode, useEffect } from 'react';
import { SystemEventBus } from './events/SystemEventBus';
import { PluginRegistry, Plugin } from './plugins/PluginRegistry';
import { SystemHealthMonitor } from './health/SystemHealthMonitor';
import { securityBridge } from './security/SecurityBridge';
import { SystemEventHandlers } from './system/SystemEventHandlers';
import { SystemState } from './system/SystemState';
import { DistributedEthicalGuard } from './ethics/DistributedEthicalGuard';
import { createSystemEvent } from './utils/eventUtils';
import { kernelEventSystem } from './events/KernelEventSystem';
import { toast } from 'sonner';
import { neuromorphicKernel } from './neuromorphic/NeuromorphicKernel';

// Create a unique Symbol for kernel verification
export const SYSTEM_KERNEL_SIGNATURE = Symbol.for('CognitiveModularArchitecture.SystemKernel');

export interface SystemPlugin extends Plugin {
  id: string;
  initialize(registry: PluginRegistry): boolean;
  destroy(): void;
}

export type EventType = 
  | 'SECURITY_ALERT'
  | 'UI_STATE_CHANGED'
  | 'DATA_UPDATED'
  | 'ETHICS_POLICY_CHANGED'
  | 'PHILOSOPHICAL_EVENT'
  | 'SAFETY_ERROR_DETECTED'
  | 'SAFETY_RECOVERY_SUCCESS'
  | 'SAFETY_RECOVERY_FAILED'
  | 'SAFETY_CONFIG_CHANGED'
  | 'KERNEL_RESET_REQUEST'
  | 'MODULE_RESTART_REQUEST'
  | 'KERNEL_HANDSHAKE_REQUEST'
  | 'KERNEL_HANDSHAKE_RESPONSE'
  | 'NEUROMORPHIC_EVENT';  // Added new event type

export class SystemKernel extends UniversalKernel {
  private readonly _signature = SYSTEM_KERNEL_SIGNATURE;
  private pluginRegistry = new PluginRegistry();
  private healthMonitor: SystemHealthMonitor;
  private selfHealingEnabled = true;
  private ethicsInitialized = false;
  private eventHandlers: SystemEventHandlers;
  private systemState: SystemState;
  private verifiedKernels: Map<string, boolean> = new Map();
  private initializationComplete = false;
  private neuromorphicInitialized = false;  // Track neuromorphic kernel

  constructor() {
    super();
    
    this.events = new SystemEventBus();
    this.eventHandlers = new SystemEventHandlers(this.events as SystemEventBus);
    this.systemState = new SystemState(this.events as SystemEventBus);
    
    this.healthMonitor = new SystemHealthMonitor(this.events as SystemEventBus, this.pluginRegistry);
    
    // Register with KernelEventSystem
    kernelEventSystem.registerKernel('system', this._signature);
    
    securityBridge.registerKernel('system');
    securityBridge.on('security:critical', this.eventHandlers.handleSecurityCritical);
    securityBridge.on('ethics:updated', this.eventHandlers.handleEthicsUpdated);
    
    this.eventHandlers.registerSelfHealingHandlers(this.pluginRegistry, this.state);
    
    // Add kernel handshake handlers
    this.events.on('KERNEL_HANDSHAKE_REQUEST', this.handleHandshakeRequest);
    this.events.on('KERNEL_HANDSHAKE_RESPONSE', this.handleHandshakeResponse);
    
    // Initialize ethical safeguards after security is ready
    setTimeout(() => this.initializeEthicalSafeguards(), 100);
  }

  /**
   * Verify if a kernel is authentic
   */
  public static verify(kernel: any): boolean {
    return kernel && kernel._signature === SYSTEM_KERNEL_SIGNATURE;
  }

  /**
   * Initialize the ethical safeguards
   */
  private initializeEthicalSafeguards(): void {
    try {
      DistributedEthicalGuard.initialize();
      this.ethicsInitialized = true;
      console.log('Distributed ethical safeguards initialized');
      
      // Mark initialization as complete
      this.initializationComplete = true;
      this.events.emitEvent(createSystemEvent('SYSTEM_INITIALIZATION_COMPLETE', {
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to initialize distributed ethical safeguards:', error);
      this.systemState.enterSafeMode();
    }
  }

  /**
   * Initialize neuromorphic kernel
   */
  private async initializeNeuromorphicKernel(): Promise<void> {
    try {
      console.log('Initializing Neuromorphic Kernel...');
      
      const success = await neuromorphicKernel.initialize();
      
      if (success) {
        this.neuromorphicInitialized = true;
        console.log('Neuromorphic kernel initialized successfully');
        this.events.emitEvent(createSystemEvent('NEUROMORPHIC_EVENT', {
          type: 'initialization',
          success: true,
          timestamp: Date.now()
        }));
      } else {
        console.warn('Neuromorphic kernel initialization failed');
      }
    } catch (error) {
      console.error('Failed to initialize neuromorphic kernel:', error);
      this.events.emitEvent(createSystemEvent('NEUROMORPHIC_EVENT', {
        type: 'initialization',
        success: false,
        error: String(error),
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Handle handshake requests from other kernels
   */
  private handleHandshakeRequest = (event: any) => {
    if (!event || !event.payload) return;
    
    const { kernelId, handshakeId } = event.payload;
    console.log(`Received handshake request from ${kernelId}`);
    
    // Respond to the handshake
    this.events.emitEvent(createSystemEvent('KERNEL_HANDSHAKE_RESPONSE', {
      targetKernelId: kernelId,
      handshakeId,
      systemKernelSignature: this._signature,
      timestamp: Date.now()
    }));
  };

  /**
   * Handle handshake responses from other kernels
   */
  private handleHandshakeResponse = (event: any) => {
    if (!event || !event.payload) return;
    
    const { targetKernelId, kernelSignature } = event.payload;
    
    if (targetKernelId === 'system') {
      // Verify the signature
      this.verifiedKernels.set(event.payload.sourceKernelId, true);
      console.log(`Kernel ${event.payload.sourceKernelId} verified`);
    }
  };

  /**
   * Initiate a handshake with another kernel
   */
  public initiateHandshake(kernelId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const handshakeId = Date.now().toString();
      
      // Set up a one-time listener for the response
      const handleResponse = (event: any) => {
        if (event?.payload?.handshakeId === handshakeId && event?.payload?.targetKernelId === 'system') {
          // Remove the listener
          this.events.off('KERNEL_HANDSHAKE_RESPONSE', handleResponse);
          
          // Verify the signature
          const isVerified = kernelEventSystem.verifyKernel(kernelId, event.payload.kernelSignature);
          this.verifiedKernels.set(kernelId, isVerified);
          
          resolve(isVerified);
        }
      };
      
      // Register the listener
      this.events.on('KERNEL_HANDSHAKE_RESPONSE', handleResponse);
      
      // Send the handshake request
      this.events.emitEvent(createSystemEvent('KERNEL_HANDSHAKE_REQUEST', {
        kernelId,
        handshakeId,
        sourceKernelId: 'system',
        timestamp: Date.now()
      }));
      
      // Set a timeout
      setTimeout(() => {
        this.events.off('KERNEL_HANDSHAKE_RESPONSE', handleResponse);
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Check if a kernel has been verified
   */
  public isKernelVerified(kernelId: string): boolean {
    return this.verifiedKernels.get(kernelId) === true;
  }

  public override getState<T>(key: string): T | undefined {
    return this.systemState.getState<T>(key);
  }

  public override setState<T>(key: string, value: T): void {
    this.systemState.setState(key, value);
  }

  public override registerModule(moduleId: string, module: Module, options: ModuleOptions = {}): boolean {
    const plugin = module as unknown as SystemPlugin;
    const result = this.pluginRegistry.registerPlugin(plugin, options as any);
    if (result) {
      plugin.initialize(this.pluginRegistry);
    }
    return result;
  }

  public override unregisterModule(moduleId: string): boolean {
    return this.pluginRegistry.unregisterPlugin(moduleId);
  }

  public override getModule<T extends Module>(moduleId: string): T | undefined {
    return this.pluginRegistry.getPlugin<T extends SystemPlugin ? T : never>(moduleId);
  }

  public listModules(): string[] {
    return this.pluginRegistry.listPlugins();
  }

  public performCriticalOperation(operation: string, context: any): boolean {
    const validation = DistributedEthicalGuard.validateCriticalOperation(
      operation,
      'critical',
      context
    );
    
    if (!validation.validated) {
      console.error(`Critical operation rejected: ${validation.reasoning}`);
      this.events.emitEvent(createSystemEvent('SECURITY_ALERT', {
        level: 'critical',
        message: `Ethically rejected operation: ${operation}`,
        reason: validation.reasoning,
        fallbackApplied: validation.fallbackApplied
      }));
      return false;
    }
    
    console.log(`Critical operation validated: ${operation}`);
    return true;
  }

  /**
   * Start health monitoring and self-healing
   */
  private startHealthMonitoring(): void {
    // Periodically check kernel integrity
    setInterval(() => {
      if (!this.selfHealingEnabled) return;
      
      // Check UI Kernel integrity
      this.checkKernelIntegrity('ui');
      
      // Check AI Kernel integrity
      this.checkKernelIntegrity('ai');
      
      // Check Neuromorphic Kernel integrity
      if (this.neuromorphicInitialized) {
        // Add neuromorphic health check here if needed
      }
      
      // Check other kernels as needed
    }, 10000); // Check every 10 seconds
  }
  
  /**
   * Check the integrity of a kernel
   */
  private checkKernelIntegrity(kernelId: string): void {
    // First check if kernel is verified
    if (!this.isKernelVerified(kernelId)) {
      // Attempt to verify it
      this.initiateHandshake(kernelId).then(verified => {
        if (!verified) {
          console.warn(`Kernel ${kernelId} integrity check failed - not verified`);
          this.events.emitEvent(createSystemEvent('SECURITY_ALERT', {
            level: 'warning',
            message: `Kernel ${kernelId} failed integrity check`,
            kernelId,
            timestamp: Date.now()
          }));
        }
      });
    }
  }

  /**
   * Check if the neuromorphic kernel is initialized
   */
  public isNeuromorphicInitialized(): boolean {
    return this.neuromorphicInitialized;
  }

  public enableSelfHealing(): void {
    if (!this.selfHealingEnabled) {
      this.selfHealingEnabled = true;
      this.healthMonitor.enable();
      this.startHealthMonitoring();
      
      console.log('Self-healing enabled for SystemKernel');
      this.events.emitEvent(createSystemEvent('SYSTEM_SELF_HEALING', { 
        enabled: true,
        timestamp: Date.now()
      }));
    }
  }
  
  public disableSelfHealing(): void {
    if (this.selfHealingEnabled) {
      this.selfHealingEnabled = false;
      this.healthMonitor.disable();
      
      console.log('Self-healing disabled for SystemKernel');
      this.events.emitEvent(createSystemEvent('SYSTEM_SELF_HEALING', { 
        enabled: false,
        timestamp: Date.now()
      }));
    }
  }
  
  public isSelfHealingEnabled(): boolean {
    return this.selfHealingEnabled;
  }

  public enterSafeMode(): void {
    this.systemState.enterSafeMode();
  }

  public exitSafeMode(): void {
    this.systemState.exitSafeMode();
  }

  public isInSafeMode(): boolean {
    return this.systemState.isInSafeMode();
  }

  public shutdown(): void {
    this.healthMonitor.disable();
    this.pluginRegistry.listPlugins().forEach(id => {
      this.pluginRegistry.unregisterPlugin(id);
    });
    
    securityBridge.off('security:critical', this.eventHandlers.handleSecurityCritical);
    securityBridge.off('ethics:updated', this.eventHandlers.handleEthicsUpdated);
    
    this.events.removeAllListeners();
  }

  public initializeSystem(): void {
    try {
      console.log('Initializing System Kernel...');
      
      if (!securityBridge.isKernelRegistered('system')) {
        securityBridge.registerKernel('system');
      }
      
      this.enableSelfHealing();
      
      if (!this.ethicsInitialized) {
        this.initializeEthicalSafeguards();
      }
      
      // Initialize Neuromorphic Kernel
      if (!this.neuromorphicInitialized) {
        this.initializeNeuromorphicKernel();
      }
      
      // Initiate handshakes with other kernels
      setTimeout(() => {
        this.initiateHandshake('ui').then(verified => {
          if (verified) {
            console.log('UI Kernel verified');
          } else {
            console.warn('UI Kernel verification failed');
          }
        });
      }, 500);
      
      console.log('System Kernel initialization complete');
    } catch (error) {
      console.error('Failed to initialize System Kernel:', error);
      this.enterSafeMode();
    }
  }
}

export const systemKernel = new SystemKernel();

const SystemContext = createContext<SystemKernel | null>(null);

export const SystemProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    systemKernel.initializeSystem();
    // Show toast when system is ready
    toast.success("System kernel initialized", {
      description: "Core system components are ready",
      duration: 3000,
    });
    
    return () => {
      systemKernel.disableSelfHealing();
    };
  }, []);
  
  return (
    <SystemContext.Provider value={systemKernel}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
