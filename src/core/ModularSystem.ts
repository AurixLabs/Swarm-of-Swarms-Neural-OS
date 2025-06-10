
/**
 * MODULAR SYSTEM MANAGER
 * Manages the lifecycle of independent modules - TEMPORAL STATE ONLY
 */

import { IndependentModule } from './IndependentModule';
import { temporalState, TemporalEvent } from './TemporalState';
import { ErrorBoundary } from './ErrorBoundary';

export class ModularSystem {
  private static instance: ModularSystem;
  private modules = new Map<string, IndependentModule>();
  private subscriptions: (() => void)[] = [];

  static getInstance(): ModularSystem {
    if (!ModularSystem.instance) {
      ModularSystem.instance = new ModularSystem();
    }
    return ModularSystem.instance;
  }

  constructor() {
    this.setupSystemListeners();
  }

  private setupSystemListeners(): void {
    // Listen to all temporal events for system coordination
    const unsubscribe = temporalState.subscribe('*', (event: TemporalEvent) => {
      this.handleSystemEvent(event);
    });
    this.subscriptions.push(unsubscribe);
  }

  private handleSystemEvent(event: TemporalEvent): void {
    // System-level event handling (logging, metrics, etc.)
    console.log(`🕐 Temporal Event: ${event.type} from ${event.moduleId}`);
  }

  // MODULE MANAGEMENT
  async registerModule(module: IndependentModule): Promise<void> {
    const moduleId = module.getId();
    
    if (this.modules.has(moduleId)) {
      console.warn(`Module ${moduleId} already registered`);
      return;
    }

    this.modules.set(moduleId, module);
    console.log(`📝 Registered module: ${moduleId}`);
  }

  async unregisterModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      console.warn(`Module ${moduleId} not found for unregistration`);
      return;
    }

    await module.stop();
    this.modules.delete(moduleId);
    temporalState.unregisterModule(moduleId);
    
    console.log(`🗑️ Unregistered module: ${moduleId}`);
  }

  // REAL-TIME MODULE OPERATIONS
  async startModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    await module.start();
  }

  async stopModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    await module.stop();
  }

  async startAllModules(): Promise<void> {
    const startPromises = Array.from(this.modules.values()).map(module => 
      module.start().catch(error => {
        console.error(`Failed to start module ${module.getId()}:`, error);
      })
    );
    
    await Promise.all(startPromises);
    console.log(`🚀 Started ${this.modules.size} modules`);
  }

  async stopAllModules(): Promise<void> {
    const stopPromises = Array.from(this.modules.values()).map(module => 
      module.stop().catch(error => {
        console.error(`Failed to stop module ${module.getId()}:`, error);
      })
    );
    
    await Promise.all(stopPromises);
    console.log(`🛑 Stopped all modules`);
  }

  // REAL-TIME SWAPPING
  async swapModule(moduleId: string, newModule: IndependentModule): Promise<void> {
    console.log(`🔄 Swapping module: ${moduleId}`);
    
    // Stop old module
    await this.stopModule(moduleId);
    await this.unregisterModule(moduleId);
    
    // Start new module
    await this.registerModule(newModule);
    await this.startModule(newModule.getId());
    
    console.log(`✅ Module swap completed: ${moduleId} -> ${newModule.getId()}`);
  }

  // SYSTEM STATUS
  getActiveModules(): string[] {
    return Array.from(this.modules.keys()).filter(moduleId => {
      const state = temporalState.getModuleState(moduleId);
      return state?.status === 'active';
    });
  }

  getSystemStatus(): {
    totalModules: number;
    activeModules: number;
    errorModules: number;
    loadingModules: number;
  } {
    const states = temporalState.getAllModuleStates();
    const total = states.size;
    let active = 0, error = 0, loading = 0;
    
    states.forEach(state => {
      switch (state.status) {
        case 'active': active++; break;
        case 'error': error++; break;
        case 'loading': loading++; break;
      }
    });
    
    return { totalModules: total, activeModules: active, errorModules: error, loadingModules: loading };
  }

  // CLEANUP
  async shutdown(): Promise<void> {
    console.log('🔴 Shutting down modular system...');
    
    await this.stopAllModules();
    
    // Clean up subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    
    this.modules.clear();
    console.log('✅ Modular system shutdown complete');
  }
}

// SINGLETON EXPORT
export const modularSystem = ModularSystem.getInstance();
