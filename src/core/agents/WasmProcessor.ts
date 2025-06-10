
import { unifiedWasmLoader } from '../wasm/UnifiedWasmLoader';

export interface WasmProcessingResult {
  success: boolean;
  result?: any;
  reasoningSteps: string[];
  realProcessing: boolean;
}

export class WasmProcessor {
  static async processWithWasm(
    input: string,
    loadedModules: Set<string>,
    agentId: string
  ): Promise<WasmProcessingResult> {
    const reasoningSteps: string[] = [];
    let realProcessing = false;

    const loadedModuleIds = Array.from(loadedModules);
    
    if (loadedModuleIds.length > 0) {
      reasoningSteps.push(`✅ ${loadedModuleIds.length} WASM modules available: ${loadedModuleIds.join(', ')}`);
      
      // Try reasoning engine first
      if (loadedModules.has('reasoning_engine')) {
        reasoningSteps.push('🧠 Using reasoning engine for processing');
        
        try {
          const result = await this.tryReasoningEngine(input);
          if (result.success) {
            reasoningSteps.push('✅ Reasoning engine executed successfully');
            return {
              success: true,
              result: result.data,
              reasoningSteps,
              realProcessing: true
            };
          } else {
            reasoningSteps.push('⚠️ Reasoning engine execution failed');
          }
        } catch (error) {
          console.warn(`⚠️ [${agentId}] Reasoning engine failed:`, error);
          reasoningSteps.push('⚠️ WASM execution failed, using available modules');
        }
      }
    } else {
      reasoningSteps.push('⚠️ No WASM modules loaded, using fallback mode - THIS IS NOT REAL AI!');
    }

    return {
      success: false,
      reasoningSteps,
      realProcessing
    };
  }

  private static async tryReasoningEngine(input: string): Promise<{ success: boolean; data?: any }> {
    const possibleFunctionNames = ['analyze', 'reasoning_analyze', 'reasoningengine_analyze', 'process'];
    
    for (const funcName of possibleFunctionNames) {
      try {
        const result = unifiedWasmLoader.execute('reasoning_engine', funcName, input);
        return { success: true, data: result };
      } catch (funcError) {
        console.log(`⚠️ reasoning_engine.${funcName} failed, trying next`);
        continue;
      }
    }
    
    return { success: false };
  }

  static generateSpikingPattern(input: string): number[] {
    const length = Math.min(50, input.length);
    const pattern: number[] = [];
    
    for (let i = 0; i < length; i++) {
      const spike = Math.exp(-i / 10) * Math.random();
      pattern.push(spike > 0.4 ? 1 : 0);
    }
    
    return pattern;
  }
}
