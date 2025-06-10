
import { emitSystemEvent } from '@/lib/utils/kernelUtils';

export interface SpikeEvent {
  neuronId: number;
  timestamp: number;
  intensity: number;
  metadata?: Record<string, any>;
}

export interface NeuronState {
  id: number;
  potential: number;
  threshold: number;
  lastSpike: number;
  connections: number[];
}

export interface NetworkMetrics {
  totalNeurons: number;
  activeNeurons: number;
  spikeRate: number;
  networkActivity: number;
  processingLatency: number;
}

export class NeuromorphicProcessor {
  private neurons: Map<number, NeuronState> = new Map();
  private spikeHistory: SpikeEvent[] = [];
  private maxHistorySize = 1000;
  private initialized = false;

  constructor(private neuronCount: number = 100) {
    this.initializeNetwork();
  }

  private initializeNetwork(): void {
    console.log(`🧠 Initializing neuromorphic network with ${this.neuronCount} neurons`);
    
    for (let i = 0; i < this.neuronCount; i++) {
      const connections = this.generateRandomConnections(i);
      this.neurons.set(i, {
        id: i,
        potential: Math.random() * 0.5, // Random initial potential
        threshold: 0.7 + Math.random() * 0.3, // Threshold between 0.7-1.0
        lastSpike: 0,
        connections
      });
    }
    
    this.initialized = true;
    emitSystemEvent('neuromorphic_network_initialized', { neuronCount: this.neuronCount });
  }

  private generateRandomConnections(neuronId: number): number[] {
    const connectionCount = Math.floor(Math.random() * 10) + 5; // 5-15 connections
    const connections: number[] = [];
    
    for (let i = 0; i < connectionCount; i++) {
      let targetId = Math.floor(Math.random() * this.neuronCount);
      // Avoid self-connections and duplicates
      while (targetId === neuronId || connections.includes(targetId)) {
        targetId = Math.floor(Math.random() * this.neuronCount);
      }
      connections.push(targetId);
    }
    
    return connections;
  }

  processInput(input: number[]): SpikeEvent[] {
    if (!this.initialized) {
      console.warn('Neuromorphic network not initialized');
      return [];
    }

    const currentTime = Date.now();
    const spikes: SpikeEvent[] = [];

    // Apply input to random neurons
    input.forEach((value, index) => {
      const neuronId = index % this.neuronCount;
      const neuron = this.neurons.get(neuronId);
      if (neuron) {
        neuron.potential += value * 0.1; // Scale input
      }
    });

    // Process all neurons
    this.neurons.forEach((neuron, neuronId) => {
      // Check if neuron should spike
      if (neuron.potential >= neuron.threshold) {
        const spike: SpikeEvent = {
          neuronId,
          timestamp: currentTime,
          intensity: neuron.potential,
          metadata: { threshold: neuron.threshold }
        };
        
        spikes.push(spike);
        this.addToSpikeHistory(spike);
        
        // Reset neuron potential after spike
        neuron.potential = 0;
        neuron.lastSpike = currentTime;
        
        // Propagate spike to connected neurons
        this.propagateSpike(neuron, currentTime);
      } else {
        // Natural decay
        neuron.potential *= 0.99;
      }
    });

    emitSystemEvent('neuromorphic_spikes_processed', { 
      spikeCount: spikes.length,
      timestamp: currentTime
    });

    return spikes;
  }

  private propagateSpike(spikeNeuron: NeuronState, timestamp: number): void {
    spikeNeuron.connections.forEach(targetId => {
      const targetNeuron = this.neurons.get(targetId);
      if (targetNeuron) {
        // Add excitatory or inhibitory input
        const weight = Math.random() > 0.8 ? -0.1 : 0.05; // 20% inhibitory
        targetNeuron.potential += weight;
        
        // Ensure potential stays within bounds
        targetNeuron.potential = Math.max(0, Math.min(1.5, targetNeuron.potential));
      }
    });
  }

  private addToSpikeHistory(spike: SpikeEvent): void {
    this.spikeHistory.push(spike);
    
    // Maintain history size limit
    if (this.spikeHistory.length > this.maxHistorySize) {
      this.spikeHistory = this.spikeHistory.slice(-this.maxHistorySize / 2);
    }
  }

  getNetworkMetrics(): NetworkMetrics {
    const now = Date.now();
    const recentSpikes = this.spikeHistory.filter(spike => 
      now - spike.timestamp < 1000 // Last second
    );
    
    const activeNeurons = Array.from(this.neurons.values())
      .filter(neuron => neuron.potential > 0.1).length;

    return {
      totalNeurons: this.neuronCount,
      activeNeurons,
      spikeRate: recentSpikes.length,
      networkActivity: activeNeurons / this.neuronCount,
      processingLatency: this.calculateAverageLatency()
    };
  }

  private calculateAverageLatency(): number {
    if (this.spikeHistory.length < 2) return 0;
    
    const recentSpikes = this.spikeHistory.slice(-10);
    if (recentSpikes.length < 2) return 0;
    
    const intervals = [];
    for (let i = 1; i < recentSpikes.length; i++) {
      intervals.push(recentSpikes[i].timestamp - recentSpikes[i-1].timestamp);
    }
    
    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  getSpikeHistory(): SpikeEvent[] {
    return [...this.spikeHistory];
  }

  resetNetwork(): void {
    console.log('🔄 Resetting neuromorphic network');
    this.neurons.clear();
    this.spikeHistory = [];
    this.initializeNetwork();
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

console.log('🧠 NeuromorphicProcessor - Brain-like spike processing ready');
