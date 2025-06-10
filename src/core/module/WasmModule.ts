
import { ModuleBase, ModuleStatus, ModuleHealth } from './ModuleBase';
import { eventBus } from './EventBus';

export interface WasmModuleInfo {
  id: string;
  name: string;
  status: 'loading' | 'loaded' | 'error' | 'not_found';
  error?: string;
  loadTime?: number;
  module?: any;
}

export class WasmModule extends ModuleBase {
  private modules: Map<string, WasmModuleInfo> = new Map();
  private loadAttempts: Map<string, number> = new Map();
  private maxRetries = 3;

  constructor() {
    super('wasm-module', 'WebAssembly Module Manager', 1.0);
  }

  async initialize(): Promise<void> {
    this.updateStatus('initializing');
    
    try {
      console.log('🔧 Initializing WasmModule...');
      
      // Load core WASM modules
      await this.loadCoreModules();
      
      this.updateStatus('running');
      this.updateHealth('healthy');
      
      eventBus.emit('wasm:initialized', { moduleId: this.id });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.updateStatus('stopping');
    
    // Clear all loaded modules
    this.modules.clear();
    this.loadAttempts.clear();
    
    this.updateStatus('stopped');
    eventBus.emit('wasm:shutdown', { moduleId: this.id });
  }

  async restart(): Promise<void> {
    await this.shutdown();
    await this.initialize();
  }

  // Core WASM module loading
  private async loadCoreModules(): Promise<void> {
    const coreModules = [
      { id: 'cma_neural_os', path: '/wasm/cma_neural_os.wasm' },
      { id: 'neuromorphic', path: '/wasm/neuromorphic.wasm' },
      { id: 'llama_bridge', path: '/wasm/llama_bridge.wasm' }
    ];

    for (const moduleInfo of coreModules) {
      await this.loadModule(moduleInfo.id, moduleInfo.path);
    }
  }

  async loadModule(id: string, wasmPath: string): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      this.modules.set(id, {
        id,
        name: id.replace(/_/g, ' ').toUpperCase(),
        status: 'loading'
      });

      // Simulate temporal-aware loading
      const response = await fetch(wasmPath);
      if (!response.ok) {
        throw new Error(`Failed to load WASM: ${response.statusText}`);
      }

      const wasmBytes = await response.arrayBuffer();
      const wasmModule = await WebAssembly.instantiate(wasmBytes);
      
      const loadTime = Date.now() - startTime;
      
      this.modules.set(id, {
        id,
        name: id.replace(/_/g, ' ').toUpperCase(),
        status: 'loaded',
        loadTime,
        module: wasmModule.instance.exports
      });

      eventBus.emit('wasm:module:loaded', { moduleId: id, loadTime });
      console.log(`✅ WASM module ${id} loaded in ${loadTime}ms`);
      
      return true;
    } catch (error) {
      const attempts = this.loadAttempts.get(id) || 0;
      this.loadAttempts.set(id, attempts + 1);

      this.modules.set(id, {
        id,
        name: id.replace(/_/g, ' ').toUpperCase(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      eventBus.emit('wasm:module:error', { moduleId: id, error: error.message, attempts: attempts + 1 });
      console.error(`❌ WASM module ${id} failed to load:`, error);

      // Auto-retry if under limit
      if (attempts < this.maxRetries) {
        setTimeout(() => this.loadModule(id, `/wasm/${id}.wasm`), 2000 * (attempts + 1));
      }

      return false;
    }
  }

  getModule(id: string): any {
    const moduleInfo = this.modules.get(id);
    return moduleInfo?.status === 'loaded' ? moduleInfo.module : null;
  }

  getAllModules(): WasmModuleInfo[] {
    return Array.from(this.modules.values());
  }

  getModuleHealth(): ModuleHealth {
    const totalModules = this.modules.size;
    const loadedModules = Array.from(this.modules.values()).filter(m => m.status === 'loaded').length;
    const errorModules = Array.from(this.modules.values()).filter(m => m.status === 'error').length;

    if (errorModules > totalModules / 2) {
      return 'critical';
    } else if (errorModules > 0 || loadedModules < totalModules) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  executeFunction(moduleId: string, functionName: string, ...args: any[]): any {
    const module = this.getModule(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not loaded`);
    }

    const func = module[functionName];
    if (typeof func !== 'function') {
      throw new Error(`Function ${functionName} not found in module ${moduleId}`);
    }

    try {
      const result = func(...args);
      eventBus.emit('wasm:function:executed', { moduleId, functionName, success: true });
      return result;
    } catch (error) {
      eventBus.emit('wasm:function:executed', { moduleId, functionName, success: false, error: error.message });
      throw error;
    }
  }
}

export const wasmModule = new WasmModule();
