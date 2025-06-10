import { unifiedWasmLoader, WasmLoadResult } from './UnifiedWasmLoader';

export interface ModuleStatus {
  id: string;
  name: string;
  loaded: boolean;
  fallbackUsed: boolean;
  size?: number;
  error?: string;
  lastLoaded?: number;
  analysis?: {
    imports: number;
    exports: number;
    validWasm: boolean;
  };
}

export class WasmManager {
  private moduleConfigs = new Map<string, { name: string; path: string }>();
  private loadResults = new Map<string, WasmLoadResult>();
  private isInitialized = false;

  constructor() {
    this.setupCoreModules();
  }

  private setupCoreModules(): void {
    const coreModules = [
      { id: 'cma_neural_os', name: 'CMA Neural OS', path: '/wasm/cma_neural_os.wasm' },
      { id: 'neuromorphic', name: 'Neuromorphic Brain', path: '/wasm/neuromorphic.wasm' },
      { id: 'llama_bridge', name: 'LLaMA Bridge', path: '/wasm/llama_bridge.wasm' },
      { id: 'hybrid_intelligence', name: 'Hybrid Intelligence', path: '/wasm/hybrid_intelligence.wasm' },
      { id: 'reasoning_engine', name: 'Reasoning Engine', path: '/wasm/reasoning_engine.wasm' },
      { id: 'fused_kernels', name: 'Fused Kernels', path: '/wasm/fused_kernels.wasm' }
    ];

    coreModules.forEach(module => {
      this.moduleConfigs.set(module.id, { name: module.name, path: module.path });
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ WASM Manager already initialized');
      return;
    }

    console.log('🚀 Initializing WASM Manager with UnifiedWasmLoader (SINGLE SOURCE OF TRUTH)...');
    
    // Load all core modules using the unified loader
    const loadPromises = Array.from(this.moduleConfigs.entries()).map(
      async ([id, config]) => {
        const result = await unifiedWasmLoader.loadModule(id, config.path);
        this.loadResults.set(id, result);
        return { id, result };
      }
    );

    const results = await Promise.all(loadPromises);
    
    const successful = results.filter(r => r.result.success).length;
    const failed = results.filter(r => !r.result.success).length;
    
    console.log(`📊 WASM Manager initialized via UnifiedWasmLoader: ${successful} loaded, ${failed} failed`);
    
    this.isInitialized = true;
  }

  getModule(moduleId: string): any {
    return unifiedWasmLoader.getModule(moduleId);
  }

  isModuleLoaded(moduleId: string): boolean {
    return unifiedWasmLoader.isLoaded(moduleId);
  }

  executeFunction(moduleId: string, functionName: string, ...args: any[]): any {
    return unifiedWasmLoader.execute(moduleId, functionName, ...args);
  }

  getModuleStatus(moduleId: string): ModuleStatus | null {
    const config = this.moduleConfigs.get(moduleId);
    const result = this.loadResults.get(moduleId);

    if (!config) return null;

    return {
      id: moduleId,
      name: config.name,
      loaded: unifiedWasmLoader.isLoaded(moduleId),
      fallbackUsed: false,
      size: result?.size,
      error: result?.error,
      lastLoaded: result && result.success ? Date.now() : undefined,
      analysis: result?.analysis
    };
  }

  getAllModuleStatuses(): ModuleStatus[] {
    return Array.from(this.moduleConfigs.keys())
      .map(id => this.getModuleStatus(id))
      .filter(status => status !== null) as ModuleStatus[];
  }

  async reloadModule(moduleId: string): Promise<boolean> {
    const config = this.moduleConfigs.get(moduleId);
    if (!config) return false;

    console.log(`🔄 Reloading module ${moduleId} via UnifiedWasmLoader...`);
    unifiedWasmLoader.unload(moduleId);
    const result = await unifiedWasmLoader.loadModule(moduleId, config.path);
    this.loadResults.set(moduleId, result);
    
    return result.success;
  }

  addCustomModule(id: string, name: string, wasmPath: string): void {
    if (this.moduleConfigs.has(id)) {
      console.warn(`Module ${id} already exists, replacing...`);
    }

    this.moduleConfigs.set(id, { name, path: wasmPath });
    
    console.log(`📦 Custom module ${id} registered: ${name}`);
  }

  removeModule(moduleId: string): void {
    this.moduleConfigs.delete(moduleId);
    unifiedWasmLoader.unload(moduleId);
    this.loadResults.delete(moduleId);
    console.log(`🗑️ Module ${moduleId} removed`);
  }

  isInitialized(): boolean {
    return this.isInitialized;
  }

  getLoadedModuleIds(): string[] {
    return unifiedWasmLoader.getLoadedModules();
  }

  async runDiagnostics(): Promise<void> {
    console.log('\n🔍 RUNNING UNIFIED WASM DIAGNOSTICS...');
    console.log('=====================================');
    console.log('🎯 SINGLE SOURCE OF TRUTH: UnifiedWasmLoader');

    const statuses = this.getAllModuleStatuses();

    console.log('\n📊 Module Loading Status:');
    statuses.forEach(status => {
      const statusIcon = status.loaded ? '✅' : '❌';
      const sizeInfo = status.size ? ` (${Math.round(status.size / 1024)}KB)` : '';
      console.log(`${statusIcon} ${status.name}${sizeInfo}`);
      if (status.error) {
        console.log(`   Error: ${status.error}`);
      }
    });

    const loadedCount = statuses.filter(s => s.loaded).length;
    const totalCount = statuses.length;
    
    console.log(`\n📈 Summary: ${loadedCount}/${totalCount} modules loaded via UnifiedWasmLoader`);
    console.log('🎉 NO MORE CHAOS - ONE LOADER TO RULE THEM ALL!');
  }
}

export const wasmManager = new WasmManager();
