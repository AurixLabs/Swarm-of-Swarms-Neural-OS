
// DEPRECATED - Use UnifiedWasmLoader instead
// This file now just exports the unified loader to maintain compatibility

import { unifiedWasmLoader, WasmLoadResult } from './UnifiedWasmLoader';

export interface WasmModuleInterface {
  [key: string]: any;
}

export class WasmModuleLoader {
  private moduleId: string;
  private isLoaded = false;
  private module: any = null;

  constructor(moduleId: string) {
    this.moduleId = moduleId;
    console.log(`🔄 [DEPRECATED] WasmModuleLoader(${moduleId}) - Use UnifiedWasmLoader instead`);
  }

  async loadModule(wasmPath?: string): Promise<boolean> {
    console.log(`🔄 [DEPRECATED] Using UnifiedWasmLoader for ${this.moduleId}`);
    
    const result = await unifiedWasmLoader.loadModule(this.moduleId, wasmPath);
    
    if (result.success) {
      this.module = result.module;
      this.isLoaded = true;
    }
    
    return result.success;
  }

  async loadWasm(wasmPath: string): Promise<WasmLoadResult> {
    console.log(`🔄 [DEPRECATED] Using UnifiedWasmLoader for ${this.moduleId}`);
    return await unifiedWasmLoader.loadModule(this.moduleId, wasmPath);
  }

  getModule(): any {
    return this.module || unifiedWasmLoader.getModule(this.moduleId);
  }

  isLoaded(): boolean {
    return this.isLoaded || unifiedWasmLoader.isLoaded(this.moduleId);
  }

  execute(functionName: string, ...args: any[]): any {
    return unifiedWasmLoader.execute(this.moduleId, functionName, ...args);
  }

  unload(): void {
    unifiedWasmLoader.unload(this.moduleId);
    this.isLoaded = false;
    this.module = null;
  }

  async cleanup(): Promise<void> {
    this.unload();
  }
}
