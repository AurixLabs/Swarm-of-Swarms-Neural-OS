
export class TinyLlamaDebugger {
  private static logs: string[] = [];

  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] TinyLlama: ${message}`;
    console.log(logEntry, data || '');
    this.logs.push(logEntry);
  }

  static error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] TinyLlama ERROR: ${message}`;
    console.error(logEntry, error || '');
    this.logs.push(logEntry);
  }

  static getLogs(): string[] {
    return [...this.logs];
  }

  static clearLogs() {
    this.logs = [];
  }

  static async testWasmLoad(): Promise<boolean> {
    try {
      this.log('Testing WASM module availability...');
      
      // Check if WASM files exist
      const wasmPaths = [
        '/wasm/llama_bridge.wasm',
        '/wasm/hybrid_intelligence.wasm',
        '/wasm/reasoning_engine.wasm'
      ];

      for (const path of wasmPaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            this.log(`✅ WASM file found: ${path}`);
          } else {
            this.error(`❌ WASM file missing: ${path} (${response.status})`);
          }
        } catch (error) {
          this.error(`❌ Failed to check WASM file: ${path}`, error);
        }
      }

      return true;
    } catch (error) {
      this.error('WASM test failed', error);
      return false;
    }
  }
}
