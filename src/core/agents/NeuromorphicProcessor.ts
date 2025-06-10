
import { neuromorphicBrainInterface } from '../neuromorphic/NeuromorphicBrainInterface';
import { SpikePatternProcessor } from '../neuromorphic/SpikePatternProcessor';
import { TinyLlamaDebugger } from './TinyLlamaDebugger';

export class NeuromorphicProcessor {
  private spikeProcessor: SpikePatternProcessor;
  private initialized = false;

  constructor() {
    this.spikeProcessor = new SpikePatternProcessor();
  }

  async initialize(): Promise<boolean> {
    try {
      this.initialized = await neuromorphicBrainInterface.initialize();
      
      if (this.initialized) {
        TinyLlamaDebugger.log('✅ Neuromorphic brain interface initialized');
      } else {
        TinyLlamaDebugger.error('❌ Failed to initialize neuromorphic brain interface');
      }
      
      return this.initialized;
    } catch (error) {
      TinyLlamaDebugger.error('❌ Neuromorphic processor initialization failed:', error);
      return false;
    }
  }

  async processNeuromorphic(input: string): Promise<number[]> {
    if (!this.initialized) {
      throw new Error('Neuromorphic processor not initialized');
    }

    const inputSpikes = this.textToSpikePattern(input);
    const neuralResult = await neuromorphicBrainInterface.processCognitiveInput({
      type: 'text',
      data: inputSpikes,
      metadata: { source: 'tinyllama_input' }
    });
    
    return Array.from(neuralResult.output);
  }

  private textToSpikePattern(text: string): Uint8Array {
    const pattern = new Uint8Array(32);
    for (let i = 0; i < text.length && i < pattern.length; i++) {
      pattern[i] = text.charCodeAt(i) % 2;
    }
    return pattern;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
