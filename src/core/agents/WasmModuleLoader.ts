
import { TinyLlamaDebugger } from './TinyLlamaDebugger';
import { WasmModuleInterface } from './types';

export class WasmModuleLoader {
  private wasmModule: WasmModuleInterface | null = null;
  private isInitialized = false;
  private modelLoaded = false;

  async initialize(): Promise<boolean> {
    try {
      TinyLlamaDebugger.log('Initializing WASM module loader...');

      // Try loading our real compiled Rust modules in order of preference
      const modules = [
        { name: 'neuromorphic', path: '/wasm/neuromorphic.wasm' },
        { name: 'cma_neural_os', path: '/wasm/cma_neural_os.wasm' },
        { name: 'llama_bridge', path: '/wasm/llama_bridge.wasm' },
        { name: 'hybrid_intelligence', path: '/wasm/hybrid_intelligence.wasm' },
        { name: 'fused_kernels', path: '/wasm/fused_kernels.wasm' }
      ];

      for (const module of modules) {
        try {
          TinyLlamaDebugger.log(`Attempting to load ${module.name}...`);
          
          const response = await fetch(module.path);
          if (!response.ok) {
            throw new Error(`WASM module not found: ${response.status}`);
          }

          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            throw new Error(`WASM file is HTML (probably 404): ${module.path}`);
          }

          const wasmBytes = await response.arrayBuffer();
          
          if (wasmBytes.byteLength < 8) {
            throw new Error(`WASM file too small: ${wasmBytes.byteLength} bytes`);
          }

          // Check WASM magic number
          const magicNumber = new Uint32Array(wasmBytes.slice(0, 4))[0];
          if (magicNumber !== 0x6d736100) { // '\0asm' in little endian
            throw new Error(`Invalid WASM magic number: 0x${magicNumber.toString(16)}`);
          }
          
          // Create comprehensive imports for Rust-compiled WASM with wbindgen
          const imports = this.createWbindgenImports();

          const wasmInstance = await WebAssembly.instantiate(wasmBytes, imports);
          
          this.wasmModule = wasmInstance.instance.exports as WasmModuleInterface;
          this.isInitialized = true;
          this.modelLoaded = true;
          
          TinyLlamaDebugger.log(`✅ ${module.name} WASM loaded successfully`);
          
          // Try to initialize if the module has an init function
          if (this.wasmModule.initialize && typeof this.wasmModule.initialize === 'function') {
            try {
              this.wasmModule.initialize();
              TinyLlamaDebugger.log(`✅ ${module.name} WASM initialized`);
            } catch (initError) {
              TinyLlamaDebugger.log(`⚠️ ${module.name} WASM loaded but init failed:`, initError);
            }
          }
          
          return true;
        } catch (moduleError) {
          TinyLlamaDebugger.error(`❌ Failed to load ${module.name}:`, moduleError);
          continue;
        }
      }

      // All modules failed to load
      TinyLlamaDebugger.error('❌ All WASM modules failed to load');
      this.isInitialized = false;
      this.modelLoaded = false;
      return false;

    } catch (error) {
      TinyLlamaDebugger.error('❌ Failed to initialize WASM module loader:', error);
      this.isInitialized = false;
      return false;
    }
  }

  private createWbindgenImports(): any {
    // Create a text decoder for WASM string handling
    const textDecoder = new TextDecoder('utf-8');
    const textEncoder = new TextEncoder();
    
    return {
      wbg: {
        // String handling functions that wbindgen expects
        __wbindgen_string_new: (ptr: number, len: number) => {
          if (!this.wasmModule?.memory) return 0;
          const mem = new Uint8Array(this.wasmModule.memory.buffer);
          const str = textDecoder.decode(mem.slice(ptr, ptr + len));
          return str;
        },
        
        __wbg_log_1d3ae0273d8f4f8a: (ptr: number, len: number) => {
          if (!this.wasmModule?.memory) return;
          const mem = new Uint8Array(this.wasmModule.memory.buffer);
          const message = textDecoder.decode(mem.slice(ptr, ptr + len));
          console.log(`WASM Log: ${message}`);
        },
        
        __wbindgen_throw: (ptr: number, len: number) => {
          if (!this.wasmModule?.memory) {
            throw new Error('WASM Error: No memory');
          }
          const mem = new Uint8Array(this.wasmModule.memory.buffer);
          const message = textDecoder.decode(mem.slice(ptr, ptr + len));
          throw new Error(`WASM Error: ${message}`);
        },
        
        __wbindgen_rethrow: (ptr: number) => {
          throw new Error(`WASM Rethrow: ${ptr}`);
        },
        
        // CRITICAL: Add the missing externref_xform function that all our WASM files need
        __wbindgen_externref_xform__: (idx: number) => {
          // This function transforms external references for newer wbindgen versions
          return idx;
        },
        
        // Console functions
        __wbg_console_log: console.log,
        __wbg_console_error: console.error,
        __wbg_console_warn: console.warn,
      },
      
      env: {
        memory: new WebAssembly.Memory({ initial: 17, maximum: 256 })
      },
      
      // For modules that expect __wbindgen_placeholder__
      __wbindgen_placeholder__: {},
      
      // Additional imports that some Rust WASM modules might need
      imports: {
        imported_func: (arg: number) => {
          console.log(`WASM called imported_func with: ${arg}`);
          return arg;
        }
      }
    };
  }

  getModule(): WasmModuleInterface | null {
    return this.wasmModule;
  }

  isModelLoaded(): boolean {
    return this.modelLoaded;
  }

  getStatus(): string {
    if (!this.isInitialized) return 'Not Initialized';
    if (!this.modelLoaded) return 'No WASM Model Loaded';
    return 'WASM Model Loaded';
  }

  // Execute any WASM function safely
  executeFunction(functionName: string, ...args: any[]): any {
    if (!this.wasmModule) {
      throw new Error('WASM module not loaded');
    }

    const func = (this.wasmModule as any)[functionName];
    if (typeof func !== 'function') {
      throw new Error(`Function ${functionName} not found in WASM module`);
    }

    try {
      return func(...args);
    } catch (error) {
      TinyLlamaDebugger.error(`WASM function ${functionName} failed:`, error);
      throw error;
    }
  }
}
