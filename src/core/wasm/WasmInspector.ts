
export interface WasmImport {
  module: string;
  name: string;
  kind: string;
}

export interface WasmExport {
  name: string;
  kind: string;
}

export interface WasmAnalysis {
  filename: string;
  exists: boolean;
  isValidWasm: boolean;
  size?: number;
  imports: WasmImport[];
  exports: WasmExport[];
  error?: string;
  compilationDetails?: {
    magicNumber: string;
    version: string;
    hasMemory: boolean;
    memoryPages?: number;
  };
  filePreview?: string; // First few bytes as hex for debugging
}

class WasmInspector {
  private wasmFiles = [
    'reasoning_engine.wasm',  // Put the newly compiled one first
    'cma_neural_os.wasm',
    'neuromorphic.wasm', 
    'llama_bridge.wasm',
    'hybrid_intelligence.wasm',
    'fused_kernels.wasm'
  ];

  async inspectAllWasmFiles(): Promise<WasmAnalysis[]> {
    console.log('🔍 Inspecting WASM files (including newly compiled reasoning engine)...');
    
    const analyses: WasmAnalysis[] = [];
    
    for (const filename of this.wasmFiles) {
      const analysis = await this.inspectWasmFile(filename);
      analyses.push(analysis);
    }
    
    return analyses;
  }

