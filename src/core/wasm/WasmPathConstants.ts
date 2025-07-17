
/**
 * WASM PATH CONSTANTS
 * 
 * Platform-agnostic WASM module path configuration
 */
export const WASM_BASE_PATH = '/wasm';

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
 * Get the path for a WASM module
 */
export const getWasmPath = (moduleId: WasmModuleId): string => {
  return WASM_MODULE_PATHS[moduleId];
};

/**
 * Directory where WASM files are stored
 */
export const WASM_SOURCE_DIR = 'wasm';

console.log('📍 WASM Module Paths configured for platform-agnostic deployment');
