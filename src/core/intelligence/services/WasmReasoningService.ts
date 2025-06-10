
import { BrowserEventEmitter } from '../../BrowserEventEmitter';
import { unifiedWasmLoader } from '../../wasm/UnifiedWasmLoader';

/**
 * Service responsible for managing the WASM-based reasoning engine
 * NO FALLBACKS - Either works or fails
 */
export class WasmReasoningService {
  private events: BrowserEventEmitter;
  
  constructor(events: BrowserEventEmitter) {
    this.events = events;
    this.initWasmEngine();
  }
  
  /**
   * Initialize WASM Reasoning Engine - NO FALLBACKS
   */
  private async initWasmEngine(): Promise<void> {
    try {
      const result = await unifiedWasmLoader.loadModule('reasoning_engine');
      
      if (!result.success) {
        throw new Error(`Failed to load reasoning engine: ${result.error}`);
      }
      
      console.log('✅ WASM Reasoning Engine initialized successfully');
      this.events.emit('intelligence:wasm-loaded', {
        component: 'reasoning-engine',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Failed to initialize WASM Reasoning Engine:', error);
      throw error; // NO FALLBACKS - FAIL HARD
    }
  }
  
  /**
   * Analyze context using the WASM engine - NO FALLBACKS
   */
  public async analyzeContext(context: any): Promise<any> {
    const module = unifiedWasmLoader.getModule('reasoning_engine');
    if (!module) {
      throw new Error('WASM Reasoning Engine not loaded - NO FALLBACKS AVAILABLE');
    }
    
    try {
      console.log('🧠 Using WASM Reasoning Engine for contextual analysis');
      const contextInput = typeof context === 'object' ? JSON.stringify(context) : context;
      const wasmResult = unifiedWasmLoader.execute('reasoning_engine', 'analyze', contextInput);
      
      return {
        timestamp: Date.now(),
        models: ['wasm-reasoning-engine'],
        analysis: wasmResult
      };
    } catch (error) {
      console.error('❌ Error in WASM reasoning engine:', error);
      throw error; // NO FALLBACKS
    }
  }
  
  /**
   * Check if the WASM engine is available
   */
  public isWasmEngineAvailable(): boolean {
    return unifiedWasmLoader.isLoaded('reasoning_engine');
  }
}

export const createWasmReasoningService = (events: BrowserEventEmitter) => {
  return new WasmReasoningService(events);
};
