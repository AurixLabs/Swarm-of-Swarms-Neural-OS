
import { WasmDebugger } from './WasmDebugger';
import { WasmImportCreator } from './WasmImportCreator';
import { WASM_MODULE_PATHS, getWasmPath, type WasmModuleId } from './WasmPathConstants';

export interface WasmModule {
  memory?: WebAssembly.Memory;
  [key: string]: any;
}

export interface WasmLoadResult {
  success: boolean;
  module?: WasmModule;
  error?: string;
  size?: number;
  analysis?: {
    imports: number;
    exports: number;
    validWasm: boolean;
  };
}

export class UnifiedWasmLoader {
  private static instance: UnifiedWasmLoader;
  private loadedModules: Map<string, WasmModule> = new Map();
  private loadingPromises: Map<string, Promise<WasmLoadResult>> = new Map();
  private moduleInstances: Map<string, any> = new Map();
  private moduleMemories: Map<string, WebAssembly.Memory> = new Map();

  private constructor() {}

  static getInstance(): UnifiedWasmLoader {
    if (!UnifiedWasmLoader.instance) {
      UnifiedWasmLoader.instance = new UnifiedWasmLoader();
    }
    return UnifiedWasmLoader.instance;
  }

  async loadModule(moduleId: string, wasmPath?: string): Promise<WasmLoadResult> {
    // Use standardized path if no custom path provided
    const path = wasmPath || getWasmPath(moduleId as WasmModuleId) || `/wasm/${moduleId}.wasm`;
    WasmDebugger.logModuleAttempt(moduleId, path);
    
    if (this.loadedModules.has(moduleId)) {
      return {
        success: true,
        module: this.loadedModules.get(moduleId)!,
        size: 0
      };
    }

    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId)!;
    }

    const loadPromise = this.performLoad(moduleId, path);
    this.loadingPromises.set(moduleId, loadPromise);
    
    const result = await loadPromise;
    this.loadingPromises.delete(moduleId);
    
    return result;
  }

  private async performLoad(moduleId: string, wasmPath: string): Promise<WasmLoadResult> {
    try {
      const response = await fetch(wasmPath);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
        throw new Error(`Server returned ${contentType} instead of WASM binary`);
      }

      const bytes = await response.arrayBuffer();
      
      if (bytes.byteLength < 8) {
        throw new Error(`File too small: ${bytes.byteLength} bytes`);
      }
      
      // Validate WASM magic number
      const firstBytes = new Uint8Array(bytes.slice(0, 4));
      const expectedMagic = [0x00, 0x61, 0x73, 0x6D];
      const actualMagic = Array.from(firstBytes);
      
      if (JSON.stringify(actualMagic) !== JSON.stringify(expectedMagic)) {
        throw new Error(`Invalid WASM magic: [${actualMagic.map(b => `0x${b.toString(16)}`).join(',')}]`);
      }

      // Compile and analyze
      const wasmModule = await WebAssembly.compile(bytes);
      const imports = WebAssembly.Module.imports(wasmModule);
      const exports = WebAssembly.Module.exports(wasmModule);

      // Create shared memory for this module
      const memory = new WebAssembly.Memory({ initial: 17, maximum: 256 });
      this.moduleMemories.set(moduleId, memory);

      // Create proper imports with shared memory
      const wasmImports = this.createProperImports(moduleId, imports, memory);
      
      // Instantiate
      const wasmInstance = await WebAssembly.instantiate(bytes, wasmImports);
      const moduleExports = wasmInstance.instance.exports as WasmModule;

      // Store the memory reference in the module exports for access
      moduleExports.memory = memory;

      // For reasoning_engine, create an instance using the correct constructor function
      if (moduleId === 'reasoning_engine' && moduleExports.reasoningengine_new) {
        const engineInstance = moduleExports.reasoningengine_new();
        this.moduleInstances.set(moduleId, engineInstance);
        console.log('🧠 Created ReasoningEngine instance via reasoningengine_new()');
      }

      // Cache the module
      this.loadedModules.set(moduleId, moduleExports);
      
      const exportNames = exports.map(e => e.name);
      WasmDebugger.logModuleSuccess(moduleId, bytes.byteLength, exportNames);
      
      return {
        success: true,
        module: moduleExports,
        size: bytes.byteLength,
        analysis: {
          imports: imports.length,
          exports: exports.length,
          validWasm: true
        }
      };

    } catch (error) {
      WasmDebugger.logModuleError(moduleId, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private createProperImports(moduleId: string, imports: WebAssembly.ModuleImportDescriptor[], memory: WebAssembly.Memory): any {
    // Create text decoder/encoder for proper string handling
    const textDecoder = new TextDecoder('utf-8');
    const textEncoder = new TextEncoder();
    
    return {
      wbg: {
        // Console logging with proper memory access using shared memory
        __wbg_log_1d3ae0273d8f4f8a: (ptr: number, len: number) => {
          try {
            const mem = new Uint8Array(memory.buffer);
            const message = textDecoder.decode(mem.slice(ptr, ptr + len));
            console.log(`🔥 WASM Log: ${message}`);
          } catch (error) {
            console.error('WASM log error:', error);
          }
        },
        
        __wbindgen_throw: (ptr: number, len: number) => {
          try {
            const mem = new Uint8Array(memory.buffer);
            const message = textDecoder.decode(mem.slice(ptr, ptr + len));
            throw new Error(`WASM Error: ${message}`);
          } catch (error) {
            throw new Error(`WASM Error: Unable to decode error message at ptr=${ptr}, len=${len}`);
          }
        },
        
        __wbindgen_rethrow: (ptr: number) => {
          throw new Error(`WASM Rethrow: ${ptr}`);
        },
        
        // Memory allocation functions - use simple pointer arithmetic
        __wbindgen_malloc: (size: number) => {
          // Return a safe offset in the memory
          return 1024;
        },
        
        __wbindgen_free: (ptr: number, size: number) => {
          // Free simulation - in real implementation this would manage heap
        },
        
        // External reference handling
        __wbindgen_externref_xform__: (idx: number) => {
          return idx;
        },
        
        // Console functions
        __wbg_console_log: console.log,
        __wbg_console_error: console.error,
        __wbg_console_warn: console.warn,
      },
      
      env: {
        memory: memory  // Use the shared memory
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

  getModule(moduleId: string): WasmModule | null {
    return this.loadedModules.get(moduleId) || null;
  }

  isLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId);
  }

  execute(moduleId: string, functionName: string, ...args: any[]): any {
    WasmDebugger.logFunctionCall(moduleId, functionName, args);
    
    const module = this.loadedModules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not loaded`);
    }

    // For reasoning_engine, use the instantiated ReasoningEngine object with correct function names
    if (moduleId === 'reasoning_engine' && this.moduleInstances.has(moduleId)) {
      const instance = this.moduleInstances.get(moduleId);
      
      // Map function names to the actual exported function names
      let actualFunctionName = functionName;
      if (functionName === 'analyze') {
        actualFunctionName = 'reasoningengine_analyze';
      } else if (functionName === 'generate_text') {
        // For now, use analyze since generate_text isn't exported
        actualFunctionName = 'reasoningengine_analyze';
      } else if (functionName === 'process_context') {
        actualFunctionName = 'reasoningengine_process_context';
      } else if (functionName === 'is_ready') {
        actualFunctionName = 'reasoningengine_is_ready';
      }
      
      const instanceMethod = module[actualFunctionName];
      
      if (typeof instanceMethod === 'function') {
        const result = instanceMethod.call(instance, ...args);
        WasmDebugger.logFunctionResult(moduleId, functionName, result);
        return result;
      } else {
        const availableFunctions = Object.keys(module).filter(key => 
          typeof module[key] === 'function' && key.startsWith('reasoningengine_')
        );
        throw new Error(`Method '${actualFunctionName}' not found. Available reasoning functions: ${availableFunctions.join(', ')}`);
      }
    }

    // Direct function call for other modules
    const func = module[functionName];
    if (typeof func !== 'function') {
      const availableFunctions = Object.keys(module).filter(key => 
        typeof module[key] === 'function'
      );
      throw new Error(`Function '${functionName}' not found. Available: ${availableFunctions.slice(0, 5).join(', ')}`);
    }

    const result = func(...args);
    WasmDebugger.logFunctionResult(moduleId, functionName, result);
    return result;
  }

  unload(moduleId: string): void {
    this.loadedModules.delete(moduleId);
    this.loadingPromises.delete(moduleId);
    this.moduleInstances.delete(moduleId);
    this.moduleMemories.delete(moduleId);
    console.log(`🗑️ [UnifiedWASM] ${moduleId} unloaded`);
  }

  getLoadedModules(): string[] {
    return Array.from(this.loadedModules.keys());
  }
}

export const unifiedWasmLoader = UnifiedWasmLoader.getInstance();
