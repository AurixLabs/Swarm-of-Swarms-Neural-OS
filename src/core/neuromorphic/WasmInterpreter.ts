
/**
 * WasmInterpreter - Handles the neuromorphic simulation for WASM micro-agents
 * This implements the spike-based neural network computation that Deep specified
 */

export interface SpikeNetConfig {
  inputSize: number;
  outputSize: number;
  hiddenSize: number;
  weights: Int8Array;
  thresholds: Uint16Array;
}

export class SpikeNetInterpreter {
  private config: SpikeNetConfig;
  private membrane: Float32Array;
  private spikes: Uint8Array;
  private refractoryCountdown: Uint8Array;
  
  constructor(config: SpikeNetConfig) {
    this.config = config;
    this.membrane = new Float32Array(config.inputSize + config.hiddenSize + config.outputSize);
    this.spikes = new Uint8Array(config.inputSize + config.hiddenSize + config.outputSize);
    this.refractoryCountdown = new Uint8Array(config.inputSize + config.hiddenSize + config.outputSize);
  }
  
  /**
   * Process input through the spiking neural network
   * Uses an efficient event-based approach similar to what Deep outlined
   */
  public process(input: Uint8Array): Uint8Array {
    // Reset state
    this.membrane.fill(0);
    this.spikes.fill(0);
    this.refractoryCountdown.fill(0);
    
    // Copy input to spike buffer
    for (let i = 0; i < Math.min(input.length, this.config.inputSize); i++) {
      this.spikes[i] = input[i] > 0 ? 1 : 0;
    }
    
    // Run for 10 timesteps (can be parameterized)
    const result = new Uint8Array(this.config.outputSize);
    for (let t = 0; t < 10; t++) {
      this.advanceTimestep();
      
      // Record output spikes
      for (let i = 0; i < this.config.outputSize; i++) {
        const outputIndex = this.config.inputSize + this.config.hiddenSize + i;
        if (this.spikes[outputIndex] > 0) {
          result[i] += 1; // Count spikes per output neuron
        }
      }
    }
    
    return result;
  }
  
  /**
   * Advance the network simulation by one timestep
   */
  private advanceTimestep(): void {
    // Update refractoryCountdown
    for (let i = 0; i < this.refractoryCountdown.length; i++) {
      if (this.refractoryCountdown[i] > 0) {
        this.refractoryCountdown[i]--;
      }
    }
    
    // Process spikes from input layer to hidden layer
    for (let i = 0; i < this.config.inputSize; i++) {
      if (this.spikes[i] > 0) {
        // For each spike in input layer
        for (let j = 0; j < this.config.hiddenSize; j++) {
          const hiddenIndex = this.config.inputSize + j;
          const weightIndex = i * this.config.hiddenSize + j;
          
          // Skip if neuron is in refractory period
          if (this.refractoryCountdown[hiddenIndex] > 0) continue;
          
          // Update membrane potential
          this.membrane[hiddenIndex] += this.config.weights[weightIndex];
        }
      }
    }
    
    // Process spikes from hidden layer to output layer
    for (let j = 0; j < this.config.hiddenSize; j++) {
      const hiddenIndex = this.config.inputSize + j;
      
      // Check if hidden neuron spikes
      if (this.membrane[hiddenIndex] >= this.config.thresholds[j]) {
        this.spikes[hiddenIndex] = 1;
        this.membrane[hiddenIndex] = 0; // Reset membrane potential
        this.refractoryCountdown[hiddenIndex] = 2; // Refractory period
        
        // Propagate spike to output layer
        for (let k = 0; k < this.config.outputSize; k++) {
          const outputIndex = this.config.inputSize + this.config.hiddenSize + k;
          const weightIndex = this.config.inputSize * this.config.hiddenSize + j * this.config.outputSize + k;
          
          // Skip if neuron is in refractory period
          if (this.refractoryCountdown[outputIndex] > 0) continue;
          
          // Update membrane potential
          this.membrane[outputIndex] += this.config.weights[weightIndex];
        }
      } else {
        this.spikes[hiddenIndex] = 0;
      }
    }
    
    // Check if output neurons spike
    for (let k = 0; k < this.config.outputSize; k++) {
      const outputIndex = this.config.inputSize + this.config.hiddenSize + k;
      
      if (this.membrane[outputIndex] >= this.config.thresholds[this.config.hiddenSize + k]) {
        this.spikes[outputIndex] = 1;
        this.membrane[outputIndex] = 0; // Reset membrane potential
        this.refractoryCountdown[outputIndex] = 2; // Refractory period
      } else {
        this.spikes[outputIndex] = 0;
      }
    }
  }
  
  /**
   * Get the current state of all neurons
   */
  public getNeuronState(): {
    membrane: Float32Array;
    spikes: Uint8Array;
    refractory: Uint8Array;
  } {
    return {
      membrane: new Float32Array(this.membrane),
      spikes: new Uint8Array(this.spikes),
      refractory: new Uint8Array(this.refractoryCountdown)
    };
  }
}

/**
 * Factory for creating SpikeNet interpreters with different configurations
 */
export class SpikeNetFactory {
  /**
   * Create a classifier network configuration
   */
  public static createClassifier(inputSize: number, outputSize: number): SpikeNetConfig {
    const hiddenSize = Math.min(32, inputSize * 2);
    
    // Create random weights and thresholds
    const weightsLength = inputSize * hiddenSize + hiddenSize * outputSize;
    const weights = new Int8Array(weightsLength);
    const thresholds = new Uint16Array(hiddenSize + outputSize);
    
    // Initialize with random values (quantized to 8 bits)
    for (let i = 0; i < weights.length; i++) {
      weights[i] = Math.floor(Math.random() * 256) - 128;
    }
    
    for (let i = 0; i < thresholds.length; i++) {
      thresholds[i] = Math.floor(Math.random() * 1000) + 1000;
    }
    
    return {
      inputSize,
      outputSize,
      hiddenSize,
      weights,
      thresholds
    };
  }
}
