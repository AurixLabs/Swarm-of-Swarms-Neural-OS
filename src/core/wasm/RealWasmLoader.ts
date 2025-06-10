export interface RealWasmModule {
  memory?: WebAssembly.Memory;
  [key: string]: any;
}

export interface RealWasmLoadResult {
  success: boolean;
  module?: RealWasmModule;
  error?: string;
  size?: number;
  isReal: boolean;
  diagnostics?: {
    loadTime: number;
    magicNumberValid: boolean;
    functionsCount: number;
    memorySize?: number;
    fileHash?: string;
  };
}

export class RealWasmLoader {
  private static instance: RealWasmLoader;
  private loadedModules: Map<string, RealWasmModule> = new Map();
  private loadingPromises: Map<string, Promise<RealWasmLoadResult>> = new Map();
  private engineInstances: Map<string, any> = new Map();
  private loadAttempts: Map<string, number> = new Map();
  private lastLoadResults: Map<string, RealWasmLoadResult> = new Map();

  private constructor() {}

  static getInstance(): RealWasmLoader {
    if (!RealWasmLoader.instance) {
      RealWasmLoader.instance = new RealWasmLoader();
    }
    return RealWasmLoader.instance;
  }

  // Calculate a simple hash of the WASM bytes for consistency checking
  private calculateHash(bytes: ArrayBuffer): string {
    const uint8Array = new Uint8Array(bytes);
    let hash = 0;
    for (let i = 0; i < Math.min(uint8Array.length, 1000); i++) {
      hash = ((hash << 5) - hash + uint8Array[i]) & 0xffffffff;
    }
    return hash.toString(16);
  }

  async loadRealModule(moduleId: string): Promise<RealWasmLoadResult> {
    const startTime = Date.now();
    const attemptNumber = (this.loadAttempts.get(moduleId) || 0) + 1;
    this.loadAttempts.set(moduleId, attemptNumber);

    console.log(`🔥 [RealWASM] Load attempt #${attemptNumber} for ${moduleId}`);

    if (this.loadedModules.has(moduleId)) {
      const lastResult = this.lastLoadResults.get(moduleId);
      console.log(`✅ [RealWASM] ${moduleId} already cached (previous hash: ${lastResult?.diagnostics?.fileHash})`);
      return {
        success: true,
        module: this.loadedModules.get(moduleId)!,
        size: lastResult?.size || 0,
        isReal: true,
        diagnostics: {
          loadTime: Date.now() - startTime,
          magicNumberValid: true,
          functionsCount: Object.keys(this.loadedModules.get(moduleId)!).filter(k => typeof this.loadedModules.get(moduleId)![k] === 'function').length,
          fileHash: lastResult?.diagnostics?.fileHash
        }
      };
    }

    if (this.loadingPromises.has(moduleId)) {
      console.log(`⏳ [RealWASM] ${moduleId} already loading, waiting...`);
      return this.loadingPromises.get(moduleId)!;
    }

    const loadPromise = this.performRealLoad(moduleId, startTime, attemptNumber);
    this.loadingPromises.set(moduleId, loadPromise);
    
    const result = await loadPromise;
    this.loadingPromises.delete(moduleId);
    this.lastLoadResults.set(moduleId, result);
    
    return result;
  }