  async inspectWasmFile(filename: string): Promise<WasmAnalysis> {
    const wasmPath = `/wasm/${filename}`;
    
    try {
      console.log(`🔍 Inspecting ${filename}...`);
      
      const response = await fetch(wasmPath);
      if (!response.ok) {
        return {
          filename,
          exists: false,
          isValidWasm: false,
          imports: [],
          exports: [],
          error: `File not found: ${response.status} ${response.statusText}`
        };
      }

      const wasmBytes = await response.arrayBuffer();
      
      if (wasmBytes.byteLength < 8) {
        return {
          filename,
          exists: true,
          isValidWasm: false,
          size: wasmBytes.byteLength,
          imports: [],
          exports: [],
          error: 'File too small to be valid WASM'
        };
      }

      // Get first 16 bytes as hex for debugging
      const firstBytes = new Uint8Array(wasmBytes.slice(0, 16));
      const filePreview = Array.from(firstBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');

      // Check WASM magic number and version
      const header = new Uint32Array(wasmBytes.slice(0, 8));
      const magicNumber = header[0];
      const version = header[1];
      
      if (magicNumber !== 0x6d736100) {
        return {
          filename,
          exists: true,
          isValidWasm: false,
          size: wasmBytes.byteLength,
          imports: [],
          exports: [],
          error: `Invalid WASM magic number: 0x${magicNumber.toString(16)} (expected 0x6d736100)`,
          filePreview,
          compilationDetails: {
            magicNumber: `0x${magicNumber.toString(16)}`,
            version: version.toString(),
            hasMemory: false
          }
        };
      }

      // Try to compile and analyze the WASM module
      let wasmModule: WebAssembly.Module;
      let imports: WebAssembly.ModuleImportDescriptor[] = [];
      let exports: WebAssembly.ModuleExportDescriptor[] = [];
      
      try {
        wasmModule = await WebAssembly.compile(wasmBytes);
        imports = WebAssembly.Module.imports(wasmModule);
        exports = WebAssembly.Module.exports(wasmModule);
      } catch (compileError) {
        return {
          filename,
          exists: true,
          isValidWasm: false,
          size: wasmBytes.byteLength,
          imports: [],
          exports: [],
          error: `WASM compilation failed: ${compileError instanceof Error ? compileError.message : 'Unknown compilation error'}`,
          filePreview,
          compilationDetails: {
            magicNumber: `0x${magicNumber.toString(16)}`,
            version: version.toString(),
            hasMemory: false
          }
        };
      }

      // Check if it has memory
      const hasMemory = exports.some(exp => exp.kind === 'memory') || 
                       imports.some(imp => imp.kind === 'memory');

      console.log(`✅ ${filename} is valid WASM with ${imports.length} imports, ${exports.length} exports`);

      // Special logging for reasoning engine
      if (filename === 'reasoning_engine.wasm') {
        console.log('🧠 Reasoning Engine Analysis:');
        console.log('  📥 Imports:', imports.map(imp => `${imp.module}.${imp.name}`));
        console.log('  📤 Exports:', exports.map(exp => exp.name));
        console.log('  🧠 Memory:', hasMemory ? 'Present' : 'Not found');
      }

      return {
        filename,
        exists: true,
        isValidWasm: true,
        size: wasmBytes.byteLength,
        imports: imports.map(imp => ({
          module: imp.module,
          name: imp.name,
          kind: imp.kind
        })),
        exports: exports.map(exp => ({
          name: exp.name,
          kind: exp.kind
        })),
        compilationDetails: {
          magicNumber: `0x${magicNumber.toString(16)}`,
          version: version.toString(),
          hasMemory,
          memoryPages: hasMemory ? 256 : undefined
        }
      };

    } catch (error) {
      console.error(`❌ Error inspecting ${filename}:`, error);
      return {
        filename,
        exists: true,
        isValidWasm: false,
        imports: [],
        exports: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  generateMissingImportsReport(analyses: WasmAnalysis[]): void {
    console.log('\n📋 WASM MODULE ANALYSIS REPORT');
    console.log('=====================================');

    // Special focus on reasoning engine
    const reasoningEngine = analyses.find(a => a.filename === 'reasoning_engine.wasm');
    if (reasoningEngine) {
      console.log(`\n🧠 REASONING ENGINE STATUS:`);
      if (reasoningEngine.isValidWasm) {
        console.log(`✅ ${reasoningEngine.filename} (${Math.round((reasoningEngine.size || 0) / 1024)}KB)`);
        console.log(`   Version: ${reasoningEngine.compilationDetails?.version}`);
        console.log(`   Memory: ${reasoningEngine.compilationDetails?.hasMemory ? 'Yes' : 'No'}`);
        
        if (reasoningEngine.imports.length > 0) {
          console.log('   📥 Required imports:');
          reasoningEngine.imports.forEach(imp => {
            console.log(`     - ${imp.module}.${imp.name} (${imp.kind})`);
          });
        }
        
        if (reasoningEngine.exports.length > 0) {
          console.log('   📤 Available exports:');
          reasoningEngine.exports.forEach(exp => {
            console.log(`     - ${exp.name} (${exp.kind})`);
          });
        }
      } else {
        console.log(`❌ ${reasoningEngine.filename}: ${reasoningEngine.error}`);
        if (reasoningEngine.filePreview) {
          console.log(`   📋 File preview (hex): ${reasoningEngine.filePreview}`);
        }
      }
    }

    // Report on other modules
    analyses.forEach(analysis => {
      if (analysis.filename === 'reasoning_engine.wasm') return; // Already handled above
      
      if (analysis.isValidWasm) {
        console.log(`\n✅ ${analysis.filename} (${Math.round((analysis.size || 0) / 1024)}KB)`);
        
        if (analysis.imports.length > 0) {
          console.log('  📥 Required imports:');
          analysis.imports.forEach(imp => {
            console.log(`    - ${imp.module}.${imp.name} (${imp.kind})`);
          });
        }
        
        if (analysis.exports.length > 0) {
          console.log('  📤 Available exports:');
          analysis.exports.forEach(exp => {
            console.log(`    - ${exp.name} (${exp.kind})`);
          });
        }
      } else {
        console.log(`\n❌ ${analysis.filename}: ${analysis.error}`);
      }
    });

    console.log('\n💡 Next steps:');
    console.log('1. Run the updated build script: ./build.sh');
    console.log('2. Check that reasoning_engine_bg.wasm is copied correctly');
    console.log('3. Verify the WASM magic number is 0x6d736100');
  }
}

export const wasmInspector = new WasmInspector();
