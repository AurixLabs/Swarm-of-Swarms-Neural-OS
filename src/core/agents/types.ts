
export interface TinyLlamaResponse {
  text: string;
  confidence: number;
  processingTime: number;
  modelUsed: string;
  spikingActivity?: number[];
  reasoningSteps?: string[];
}

export interface WasmModuleInterface {
  // Common WASM functions that our Rust modules should export
  initialize?: () => boolean;
  process?: (input: string) => string;
  analyze?: (input: string) => any;
  generate_response?: (input: string) => string;
  process_spikes?: (spikes: Float32Array) => Float32Array;
  get_health?: () => string;
  get_metrics?: () => string;
  validate_ethics?: (action: string) => boolean;
  force_recovery?: () => boolean;
  
  // Memory management
  memory?: WebAssembly.Memory;
  
  // Any other exported functions from our Rust modules
  [key: string]: any;
}
