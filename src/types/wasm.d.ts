
// WASM module type definitions for compiled modules
export interface WasmModule {
  [key: string]: any;
}

export interface WasmCapability {
  name: string;
  module: string;
  functions: string[];
}
