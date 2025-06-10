import { WASM_PUBLIC_DIR, WASM_MODULE_PATHS } from './WasmPathConstants';

export class WasmBuilder {
  static async checkModuleExists(moduleId: string): Promise<boolean> {
    try {
      const path = WASM_MODULE_PATHS[moduleId as keyof typeof WASM_MODULE_PATHS] || `/wasm/${moduleId}.wasm`;
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  static async checkAllModules(): Promise<Record<string, boolean>> {
    const moduleIds = Object.keys(WASM_MODULE_PATHS);
    const results: Record<string, boolean> = {};
    
    for (const moduleId of moduleIds) {
      results[moduleId] = await this.checkModuleExists(moduleId);
    }
    
    return results;
  }
  
  static getModuleStatus(moduleExists: Record<string, boolean>) {
    const total = Object.keys(moduleExists).length;
    const existing = Object.values(moduleExists).filter(Boolean).length;
    
    return {
      total,
      existing,
      missing: total - existing,
      percentage: Math.round((existing / total) * 100)
    };
  }
  
  static getBuildInstructions(): string[] {
    return [
      `📍 SOURCE OF TRUTH: All WASM files go in ${WASM_PUBLIC_DIR}/`,
      '1. Navigate to src/rust/reasoning_engine/',
      '2. Run: chmod +x build_for_real.sh',
      '3. Run: ./build_for_real.sh',
      `4. Check ${WASM_PUBLIC_DIR}/ for generated files`,
      '5. Repeat for other Rust modules if needed',
      '🎯 ALL modules must be in public/wasm/ directory!'
    ];
  }
}
