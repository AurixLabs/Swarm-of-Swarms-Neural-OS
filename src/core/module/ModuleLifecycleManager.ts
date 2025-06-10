
import { EventEmitter } from 'events';
import { ModuleBase, ModuleStatus, ModuleHealth } from './ModuleBase';
import { moduleRegistry } from './ModuleRegistry';
import { globalEventBus } from './EventBus';

export interface Module {
  id: string;
  name: string;
  version: string;
  status: ModuleStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[];
  lastStart: number;
  errorCount: number;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  details: string;
  lastCheck: number;
}

export class ModuleLifecycleManager extends EventEmitter {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing Module Lifecycle Manager...');
    
    // Subscribe to global events
    globalEventBus.subscribe('ModuleLifecycleManager', 'module:registered', (event) => {
      this.emit('module:registered', event.payload);
    }, 'medium');

    globalEventBus.subscribe('ModuleLifecycleManager', 'module:failed', (event) => {
      this.emit('module:failed', event.payload);
    }, 'high');

    globalEventBus.subscribe('ModuleLifecycleManager', 'module:recovered', (event) => {
      this.emit('module:recovered', event.payload);
    }, 'medium');

    this.isInitialized = true;
    console.log('✅ Module Lifecycle Manager initialized');
  }

  async registerModule(moduleInstance: ModuleBase): Promise<void> {
    await moduleRegistry.registerModule(moduleInstance);
  }

  getModule(moduleId: string): Module | null {
    const moduleInstance = moduleRegistry.getModule(moduleId);
    if (!moduleInstance) return null;

    const health = moduleInstance.getHealth();
    return {
      id: moduleInstance.getId(),
      name: moduleInstance.getName(),
      version: moduleInstance.getVersion(),
      status: health.status,
      priority: moduleInstance.getPriority(),
      dependencies: moduleInstance.getDependencies(),
      lastStart: Date.now() - health.uptime,
      errorCount: health.errorCount
    };
  }

  getAllModules(): Module[] {
    return moduleRegistry.getAllModules().map(moduleInstance => {
      const health = moduleInstance.getHealth();
      return {
        id: moduleInstance.getId(),
        name: moduleInstance.getName(),
        version: moduleInstance.getVersion(),
        status: health.status,
        priority: moduleInstance.getPriority(),
        dependencies: moduleInstance.getDependencies(),
        lastStart: Date.now() - health.uptime,
        errorCount: health.errorCount
      };
    });
  }

  getModulesByStatus(status: ModuleStatus): Module[] {
    return this.getAllModules().filter(module => module.status === status);
  }

  async startModule(moduleId: string): Promise<void> {
    await moduleRegistry.startModule(moduleId);
  }

  async stopModule(moduleId: string, force = false): Promise<void> {
    await moduleRegistry.stopModule(moduleId, force);
  }

  async uninstallModule(moduleId: string, force = false): Promise<void> {
    await moduleRegistry.unregisterModule(moduleId, force);
  }

  canSafelyRemove(moduleId: string): boolean {
    return moduleRegistry.canSafelyRemove(moduleId);
  }

  getDependentModules(moduleId: string): string[] {
    return moduleRegistry.getDependents(moduleId);
  }

  async checkHealth(): Promise<Record<string, HealthStatus>> {
    const modules = moduleRegistry.getAllModules();
    const healthStatus: Record<string, HealthStatus> = {};

    for (const module of modules) {
      const health = module.getHealth();
      
      let overall: 'healthy' | 'degraded' | 'critical';
      let details: string;

      if (health.status === 'running' && health.isResponding) {
        overall = 'healthy';
        details = 'Module is running normally';
      } else if (health.status === 'degraded' || health.errorCount > 0) {
        overall = 'degraded';
        details = `Module has ${health.errorCount} errors`;
      } else {
        overall = 'critical';
        details = `Module status: ${health.status}`;
      }

      healthStatus[module.getId()] = {
        overall,
        details,
        lastCheck: Date.now()
      };
    }

    return healthStatus;
  }
}

export const moduleLifecycleManager = new ModuleLifecycleManager();
