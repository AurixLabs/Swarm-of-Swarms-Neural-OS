
import { BrowserEventEmitter } from '@/core/BrowserEventEmitter';
import { temporalHybridSync } from '@/core/hybrid/TemporalHybridSync';
import { temporalSystemCoordinator } from '@/core/temporal/TemporalSystemCoordinator';

export interface TemporalModuleMetadata {
  id: string;
  name: string;
  version: string;
  temporalCapabilities: string[];
  hotswappable: boolean;
  kernelAffinity: 'any' | 'merged' | 'meta';
  lifecycleStage: 'created' | 'initializing' | 'running' | 'paused' | 'stopping' | 'stopped';
  lastTemporalSync: number;
}

export class ModuleTemporalLifecycle extends BrowserEventEmitter {
  private static instance: ModuleTemporalLifecycle;
  private modules: Map<string, TemporalModuleMetadata> = new Map();
  private lifecycleHooks: Map<string, Function[]> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): ModuleTemporalLifecycle {
    if (!ModuleTemporalLifecycle.instance) {
      ModuleTemporalLifecycle.instance = new ModuleTemporalLifecycle();
    }
    return ModuleTemporalLifecycle.instance;
  }

  public async initializeTemporalLifecycle(): Promise<void> {
    console.log('🕐 Initializing Module Temporal Lifecycle...');
    
    // Initialize temporal hybrid sync
    await temporalHybridSync.initializeHybridSync();
    
    // Listen for kernel mode switches
    temporalHybridSync.on('hybrid:mode_switched', (data) => {
      this.handleKernelModeSwitch(data.newMode);
    });

    // Listen for module events from hybrid sync
    temporalHybridSync.on('hybrid:module_registered', (data) => {
      this.syncModuleRegistration(data.moduleId, data.metadata);
    });

    console.log('✅ Module Temporal Lifecycle initialized');
  }

  public async registerTemporalModule(metadata: TemporalModuleMetadata): Promise<boolean> {
    try {
      // Update lifecycle stage
      metadata.lifecycleStage = 'initializing';
      metadata.lastTemporalSync = Date.now();

      // Store module metadata
      this.modules.set(metadata.id, metadata);

      // Register with hybrid sync
      temporalHybridSync.registerModule(metadata.id, metadata);

      // Send temporal registration event
      temporalSystemCoordinator.sendGlobalMessage('temporal_module_registered', {
        moduleId: metadata.id,
        capabilities: metadata.temporalCapabilities,
        hotswappable: metadata.hotswappable,
        timestamp: Date.now()
      });

      // Execute lifecycle hooks
      await this.executeLifecycleHooks(metadata.id, 'registered');

      // Update to running state
      metadata.lifecycleStage = 'running';
      this.modules.set(metadata.id, metadata);

      this.emit('temporal:module_registered', metadata);
      console.log(`📦 Temporal module registered: ${metadata.id}`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to register temporal module ${metadata.id}:`, error);
      return false;
    }
  }

  public async hotswapModule(moduleId: string, newVersion: string, preserveState: boolean = true): Promise<boolean> {
    const module = this.modules.get(moduleId);
    if (!module) {
      console.error(`❌ Module ${moduleId} not found for hotswap`);
      return false;
    }

    if (!module.hotswappable) {
      console.error(`❌ Module ${moduleId} is not hotswappable`);
      return false;
    }

    try {
      console.log(`🔄 Hotswapping module ${moduleId} to version ${newVersion}`);

      // Phase 1: Pause module
      module.lifecycleStage = 'paused';
      await this.executeLifecycleHooks(moduleId, 'pausing');

      // Phase 2: Preserve state if requested
      let preservedState = null;
      if (preserveState) {
        preservedState = await this.preserveModuleState(moduleId);
      }

      // Phase 3: Execute hotswap
      await this.executeHotswap(moduleId, newVersion);

      // Phase 4: Restore state if preserved
      if (preservedState) {
        await this.restoreModuleState(moduleId, preservedState);
      }

      // Phase 5: Resume module
      module.version = newVersion;
      module.lifecycleStage = 'running';
      module.lastTemporalSync = Date.now();
      this.modules.set(moduleId, module);

      await this.executeLifecycleHooks(moduleId, 'hotswapped');

      // Send temporal hotswap event
      temporalSystemCoordinator.sendGlobalMessage('module_hotswapped', {
        moduleId,
        oldVersion: module.version,
        newVersion,
        preservedState: preserveState,
        timestamp: Date.now()
      });

      this.emit('temporal:module_hotswapped', { moduleId, newVersion });
      console.log(`✅ Successfully hotswapped module ${moduleId}`);

      return true;
    } catch (error) {
      console.error(`❌ Hotswap failed for module ${moduleId}:`, error);
      
      // Attempt to restore to running state
      module.lifecycleStage = 'running';
      this.modules.set(moduleId, module);
      
      return false;
    }
  }

  public async unregisterTemporalModule(moduleId: string, graceful: boolean = true): Promise<boolean> {
    const module = this.modules.get(moduleId);
    if (!module) {
      return false;
    }

    try {
      // Phase 1: Stop module gracefully
      if (graceful) {
        module.lifecycleStage = 'stopping';
        await this.executeLifecycleHooks(moduleId, 'stopping');
      }

      // Phase 2: Unregister from hybrid sync
      temporalHybridSync.unregisterModule(moduleId);

      // Phase 3: Clean up
      this.modules.delete(moduleId);
      this.lifecycleHooks.delete(moduleId);

      // Send temporal unregistration event
      temporalSystemCoordinator.sendGlobalMessage('temporal_module_unregistered', {
        moduleId,
        graceful,
        timestamp: Date.now()
      });

      this.emit('temporal:module_unregistered', { moduleId });
      console.log(`📦 Temporal module unregistered: ${moduleId}`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to unregister temporal module ${moduleId}:`, error);
      return false;
    }
  }

  public addLifecycleHook(moduleId: string, hook: Function): void {
    if (!this.lifecycleHooks.has(moduleId)) {
      this.lifecycleHooks.set(moduleId, []);
    }
    this.lifecycleHooks.get(moduleId)!.push(hook);
  }

  private async executeLifecycleHooks(moduleId: string, stage: string): Promise<void> {
    const hooks = this.lifecycleHooks.get(moduleId) || [];
    for (const hook of hooks) {
      try {
        await hook(stage, this.modules.get(moduleId));
      } catch (error) {
        console.error(`❌ Lifecycle hook failed for ${moduleId} at stage ${stage}:`, error);
      }
    }
  }

  private async preserveModuleState(moduleId: string): Promise<any> {
    // In a real implementation, this would capture actual module state
    return {
      moduleId,
      timestamp: Date.now(),
      state: 'preserved'
    };
  }

  private async restoreModuleState(moduleId: string, state: any): Promise<void> {
    // In a real implementation, this would restore actual module state
    console.log(`🔄 Restoring state for module: ${moduleId}`);
  }

  private async executeHotswap(moduleId: string, newVersion: string): Promise<void> {
    // In a real implementation, this would load the new module version
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private handleKernelModeSwitch(newMode: string): void {
    console.log(`🔄 Kernel mode switched to ${newMode}, updating modules...`);
    
    // Update all modules' temporal sync timestamps
    for (const [moduleId, module] of this.modules.entries()) {
      module.lastTemporalSync = Date.now();
      this.modules.set(moduleId, module);
    }

    this.emit('temporal:kernel_mode_switched', { newMode, moduleCount: this.modules.size });
  }

  private syncModuleRegistration(moduleId: string, metadata: any): void {
    if (this.modules.has(moduleId)) {
      const module = this.modules.get(moduleId)!;
      module.lastTemporalSync = Date.now();
      this.modules.set(moduleId, module);
    }
  }

  public getTemporalModules(): TemporalModuleMetadata[] {
    return Array.from(this.modules.values());
  }

  public getModuleMetrics(): any {
    const modules = Array.from(this.modules.values());
    const stageCount = modules.reduce((acc, module) => {
      acc[module.lifecycleStage] = (acc[module.lifecycleStage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalModules: modules.length,
      hotswappableModules: modules.filter(m => m.hotswappable).length,
      stageDistribution: stageCount,
      averageUptime: modules.length > 0 ? 
        modules.reduce((sum, m) => sum + (Date.now() - m.lastTemporalSync), 0) / modules.length : 0,
      timestamp: Date.now()
    };
  }
}

export const moduleTemporalLifecycle = ModuleTemporalLifecycle.getInstance();
