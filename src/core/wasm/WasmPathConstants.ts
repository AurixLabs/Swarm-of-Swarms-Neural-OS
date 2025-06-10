
/**
 * LOVABLE SANDBOX PATH CONSTANTS
 * 
 * Due to Lovable's sandbox isolation, we need to serve WASM from src/wasm/
 * even though the real files exist in public/wasm/ in the actual repo.
 */
export const WASM_BASE_PATH = '/src/wasm';

export const WASM_MODULE_PATHS = {
  reasoning_engine: `${WASM_BASE_PATH}/reasoning_engine.wasm`,
  neuromorphic: `${WASM_BASE_PATH}/neuromorphic.wasm`,
  cma_neural_os: `${WASM_BASE_PATH}/cma_neural_os.wasm`,
  llama_bridge: `${WASM_BASE_PATH}/llama_bridge.wasm`,
  hybrid_intelligence: `${WASM_BASE_PATH}/hybrid_intelligence.wasm`,
  fused_kernels: `${WASM_BASE_PATH}/fused_kernels.wasm`,
} as const;

export type WasmModuleId = keyof typeof WASM_MODULE_PATHS;

/**
 * Get the standard path for a WASM module in Lovable's sandbox
 */
export const getWasmPath = (moduleId: WasmModuleId): string => {
  return WASM_MODULE_PATHS[moduleId];
};

/**
 * Directory where WASM files are stored in Lovable's sandbox
 */
export const WASM_SOURCE_DIR = 'src/wasm';

console.log('🚨 LOVABLE SANDBOX PATHS: Serving WASM from src/wasm/ due to sandbox isolation');
console.log('📍 Real files exist in public/wasm/ but Lovable cannot access them');
