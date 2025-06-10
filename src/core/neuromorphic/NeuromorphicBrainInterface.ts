import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { neuromorphicKernel } from './NeuromorphicKernel';
import { 
  NeuralInputType, 
  NeuromorphicResult, 
  ProcessingOptions, 
  STDPConfig, 
  STDPLearningRule, 
  STDPModulation, 
  AdvancedLearningParams 
} from './types';

/**
 * Advanced Neuromorphic Brain Interface
 * Provides sophisticated spike-based neural processing with biological realism
 */
export class NeuromorphicBrainInterface extends BrowserEventEmitter {
  private initialized = false;
  private connectedAgents: Set<string> = new Set();
  private learningEnabled = true;
  private membraneState: Float32Array;
  private metrics = {
    patternCount: 0,
    lastActivityAge: 0,
    averagePotential: 0,
    learningStrength: 0.5
  };

  constructor() {
    super();
    this.membraneState = new Float32Array(1000);
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing Neuromorphic Brain Interface...');
      
      // Initialize the underlying neuromorphic kernel
      const kernelInitialized = await neuromorphicKernel.initialize();
      if (!kernelInitialized) {
        throw new Error('Failed to initialize neuromorphic kernel');
      }

      // Initialize membrane potentials
      for (let i = 0; i < this.membraneState.length; i++) {
        this.membraneState[i] = -70 + Math.random() * 10; // Resting potential with noise
      }

      this.initialized = true;
      this.emit('brain:initialized');
      
      console.log('Neuromorphic Brain Interface initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Brain Interface:', error);
      return false;
    }
  }

  async processCognitiveInput(
    input: NeuralInputType, 
    options?: ProcessingOptions
  ): Promise<NeuromorphicResult> {
    if (!this.initialized) {
      throw new Error('Brain Interface not initialized');
    }

    const startTime = performance.now();
    
    // Process through neuromorphic kernel with brain-specific enhancements
    const result = await neuromorphicKernel.process(input.data, options);
    
    // Update membrane state based on processing
    this.updateMembraneState(result.output as number[]);
    
    // Update metrics
    this.updateMetrics();
    
    const endTime = performance.now();
    
    // Enhance result with brain-specific metadata
    const enhancedResult: NeuromorphicResult = {
      ...result,
      latency: endTime - startTime,
      metadata: {
        ...result.metadata,
        membraneActivity: this.getMembraneActivity(),
        connectedAgents: this.connectedAgents.size,
        learningEnabled: this.learningEnabled
      }
    };

    this.emit('brain:processed', enhancedResult);
    return enhancedResult;
  }

  connectAgent(agentId: string): boolean {
    if (this.connectedAgents.has(agentId)) {
      return false; // Already connected
    }
    
    this.connectedAgents.add(agentId);
    this.emit('brain:agent:connected', { agentId });
    console.log(`Agent ${agentId} connected to neuromorphic brain`);
    return true;
  }

  disconnectAgent(agentId: string): boolean {
    if (!this.connectedAgents.has(agentId)) {
      return false; // Not connected
    }
    
    this.connectedAgents.delete(agentId);
    this.emit('brain:agent:disconnected', { agentId });
    console.log(`Agent ${agentId} disconnected from neuromorphic brain`);
    return true;
  }

  getConnectedAgents(): string[] {
    return Array.from(this.connectedAgents);
  }

  setLearningEnabled(enabled: boolean): void {
    this.learningEnabled = enabled;
    this.emit('brain:learning:toggled', { enabled });
  }

  setSTDPConfig(config: STDPConfig): void {
    neuromorphicKernel.setSTDPConfig(config);
    this.emit('brain:stdp:updated', config);
  }

  setAdvancedLearningParams(params: AdvancedLearningParams): void {
    // Update learning parameters - this would integrate with the neuromorphic kernel
    this.metrics.learningStrength = this.calculateLearningStrength(params);
    this.emit('brain:learning:updated', params);
  }

  private updateMembraneState(output: number[]): void {
    for (let i = 0; i < Math.min(output.length, this.membraneState.length); i++) {
      // Update membrane potential based on neural output
      this.membraneState[i] = this.membraneState[i] * 0.95 + output[i] * 10;
      
      // Keep within biological bounds
      this.membraneState[i] = Math.max(-90, Math.min(30, this.membraneState[i]));
    }
  }

  private updateMetrics(): void {
    const networkState = neuromorphicKernel.getNeuralNetworkState();
    
    this.metrics = {
      patternCount: this.metrics.patternCount + 1,
      lastActivityAge: 0, // Just processed
      averagePotential: Array.from(networkState).reduce((sum, val) => sum + val, 0) / networkState.length,
      learningStrength: this.metrics.learningStrength
    };
  }

  private getMembraneActivity(): number {
    const avgPotential = Array.from(this.membraneState).reduce((sum, val) => sum + val, 0) / this.membraneState.length;
    return Math.abs(avgPotential + 70) / 100; // Normalize relative to resting potential
  }

  private calculateLearningStrength(params: AdvancedLearningParams): number {
    let strength = 0.5; // Base strength
    
    // Modulate based on neuromodulators
    strength += params.modulation.dopamine * 0.3; // Reward enhances learning
    strength += params.modulation.acetylcholine * 0.2; // Attention enhances learning
    strength += params.modulation.norepinephrine * 0.1; // Novelty enhances learning
    
    // Advanced plasticity features
    if (params.heterosynapticEnabled) strength += 0.1;
    if (params.metaplasticityEnabled) strength += 0.1;
    if (params.structuralPlasticityEnabled) strength += 0.1;
    
    return Math.min(1.0, strength);
  }

  getMembraneState(): Float32Array {
    return this.membraneState.slice(); // Return copy
  }

  getMetrics() {
    return { ...this.metrics };
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const neuromorphicBrainInterface = new NeuromorphicBrainInterface();
