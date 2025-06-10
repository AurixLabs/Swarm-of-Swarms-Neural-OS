
import { TinyLlamaDebugger } from './TinyLlamaDebugger';
import { TinyLlamaResponse } from './types';
import { WasmModuleLoader } from './WasmModuleLoader';
import { ReasoningProcessor } from './ReasoningProcessor';
import { NeuromorphicProcessor } from './NeuromorphicProcessor';

export class TinyLlamaWasmBridge {
  private wasmLoader: WasmModuleLoader;
  private reasoningProcessor: ReasoningProcessor;
  private neuromorphicProcessor: NeuromorphicProcessor;

  constructor() {
    this.wasmLoader = new WasmModuleLoader();
    this.reasoningProcessor = new ReasoningProcessor();
    this.neuromorphicProcessor = new NeuromorphicProcessor();
  }

  async initialize(): Promise<boolean> {
    try {
      TinyLlamaDebugger.log('Initializing TinyLlama WASM bridge...');

      const [wasmInitialized, reasoningInitialized, neuromorphicInitialized] = await Promise.all([
        this.wasmLoader.initialize(),
        this.reasoningProcessor.initialize(),
        this.neuromorphicProcessor.initialize()
      ]);

      return wasmInitialized;
    } catch (error) {
      TinyLlamaDebugger.error('❌ Failed to initialize TinyLlama WASM bridge:', error);
      return false;
    }
  }

  async processRequest(input: string): Promise<TinyLlamaResponse> {
    const startTime = Date.now();
    
    if (!this.wasmLoader.isModelLoaded()) {
      throw new Error('TinyLlama bridge not initialized or no model loaded - real WASM modules required');
    }

    try {
      TinyLlamaDebugger.log(`Processing request: "${input.substring(0, 50)}..."`);

      let response: string;
      let modelUsed: string;
      let spikingActivity: number[] = [];
      let reasoningSteps: string[] = [];

      // Process through neuromorphic brain if available
      if (this.neuromorphicProcessor.isInitialized()) {
        spikingActivity = await this.neuromorphicProcessor.processNeuromorphic(input);
      }

      // Process through advanced reasoning engine
      if (this.reasoningProcessor.isInitialized()) {
        const reasoning = await this.reasoningProcessor.processReasoning(input);
        reasoningSteps = reasoning.steps;
      }

      // Use real WASM model
      const wasmModule = this.wasmLoader.getModule();
      if (!wasmModule) {
        throw new Error('No WASM module loaded');
      }

      if (wasmModule.analyze) {
        const result = wasmModule.analyze(input);
        response = JSON.stringify(result);
        modelUsed = 'ReasoningEngine-WASM';
      } else if (wasmModule.generate_response) {
        response = wasmModule.generate_response(input);
        modelUsed = 'LlamaBridge-WASM';
      } else {
        throw new Error('WASM module loaded but no valid inference methods found');
      }

      const processingTime = Date.now() - startTime;
      
      TinyLlamaDebugger.log(`Real response generated in ${processingTime}ms using ${modelUsed}`);

      return {
        text: response,
        confidence: this.reasoningProcessor.isInitialized() ? 0.85 : 0.5,
        processingTime,
        modelUsed,
        spikingActivity,
        reasoningSteps
      };

    } catch (error) {
      TinyLlamaDebugger.error('Failed to process request with real models:', error);
      throw error;
    }
  }

  isModelLoaded(): boolean {
    return this.wasmLoader.isModelLoaded();
  }

  getStatus(): string {
    const wasmStatus = this.wasmLoader.getStatus();
    if (this.neuromorphicProcessor.isInitialized()) {
      return 'Neuromorphic Enhanced';
    }
    return wasmStatus;
  }
}
