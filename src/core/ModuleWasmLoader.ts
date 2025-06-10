
// DEPRECATED - Use UnifiedWasmLoader instead
// This file now just exports the unified loader to maintain compatibility

import { unifiedWasmLoader } from './wasm/UnifiedWasmLoader';

export class ModuleWasmLoader {
  private moduleId: string;

  constructor(moduleId: string) {
    this.moduleId = moduleId;
    console.log(`🔄 [DEPRECATED] ModuleWasmLoader(${moduleId}) - Use UnifiedWasmLoader instead`);
  }

  async loadModule(wasmPath: string): Promise<boolean> {
    console.log(`🔄 [DEPRECATED] Using UnifiedWasmLoader for ${this.moduleId}`);
    
    const result = await unifiedWasmLoader.loadModule(this.moduleId, wasmPath);
    return result.success;
  }

  async cleanup(): Promise<void> {
    unifiedWasmLoader.unload(this.moduleId);
  }
}
