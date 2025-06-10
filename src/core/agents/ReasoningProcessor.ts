
import { advancedAIReasoningEngine } from '../reasoning/AdvancedAIReasoningEngine';
import { TinyLlamaDebugger } from './TinyLlamaDebugger';

export class ReasoningProcessor {
  private initialized = false;

  async initialize(): Promise<boolean> {
    try {
      const reasoningInitialized = await advancedAIReasoningEngine.initialize();
      this.initialized = reasoningInitialized;
      
      if (reasoningInitialized) {
        TinyLlamaDebugger.log('✅ Advanced reasoning engine initialized');
      } else {
        TinyLlamaDebugger.error('❌ Failed to initialize advanced reasoning engine');
      }
      
      return reasoningInitialized;
    } catch (error) {
      TinyLlamaDebugger.error('❌ Reasoning processor initialization failed:', error);
      return false;
    }
  }

  async processReasoning(input: string): Promise<{ steps: string[]; confidence: number }> {
    if (!this.initialized) {
      throw new Error('Reasoning processor not initialized');
    }

    const reasoningContext = {
      id: `reasoning_${Date.now()}`,
      type: this.determineReasoningType(input),
      input: input,
      metadata: {
        priority: 'high',
        complexity: Math.min(10, Math.max(1, input.length / 20)),
        domain: 'general',
        timestamp: Date.now()
      }
    };

    const reasoningChain = await advancedAIReasoningEngine.processReasoningContext(reasoningContext);
    
    return {
      steps: reasoningChain.steps.map((step: any) => step.reasoning),
      confidence: reasoningChain.confidence || 0
    };
  }

  private determineReasoningType(input: string): 'analytical' | 'creative' | 'ethical' | 'strategic' {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('analyze') || inputLower.includes('explain') || inputLower.includes('how')) {
      return 'analytical';
    } else if (inputLower.includes('create') || inputLower.includes('generate') || inputLower.includes('imagine')) {
      return 'creative';
    } else if (inputLower.includes('right') || inputLower.includes('wrong') || inputLower.includes('should')) {
      return 'ethical';
    } else {
      return 'strategic';
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
