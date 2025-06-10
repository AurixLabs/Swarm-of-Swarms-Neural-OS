
import { SystemHealthData, WasmStatus } from '../types/systemHealthTypes';
import { unifiedWasmLoader } from '../../wasm/UnifiedWasmLoader';

export class WasmTestingService {
  private wasmModules = [
    { name: 'cma_neural_os', path: '/wasm/cma_neural_os.wasm' },
    { name: 'neuromorphic', path: '/wasm/neuromorphic.wasm' },
    { name: 'llama_bridge', path: '/wasm/llama_bridge.wasm' },
    { name: 'hybrid_intelligence', path: '/wasm/hybrid_intelligence.wasm' },
    { name: 'reasoning_engine', path: '/wasm/reasoning_engine.wasm' },
    { name: 'fused_kernels', path: '/wasm/fused_kernels.wasm' }
  ];

  async testWasmModules(): Promise<WasmStatus[]> {
    const results: WasmStatus[] = [];
    
    for (const module of this.wasmModules) {
      console.log(`🚀 Testing WASM module: ${module.name} - NO FALLBACKS`);
      
      try {
        const startTime = performance.now();
        
        // Use the unified loader - NO FALLBACKS
        const result = await unifiedWasmLoader.loadModule(module.name, module.path);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load WASM module');
        }
        
        const loadTime = performance.now() - startTime;
        console.log(`📊 ${module.name} load time: ${loadTime.toFixed(2)}ms`);
        
        results.push({
          name: module.name,
          loaded: true,
          size: result.size || 0,
          errors: []
        });
        
      } catch (error) {
        console.error(`❌ WASM test failed for ${module.name}:`, error);
        results.push({
          name: module.name,
          loaded: false,
          size: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    }
    
    return results;
  }
}

export const wasmTestingService = new WasmTestingService();