  private async performRealLoad(moduleId: string, startTime: number, attemptNumber: number): Promise<RealWasmLoadResult> {
    const wasmPath = `/wasm/${moduleId}.wasm`;
    
    try {
      console.log(`🔥 [RealWASM] Attempt #${attemptNumber} - Loading REAL ${moduleId} from: ${wasmPath}`);
      
      // Add cache-busting parameter for reliability
      const cacheBustingUrl = `${wasmPath}?t=${Date.now()}&attempt=${attemptNumber}`;
      const response = await fetch(cacheBustingUrl);
      
      console.log(`📡 [RealWASM] REAL ${moduleId} fetch response (attempt #${attemptNumber}):`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        cacheControl: response.headers.get('cache-control')
      });

      if (!response.ok) {
        throw new Error(`REAL WASM fetch failed (attempt #${attemptNumber}): ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      
      // Check if we're getting HTML instead of WASM
      if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
        const text = await response.text();
        const preview = text.substring(0, 200);
        console.error(`🚨 [RealWASM] Got HTML instead of WASM on attempt #${attemptNumber}! Preview:`, preview);
        throw new Error(`FAKE WASM DETECTED ON ATTEMPT #${attemptNumber}! Got ${contentType} instead of application/wasm.`);
      }

      const bytes = await response.arrayBuffer();
      const fileHash = this.calculateHash(bytes);
      console.log(`📦 [RealWASM] REAL ${moduleId} bytes: ${bytes.byteLength} bytes, hash: ${fileHash}`);

      // Check if we got HTML as binary (fallback detection)
      if (bytes.byteLength > 0) {
        const firstBytes = new Uint8Array(bytes.slice(0, 20));
        const text = new TextDecoder().decode(firstBytes);
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          console.error(`🚨 [RealWASM] Binary content is actually HTML on attempt #${attemptNumber}! First 20 bytes:`, text);
          throw new Error(`FAKE WASM DETECTED ON ATTEMPT #${attemptNumber}! Binary content is HTML`);
        }
      }

      // Validate REAL WASM magic number
      if (bytes.byteLength < 8) {
        throw new Error(`REAL WASM file too small on attempt #${attemptNumber}: ${bytes.byteLength} bytes`);
      }
      
      const magicBytes = new Uint8Array(bytes.slice(0, 4));
      const expectedMagic = [0x00, 0x61, 0x73, 0x6D]; // '\0asm'
      let magicNumberValid = true;
      
      for (let i = 0; i < 4; i++) {
        if (magicBytes[i] !== expectedMagic[i]) {
          magicNumberValid = false;
          throw new Error(`FAKE WASM MAGIC NUMBER ON ATTEMPT #${attemptNumber}! Expected [${expectedMagic.join(',')}], got [${Array.from(magicBytes).join(',')}]`);
        }
      }

      console.log(`⚙️ [RealWASM] Compiling REAL ${moduleId} WASM module (attempt #${attemptNumber})...`);
      const wasmModule = await WebAssembly.compile(bytes);
      
      const imports = WebAssembly.Module.imports(wasmModule);
      const exports = WebAssembly.Module.exports(wasmModule);
      
      console.log(`📋 [RealWASM] REAL ${moduleId} compilation successful (attempt #${attemptNumber}): ${imports.length} imports, ${exports.length} exports`);
      console.log(`📋 [RealWASM] Available exports:`, exports.map(exp => `${exp.name} (${exp.kind})`));

      // Create REAL imports for our Rust-compiled WASM
      const wasmImports = this.createRealImports(moduleId, imports);
      
      console.log(`🚀 [RealWASM] Instantiating REAL ${moduleId} module (attempt #${attemptNumber})...`);
      const wasmInstance = await WebAssembly.instantiate(bytes, wasmImports);
      const moduleExports = wasmInstance.instance.exports as RealWasmModule;

      // Count available functions for diagnostics
      const functionCount = Object.keys(moduleExports).filter(key => 
        typeof moduleExports[key] === 'function'
      ).length;
      console.log(`🧠 [RealWASM] Available functions in ${moduleId}: ${functionCount} total`);

      // For reasoning_engine, create an instance
      if (moduleId === 'reasoning_engine' && moduleExports.reasoningengine_new) {
        console.log(`🧠 [RealWASM] Creating ReasoningEngine instance (attempt #${attemptNumber})...`);
        const engineInstance = (moduleExports.reasoningengine_new as Function)();
        this.engineInstances.set(moduleId, engineInstance);
        console.log(`✅ [RealWASM] ReasoningEngine instance created with ID: ${engineInstance}`);
      }

      this.loadedModules.set(moduleId, moduleExports);
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ [RealWASM] REAL ${moduleId} loaded successfully on attempt #${attemptNumber} in ${loadTime}ms! HASH: ${fileHash}`);
      
      return {
        success: true,
        module: moduleExports,
        size: bytes.byteLength,
        isReal: true,
        diagnostics: {
          loadTime,
          magicNumberValid,
          functionsCount: functionCount,
          memorySize: moduleExports.memory ? moduleExports.memory.buffer.byteLength : undefined,
          fileHash
        }
      };

    } catch (error) {
      console.error(`❌ [RealWASM] REAL ${moduleId} load failed on attempt #${attemptNumber}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in REAL WASM loading',
        isReal: false,
        diagnostics: {
          loadTime: Date.now() - startTime,
          magicNumberValid: false,
          functionsCount: 0
        }
      };
    }
  }

  private createRealImports(moduleId: string, imports: WebAssembly.ModuleImportDescriptor[]): any {
    const textDecoder = new TextDecoder('utf-8');
    
    const wasmImports: any = {
      wbg: {},
      env: {
        memory: new WebAssembly.Memory({ initial: 17, maximum: 256 })
      },
      // CRITICAL: Add the missing __wbindgen_placeholder__ module that all WASM files expect
      __wbindgen_placeholder__: {},
      // CRITICAL: Add __wbindgen_externref_xform__ function that many modules need
      __wbindgen_externref_xform__: {}
    };

    imports.forEach(imp => {
      const { module: importModule, name: importName } = imp;
      
      if (importModule === 'wbg') {
        if (importName.includes('log')) {
          wasmImports.wbg[importName] = (ptr: number, len: number) => {
            const module = this.loadedModules.get(moduleId);
            if (module?.memory) {
              const mem = new Uint8Array(module.memory.buffer);
              const message = textDecoder.decode(mem.slice(ptr, ptr + len));
              console.log(`[REAL ${moduleId} WASM]:`, message);
            }
          };
        } else if (importName.includes('throw')) {
          wasmImports.wbg[importName] = (ptr: number, len: number) => {
            const module = this.loadedModules.get(moduleId);
            if (module?.memory) {
              const mem = new Uint8Array(module.memory.buffer);
              const message = textDecoder.decode(mem.slice(ptr, ptr + len));
              throw new Error(`REAL ${moduleId} WASM Error: ${message}`);
            }
            throw new Error(`REAL ${moduleId} WASM Error: ptr=${ptr}, len=${len}`);
          };
        } else if (importName.includes('externref')) {
          wasmImports.wbg[importName] = () => {
            console.log(`[REAL ${moduleId} WASM] Initializing externref table`);
          };
        } else {
          wasmImports.wbg[importName] = (...args: any[]) => {
            console.log(`[REAL ${moduleId} WASM] Called ${importName} with args:`, args);
          };
        }
      } else if (importModule === '__wbindgen_placeholder__') {
        // Handle any placeholder-specific imports
        wasmImports.__wbindgen_placeholder__[importName] = (...args: any[]) => {
          console.log(`[REAL ${moduleId} WASM] Placeholder function ${importName} called with:`, args);
          return 0; // Return safe default for most WASM functions
        };
      } else if (importModule === '__wbindgen_externref_xform__') {
        // Handle externref transform functions
        wasmImports.__wbindgen_externref_xform__[importName] = (...args: any[]) => {
          console.log(`[REAL ${moduleId} WASM] Externref xform ${importName} called with:`, args);
          return null; // Return safe default for externref functions
        };
      }
    });

    console.log(`🔧 [RealWASM] Created REAL imports for ${moduleId}: wbg(${Object.keys(wasmImports.wbg).length}), placeholder(${Object.keys(wasmImports.__wbindgen_placeholder__).length}), externref(${Object.keys(wasmImports.__wbindgen_externref_xform__).length})`);
    return wasmImports;
  }

  executeReal(moduleId: string, functionName: string, ...args: any[]): any {
    const module = this.loadedModules.get(moduleId);
    if (!module) {
      throw new Error(`REAL Module ${moduleId} not loaded - LOAD ATTEMPTS: ${this.loadAttempts.get(moduleId) || 0}`);
    }

    const lastResult = this.lastLoadResults.get(moduleId);
    console.log(`🔥 [RealWASM] Executing ${moduleId}.${functionName} - File hash: ${lastResult?.diagnostics?.fileHash}, Functions available: ${lastResult?.diagnostics?.functionsCount}`);

    // For reasoning_engine, use the instance methods properly
    if (moduleId === 'reasoning_engine') {
      const engineInstance = this.engineInstances.get(moduleId);
      
      // Try instance method with proper parameter passing
      if (engineInstance !== undefined) {
        const instanceMethod = module[`reasoningengine_${functionName}`];
        if (typeof instanceMethod === 'function') {
          console.log(`🔥 [RealWASM] Executing REAL ${moduleId}.${functionName} on instance ${engineInstance} (hash: ${lastResult?.diagnostics?.fileHash})`);
          
          // Convert string arguments to WASM-compatible format if needed
          const processedArgs = args.map(arg => {
            if (typeof arg === 'string') {
              // For string arguments, we may need to handle them specially
              return arg;
            }
            return arg;
          });
          
          const result = instanceMethod(engineInstance, ...processedArgs);
          console.log(`✅ [RealWASM] REAL ${moduleId}.${functionName} executed successfully!`);
          return result;
        }
      }

      // Try direct function call
      const directFunction = module[functionName];
      if (typeof directFunction === 'function') {
        console.log(`🔥 [RealWASM] Executing REAL ${moduleId}.${functionName} directly (hash: ${lastResult?.diagnostics?.fileHash})`);
        const result = directFunction(...args);
        console.log(`✅ [RealWASM] REAL ${moduleId}.${functionName} executed successfully!`);
        return result;
      }

      const availableFunctions = Object.keys(module).filter(key => 
        typeof module[key] === 'function'
      );
      throw new Error(`REAL Function '${functionName}' not found in ${moduleId}. REAL Available: ${availableFunctions.join(', ')}`);
    }

    // Regular module function execution
    const func = module[functionName];
    if (typeof func !== 'function') {
      const availableFunctions = Object.keys(module).filter(key => 
        typeof module[key] === 'function'
      );
      throw new Error(`REAL Function '${functionName}' not found in ${moduleId}. REAL Available: ${availableFunctions.join(', ')}`);
    }

    console.log(`🔥 [RealWASM] Executing REAL ${moduleId}.${functionName}(${args.length} args) - hash: ${lastResult?.diagnostics?.fileHash}`);
    const result = func(...args);
    console.log(`✅ [RealWASM] REAL ${moduleId}.${functionName} executed successfully!`);
    return result;
  }

  isRealModuleLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId);
  }

  getRealModule(moduleId: string): RealWasmModule | null {
    return this.loadedModules.get(moduleId) || null;
  }

  // New diagnostic method
  getDiagnostics(moduleId: string): any {
    const lastResult = this.lastLoadResults.get(moduleId);
    const attempts = this.loadAttempts.get(moduleId) || 0;
    
    return {
      moduleId,
      isLoaded: this.isRealModuleLoaded(moduleId),
      loadAttempts: attempts,
      lastResult: lastResult?.diagnostics,
      lastError: lastResult?.error
    };
  }
}

export const realWasmLoader = RealWasmLoader.getInstance();
