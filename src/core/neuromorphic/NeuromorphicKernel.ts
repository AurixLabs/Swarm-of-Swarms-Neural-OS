
import { UniversalKernel } from '../UniversalKernel';
import { unifiedWasmLoader } from '../wasm/UnifiedWasmLoader';

export interface SpikeData {
  timestamp: number;
  neuronId: string;
  value: number;
}

export interface NeuromorphicConfig {
  spikeThreshold: number;
  timeWindow: number;
  neuronCount: number;
}

export class NeuromorphicKernel extends UniversalKernel {
  private config: NeuromorphicConfig;
  private isInitialized: boolean = false;
  private internalState: Record<string, any> = {};

  constructor() {
    super('neuromorphic', 'Neuromorphic Processing Kernel');
    
    this.config = {
      spikeThreshold: 0.7,
      timeWindow: 100,
      neuronCount: 1000
    };
  }

  setState(key: string, value: any): void {
    this.internalState[key] = value;
    console.log(`Neuromorphic Kernel state updated: ${key} = ${value}`);
  }

  getState(key: string): any {
    return this.internalState[key];
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🧠 Initializing Neuromorphic Kernel...');
      
      // Load the neuromorphic WASM module - NO FALLBACKS
      const result = await unifiedWasmLoader.loadModule('neuromorphic');
      
      if (!result.success) {
        throw new Error(`Failed to load neuromorphic module: ${result.error}`);
      }
      
      this.isInitialized = true;
      console.log('✅ Neuromorphic Kernel initialized with WASM module');
      this.setState('status', 'active');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Neuromorphic Kernel:', error);
      this.setState('status', 'error');
      this.setState('error', error instanceof Error ? error.message : 'Unknown error');
      throw error; // NO FALLBACKS - FAIL HARD
    }
  }

  processSpikes(spikes: SpikeData[]): SpikeData[] {
    if (!this.isInitialized) {
      throw new Error('Neuromorphic kernel not initialized - NO FALLBACKS AVAILABLE');
    }

    const module = unifiedWasmLoader.getModule('neuromorphic');
    if (!module) {
      throw new Error('Neuromorphic WASM module not loaded - NO FALLBACKS AVAILABLE');
    }

    try {
      const spikeBuffer = new Float32Array(spikes.length * 3);
      spikes.forEach((spike, i) => {
        spikeBuffer[i * 3] = spike.timestamp;
        spikeBuffer[i * 3 + 1] = parseInt(spike.neuronId, 16) || 0;
        spikeBuffer[i * 3 + 2] = spike.value;
      });

      const result = unifiedWasmLoader.execute('neuromorphic', 'process_spikes', spikeBuffer);
      const processedSpikes: SpikeData[] = [];
      
      for (let i = 0; i < result.length; i += 3) {
        processedSpikes.push({
          timestamp: result[i],
          neuronId: result[i + 1].toString(16),
          value: result[i + 2]
        });
      }
      
      return processedSpikes;
    } catch (error) {
      console.error('❌ Error processing spikes:', error);
      throw error; // NO FALLBACKS
    }
  }

  generateSpikes(count: number): SpikeData[] {
    const spikes: SpikeData[] = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      spikes.push({
        timestamp: now + Math.random() * 1000,
        neuronId: Math.floor(Math.random() * this.config.neuronCount).toString(16),
        value: Math.random()
      });
    }
    
    return spikes;
  }

  processInputData(data: any): SpikeData[] {
    if (typeof data === 'string') {
      const spikes: SpikeData[] = [];
      const now = Date.now();
      
      for (let i = 0; i < data.length; i++) {
        spikes.push({
          timestamp: now + i,
          neuronId: data.charCodeAt(i).toString(16),
          value: (data.charCodeAt(i) % 255) / 255
        });
      }
      
      return this.processSpikes(spikes);
    }
    
    throw new Error('Invalid input data type - NO FALLBACKS AVAILABLE');
  }

  configureSpikeThreshold(threshold: number): void {
    this.config.spikeThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`Neuromorphic spike threshold set to: ${this.config.spikeThreshold}`);
  }

  getNeuronStates(): Record<string, number> {
    const module = unifiedWasmLoader.getModule('neuromorphic');
    if (!module) {
      throw new Error('Neuromorphic WASM module not loaded - NO FALLBACKS AVAILABLE');
    }
    
    try {
      return unifiedWasmLoader.execute('neuromorphic', 'get_neuron_states');
    } catch (error) {
      console.error('❌ Error getting neuron states:', error);
      throw error; // NO FALLBACKS
    }
  }

  getMetrics() {
    return {
      ...super.getMetrics(),
      spikeThreshold: this.config.spikeThreshold,
      timeWindow: this.config.timeWindow,
      neuronCount: this.config.neuronCount,
      wasmAvailable: unifiedWasmLoader.isLoaded('neuromorphic')
    };
  }
}

export const neuromorphicKernel = new NeuromorphicKernel();
