
import { AIModule } from '../AIKernel';
import { AIKernel } from '../AIKernel';

/**
 * AI module that provides edge function capabilities to the AI kernel
 * NO FALLBACKS - Either real edge functions work or they fail
 */
export class EdgeFunctionModule implements AIModule {
  id = 'ai-edge-functions';
  name = 'AI Edge Functions';
  version = '1.0.0';
  
  private kernel: AIKernel | null = null;
  
  /**
   * Initialize the module - NO FALLBACKS
   */
  initialize(kernel: AIKernel): void {
    this.kernel = kernel;
    console.log('EdgeFunctionModule initialized - NO FALLBACKS AVAILABLE');
    
    kernel.events.onEvent('INTENT_ANALYZED', this.handleIntent);
  }
  
  /**
   * Handle AI intent events - NO FALLBACKS
   */
  private handleIntent = async (payload: any): Promise<void> => {
    if (!this.kernel) {
      throw new Error('Kernel not initialized - NO FALLBACKS AVAILABLE');
    }
    
    if (payload.intent === 'process_document') {
      throw new Error('Real document processing not implemented - NO FALLBACKS, NO MOCK DATA');
    }
  };
  
  /**
   * Call a function directly - NO FALLBACKS
   */
  async callFunction<T = any>(functionName: string, params: Record<string, any> = {}): Promise<T | null> {
    throw new Error(`Real edge function ${functionName} not implemented - NO FALLBACKS, NO MOCK DATA`);
  }
  
  /**
   * Clean up when the module is destroyed
   */
  destroy(): void {
    this.kernel = null;
  }
}
