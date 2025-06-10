/**
 * SpikingNeuron
 * 
 * Implements a biologically-inspired spiking neuron model
 * following the leaky integrate-and-fire (LIF) paradigm
 */
export interface SpikingNeuronParams {
  id: string;
  threshold: number;
  restingPotential: number;
  refractoryPeriod: number;
  decayRate: number;
  leakRate: number;
}

export class SpikingNeuron {
  public id: string;
  private threshold: number;
  private membrane: number;
  private restingPotential: number;
  private refractoryPeriod: number;
  private refractoryCountdown: number;
  private decayRate: number;
  private leakRate: number;
  private inputConnections: Map<string, number>;
  private inhibitoryConnections: Map<string, number>;
  private hasSpikeFired: boolean;
  private lastSpikeTime: number;
  private spikeTrain: boolean[];
  private excitabilityFactor: number;
  
  constructor(params: SpikingNeuronParams) {
    this.id = params.id;
    this.threshold = params.threshold;
    this.membrane = params.restingPotential;
    this.restingPotential = params.restingPotential;
    this.refractoryPeriod = params.refractoryPeriod;
    this.refractoryCountdown = 0;
    this.decayRate = params.decayRate;
    this.leakRate = params.leakRate;
    this.inputConnections = new Map();
    this.inhibitoryConnections = new Map();
    this.hasSpikeFired = false;
    this.lastSpikeTime = 0;
    this.spikeTrain = [];
    this.excitabilityFactor = 1.0;
  }
  
  /**
   * Add an excitatory connection from another neuron
   */
  public addInputConnection(sourceId: string, weight: number): void {
    this.inputConnections.set(sourceId, weight);
  }
  
  /**
   * Add an inhibitory connection from another neuron
   */
  public addInhibitoryConnection(sourceId: string, weight: number): void {
    this.inhibitoryConnections.set(sourceId, weight);
  }
  
  /**
   * Receive a spike from a presynaptic neuron
   */
  public receiveSpike(intensity: number = 1, sourceId: string = ''): void {
    if (this.refractoryCountdown > 0) {
      return; // Neuron is in refractory period and cannot receive spikes
    }
    
    if (sourceId && this.inhibitoryConnections.has(sourceId)) {
      // Inhibitory input decreases membrane potential
      const weight = this.inhibitoryConnections.get(sourceId) || 0;
      this.membrane -= intensity * weight;
      
      // Ensure membrane potential doesn't go too far below resting
      this.membrane = Math.max(this.membrane, this.restingPotential - 20);
    } else if (!sourceId || this.inputConnections.has(sourceId)) {
      // Excitatory input increases membrane potential
      const weight = sourceId ? (this.inputConnections.get(sourceId) || 0) : 1.0;
      
      // Apply excitability modulation
      this.membrane += intensity * weight * this.excitabilityFactor;
    }
  }
  
  /**
   * Update the neuron state
   */
  public update(): void {
    // Reset spike status for this time step
    this.hasSpikeFired = false;
    
    // Decrement refractory period if active
    if (this.refractoryCountdown > 0) {
      this.refractoryCountdown--;
      return;
    }
    
    // Check if membrane potential exceeds threshold
    if (this.membrane >= this.threshold) {
      this.fire();
    } else {
      // Apply leak current - membrane potential gradually returns to resting state
      this.membrane = this.membrane - ((this.membrane - this.restingPotential) * this.leakRate);
    }
    
    // Record spike train
    this.spikeTrain.push(this.hasSpikeFired);
    if (this.spikeTrain.length > 100) {
      this.spikeTrain.shift(); // Keep last 100 time steps
    }
  }
  
  /**
   * Fire a spike
   */
  private fire(): void {
    this.hasSpikeFired = true;
    this.lastSpikeTime = Date.now();
    
    // Reset membrane potential
    this.membrane = this.restingPotential;
    
    // Enter refractory period
    this.refractoryCountdown = this.refractoryPeriod;
  }
  
  /**
   * Check if the neuron has fired in the current time step
   */
  public hasFired(): boolean {
    return this.hasSpikeFired;
  }
  
  /**
   * Reset neuron state
   */
  public reset(): void {
    this.membrane = this.restingPotential;
    this.refractoryCountdown = 0;
    this.hasSpikeFired = false;
    this.spikeTrain = [];
  }
  
  /**
   * Get current membrane potential
   */
  public getMembranePotential(): number {
    return this.membrane;
  }
  
  /**
   * Get spike train history
   */
  public getSpikeHistory(): boolean[] {
    return [...this.spikeTrain];
  }
  
  /**
   * Adjust excitability factor for homeostatic plasticity
   */
  public adjustExcitability(factor: number): void {
    this.excitabilityFactor *= factor;
    
    // Keep excitability within reasonable bounds
    if (this.excitabilityFactor < 0.1) this.excitabilityFactor = 0.1;
    if (this.excitabilityFactor > 5.0) this.excitabilityFactor = 5.0;
  }
}
