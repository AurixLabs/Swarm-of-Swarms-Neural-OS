
export class WasmDebugger {
  static logModuleAttempt(moduleId: string, path: string) {
    console.log(`🔍 [WASM] Attempting to load ${moduleId} from ${path}`);
  }
  
  static logModuleSuccess(moduleId: string, size: number, exports: string[]) {
    console.log(`✅ [WASM] ${moduleId} loaded successfully`);
    console.log(`📊 [WASM] Size: ${size} bytes, Exports: ${exports.length}`);
    console.log(`🔧 [WASM] Available functions: ${exports.filter(e => e.includes('function')).slice(0, 5).join(', ')}`);
  }
  
  static logModuleError(moduleId: string, error: any) {
    console.error(`❌ [WASM] ${moduleId} failed:`, error);
    
    if (error.message?.includes('404')) {
      console.log(`💡 [WASM] ${moduleId}: File not found - run build script?`);
    } else if (error.message?.includes('magic number')) {
      console.log(`💡 [WASM] ${moduleId}: Invalid WASM file - check compilation?`);
    } else if (error.message?.includes('import')) {
      console.log(`💡 [WASM] ${moduleId}: Import mismatch - check wbindgen version?`);
    }
  }
  
  static logFunctionCall(moduleId: string, functionName: string, args: any[]) {
    console.log(`🎯 [WASM] Calling ${moduleId}.${functionName}(${args.length} args)`);
  }
  
  static logFunctionResult(moduleId: string, functionName: string, result: any) {
    console.log(`✅ [WASM] ${moduleId}.${functionName}() returned:`, typeof result, result);
  }
}
