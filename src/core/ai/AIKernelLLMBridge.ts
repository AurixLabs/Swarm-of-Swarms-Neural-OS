
import { aiKernel } from '../AIKernel';
import { llmManager } from '../adapters/llm/LLMManager';
import { qwenAdapter } from '../adapters/llm/QwenAdapter';
import { LLMRequest } from '../adapters/llm/LLMAdapter';

/**
 * AIKernelLLMBridge connects the AI Kernel to the LLM Manager
 * This allows the AI Kernel to use any LLM adapter or operate independently
 */
export class AIKernelLLMBridge {
  private initialized = false;

  /**
   * Initialize the bridge
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      console.log('Initializing AIKernelLLMBridge');
      
      // Initialize the LLM Manager
      await llmManager.initialize();
      
      // Register the Qwen adapter if not already registered
      llmManager.registerAdapter(qwenAdapter);
      
      // Listen for LLM manager events
      llmManager.on('request-processed', (event) => {
        aiKernel.events.emitEvent({
          type: 'llm:request:processed',
          payload: event
        });
      });
      
      // Set initialization state
      aiKernel.setState('llm:bridge:status', 'ready');
      this.initialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize AIKernelLLMBridge:', error);
      aiKernel.setState('llm:bridge:status', 'failed');
      return false;
    }
  }
  
  /**
   * Process a request through the LLM Manager
   */
  public async process(request: LLMRequest): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      aiKernel.setState('llm:request:status', 'processing');
      
      const response = await llmManager.process(request);
      
      aiKernel.setState('llm:request:status', 'completed');
      aiKernel.setState('llm:request:last', {
        timestamp: Date.now(),
        success: true
      });
      
      return response;
    } catch (error) {
      console.error('Error in AIKernelLLMBridge.process:', error);
      
      aiKernel.setState('llm:request:status', 'error');
      aiKernel.setState('llm:request:last', {
        timestamp: Date.now(),
        success: false,
        error: String(error)
      });
      
      throw error;
    }
  }
  
  /**
   * Check if the bridge is healthy
   */
  public isHealthy(): boolean {
    return this.initialized && llmManager.canOperate();
  }
  
  /**
   * Get the currently preferred LLM adapter
   */
  public getPreferredAdapter(): string | null {
    return llmManager.getPreferredAdapter();
  }
  
  /**
   * Set the preferred LLM adapter
   */
  public setPreferredAdapter(adapterId: string): boolean {
    return llmManager.setPreferredAdapter(adapterId);
  }
  
  /**
   * List all available LLM adapters
   */
  public listAdapters(): any[] {
    return llmManager.listAdapters();
  }
}

// Create and export a singleton instance
export const aiKernelLLMBridge = new AIKernelLLMBridge();
export default aiKernelLLMBridge;
