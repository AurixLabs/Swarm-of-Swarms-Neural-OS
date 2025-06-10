
import { ModuleBase, ModuleStatus } from './ModuleBase';
import { globalEventBus } from './EventBus';

export interface ModuleRegistryMetrics {
  totalModules: number;
  runningModules: number;
  failedModules: number;
  degradedModules: number;
  totalRestarts: number;
  totalErrors: number;
}

export class ModuleRegistry {
  private modules = new Map<string, ModuleBase>();
  private dependencyGraph = new Map<string, Set<string>>();
  private dependents = new Map<string, Set<string>>();

  async registerModule(module: ModuleBase): Promise<void> {
    const moduleId = module.getId();
    
    if (this.modules.has(moduleId)) {
      throw new Error(`Module ${moduleId} is already registered`);
    }

    console.log(`📋 Registering module: ${module.getName()}`);
    
    this.modules.set(moduleId, module);
    this.buildDependencyGraph(module);
    this.setupModuleListeners(module);
    
    globalEventBus.publish({
      type: 'module:registered',
      payload: { moduleId, name: module.getName() },
      sourceModule: 'ModuleRegistry',
      priority: 'medium'
    });

    console.log(`✅ Module registered successfully: ${module.getName()}`);
  }

  async unregisterModule(moduleId: string, force = false): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Check for dependents unless forced
    if (!force && this.hasDependents(moduleId)) {
      const dependents = Array.from(this.dependents.get(moduleId) || []);
      throw new Error(`Cannot unregister ${moduleId}: Still has dependents: ${dependents.join(', ')}`);
    }

    console.log(`📋 Unregistering module: ${module.getName()}`);

    if (module.isRunning()) {
      await module.stop();
    }

    this.modules.delete(moduleId);
    this.dependencyGraph.delete(moduleId);
    this.dependents.delete(moduleId);
    
    // Remove from other modules' dependency lists
    for (const deps of this.dependents.values()) {
      deps.delete(moduleId);
    }

    globalEventBus.publish({
      type: 'module:unregistered',
      payload: { moduleId, name: module.getName() },
      sourceModule: 'ModuleRegistry',
      priority: 'medium'
    });

    console.log(`✅ Module unregistered: ${module.getName()}`);
  }

  async startModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Start dependencies first
    await this.startDependencies(moduleId);
    
    if (!module.isRunning()) {
      await module.start();
    }
  }

  async stopModule(moduleId: string, force = false): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Check for running dependents unless forced
    if (!force && this.hasRunningDependents(moduleId)) {
      const dependents = this.getRunningDependents(moduleId);
      throw new Error(`Cannot stop ${moduleId}: Has running dependents: ${dependents.join(', ')}`);
    }

    if (module.isRunning()) {
      await module.stop();
    }
  }

  async restartModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    await module.restart();
  }

  private async startDependencies(moduleId: string): Promise<void> {
    const dependencies = this.dependencyGraph.get(moduleId);
    if (!dependencies) return;

    for (const depId of dependencies) {
      const depModule = this.modules.get(depId);
      if (depModule && !depModule.isRunning()) {
        console.log(`🔗 Starting dependency ${depId} for ${moduleId}`);
        await this.startModule(depId);
      }
    }
  }

  private buildDependencyGraph(module: ModuleBase): void {
    const moduleId = module.getId();
    const dependencies = new Set(module.getDependencies());
    
    this.dependencyGraph.set(moduleId, dependencies);
    
    // Build reverse dependency graph
    for (const depId of dependencies) {
      if (!this.dependents.has(depId)) {
        this.dependents.set(depId, new Set());
      }
      this.dependents.get(depId)!.add(moduleId);
    }
  }

  private setupModuleListeners(module: ModuleBase): void {
    module.on('module:failed', (failedModule, error) => {
      console.error(`❌ Module failed: ${failedModule.getName()}`, error);
      globalEventBus.publish({
        type: 'module:failed',
        payload: { moduleId: failedModule.getId(), error: error.message },
        sourceModule: 'ModuleRegistry',
        priority: 'critical'
      });
    });

    module.on('module:degraded', (degradedModule) => {
      console.warn(`⚠️ Module degraded: ${degradedModule.getName()}`);
      globalEventBus.publish({
        type: 'module:degraded',
        payload: { moduleId: degradedModule.getId() },
        sourceModule: 'ModuleRegistry',
        priority: 'high'
      });
    });

    module.on('module:recovered', (recoveredModule) => {
      console.log(`✅ Module recovered: ${recoveredModule.getName()}`);
      globalEventBus.publish({
        type: 'module:recovered',
        payload: { moduleId: recoveredModule.getId() },
        sourceModule: 'ModuleRegistry',
        priority: 'medium'
      });
    });
  }

  // Query methods
  getModule(moduleId: string): ModuleBase | undefined {
    return this.modules.get(moduleId);
  }

  getAllModules(): ModuleBase[] {
    return Array.from(this.modules.values());
  }

  getModulesByStatus(status: ModuleStatus): ModuleBase[] {
    return this.getAllModules().filter(module => module.getHealth().status === status);
  }

  getDependencies(moduleId: string): string[] {
    return Array.from(this.dependencyGraph.get(moduleId) || []);
  }

  getDependents(moduleId: string): string[] {
    return Array.from(this.dependents.get(moduleId) || []);
  }

  hasDependents(moduleId: string): boolean {
    const dependents = this.dependents.get(moduleId);
    return dependents ? dependents.size > 0 : false;
  }

  hasRunningDependents(moduleId: string): boolean {
    return this.getRunningDependents(moduleId).length > 0;
  }

  getRunningDependents(moduleId: string): string[] {
    const dependents = this.dependents.get(moduleId) || new Set();
    return Array.from(dependents).filter(depId => {
      const module = this.modules.get(depId);
      return module && module.isRunning();
    });
  }

  canSafelyRemove(moduleId: string): boolean {
    return !this.hasRunningDependents(moduleId);
  }

  getMetrics(): ModuleRegistryMetrics {
    const modules = this.getAllModules();
    return {
      totalModules: modules.length,
      runningModules: modules.filter(m => m.getHealth().status === 'running').length,
      failedModules: modules.filter(m => m.getHealth().status === 'failed').length,
      degradedModules: modules.filter(m => m.getHealth().status === 'degraded').length,
      totalRestarts: modules.reduce((sum, m) => sum + m.getHealth().restartCount, 0),
      totalErrors: modules.reduce((sum, m) => sum + m.getHealth().errorCount, 0)
    };
  }
}

// Global singleton registry
export const moduleRegistry = new ModuleRegistry();
