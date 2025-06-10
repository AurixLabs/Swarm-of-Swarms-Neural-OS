import { SpikingNeuron } from './SpikingNeuron';
import { NeuronLayer, SynapseConnection, ConnectionOptions } from './types';

/**
 * SynapticNetwork
 * 
 * Implements a biologically-inspired spiking neural network with:
 * - Multiple layers of spiking neurons
 * - STDP (Spike-Timing-Dependent Plasticity)
 * - Lateral inhibition within layers
 * - Homeostatic plasticity
 */
export class SynapticNetwork {
  private layers: Map<string, NeuronLayer> = new Map();
  private connections: Map<string, SynapseConnection[]> = new Map();
  
  /**
   * Create a new layer of neurons
   */
  public async createLayer(layerId: string, neuronCount: number): Promise<NeuronLayer> {
    if (this.layers.has(layerId)) {
      throw new Error(`Layer with ID ${layerId} already exists`);
    }
    
    const neurons: SpikingNeuron[] = [];
    
    // Create neurons for this layer
    for (let i = 0; i < neuronCount; i++) {
      neurons.push(new SpikingNeuron({
        id: `${layerId}_${i}`,
        threshold: 1.0,
        restingPotential: -70,
        refractoryPeriod: 5,
        decayRate: 0.2,
        leakRate: 0.01
      }));
    }
    
    const layer: NeuronLayer = {
      id: layerId,
      neurons,
      type: layerId.includes('hidden') ? 'hidden' : (layerId === 'input' ? 'input' : 'output')
    };
    
    this.layers.set(layerId, layer);
    
    // Create lateral inhibitory connections within the layer
    this.createLateralInhibition(layer);
    
    return layer;
  }
  
  /**
   * Connect two layers with synapses
   */
  public async connectLayers(
    sourceLayerId: string,
    targetLayerId: string,
    options: ConnectionOptions
  ): Promise<void> {
    const sourceLayer = this.layers.get(sourceLayerId);
    const targetLayer = this.layers.get(targetLayerId);
    
    if (!sourceLayer || !targetLayer) {
      throw new Error('Source or target layer not found');
    }
    
    const connectionId = `${sourceLayerId}->${targetLayerId}`;
    const connections: SynapseConnection[] = [];
    
    // Create feed-forward connections
    for (const sourceNeuron of sourceLayer.neurons) {
      for (const targetNeuron of targetLayer.neurons) {
        // Random initial weight based on options
        const initialWeight = options.initialWeight * (0.5 + Math.random());
        
        // Create synapse connection
        connections.push({
          sourceNeuronId: sourceNeuron.id,
          targetNeuronId: targetNeuron.id,
          weight: initialWeight,
          delay: Math.floor(Math.random() * 4) + 1, // 1-4ms delay
          plasticityEnabled: options.plasticityEnabled,
          learningRate: options.learningRate,
          lastActivation: 0,
        });
        
        // Connect the neurons
        targetNeuron.addInputConnection(sourceNeuron.id, initialWeight);
      }
    }
    
    this.connections.set(connectionId, connections);
  }
  
  /**
   * Create lateral inhibition within a layer
   * This is a key feature of biological neural networks
   */
  private createLateralInhibition(layer: NeuronLayer): void {
    if (layer.neurons.length <= 1) return;
    
    // Create sparse lateral connections (not fully connected)
    for (let i = 0; i < layer.neurons.length; i++) {
      const neuron = layer.neurons[i];
      
      // Connect to a random subset of other neurons in the layer
      const connectionsCount = Math.ceil(layer.neurons.length * 0.2); // Connect to ~20%
      const targets = new Set<number>();
      
      while (targets.size < connectionsCount) {
        const targetIdx = Math.floor(Math.random() * layer.neurons.length);
        if (targetIdx !== i) { // No self-connections
          targets.add(targetIdx);
        }
      }
      
      // Add inhibitory connections
      targets.forEach(targetIdx => {
        const targetNeuron = layer.neurons[targetIdx];
        targetNeuron.addInhibitoryConnection(neuron.id, 0.5 + Math.random() * 0.5);
      });
    }
  }
  
  /**
   * Process input through the network
   */
  public async processSpikeTrain(spikeTrain: number[]): Promise<number[]> {
    const inputLayer = this.findLayerByType('input');
    const outputLayer = this.findLayerByType('output');
    
    if (!inputLayer || !outputLayer) {
      throw new Error('Network requires input and output layers');
    }
    
    // Reset all neurons
    this.resetAllNeurons();
    
    // Process the spike train through the network
    const timeSteps = Math.max(20, spikeTrain.length); // Ensure minimum simulation time
    const outputSpikes = new Array(outputLayer.neurons.length).fill(0);
    
    // Run the network simulation for multiple time steps
    for (let t = 0; t < timeSteps; t++) {
      // Input phase - deliver spikes to input layer
      const currentInputValue = t < spikeTrain.length ? spikeTrain[t] : 0;
      
      // Distribute input across input neurons
      inputLayer.neurons.forEach((neuron, i) => {
        if (currentInputValue > 0 && Math.random() < 0.3) { // Sparse coding
          neuron.receiveSpike(currentInputValue);
        }
      });
      
      // Process hidden layers in order
      this.getLayers()
        .filter(layer => layer.type === 'hidden')
        .forEach(layer => {
          this.processLayerTimeStep(layer);
        });
      
      // Process output layer
      this.processLayerTimeStep(outputLayer);
      
      // Record output spikes
      outputLayer.neurons.forEach((neuron, i) => {
        if (neuron.hasFired()) {
          outputSpikes[i]++;
          
          // Apply STDP learning
          this.applySTDPLearning(neuron.id, t);
        }
      });
    }
    
    return outputSpikes;
  }
  
  /**
   * Process a single time step for a layer
   */
  private processLayerTimeStep(layer: NeuronLayer): void {
    // Update all neurons in this layer
    layer.neurons.forEach(neuron => neuron.update());
  }
  
  /**
   * Apply STDP learning
   */
  private applySTDPLearning(neuronId: string, currentTime: number): void {
    // Find all connections targeting this neuron
    this.getAllConnections().forEach(connection => {
      if (!connection.plasticityEnabled) return;
      
      if (connection.targetNeuronId === neuronId) {
        // Calculate time difference
        const timeDifference = currentTime - connection.lastActivation;
        
        if (timeDifference > 0 && timeDifference < 20) {
          // Pre-before-post: strengthen connection (LTP - Long-Term Potentiation)
          const strengthening = connection.learningRate * Math.exp(-timeDifference / 10);
          connection.weight += strengthening;
          connection.weight = Math.min(connection.weight, 2.0); // Cap maximum weight
        }
      } else if (connection.sourceNeuronId === neuronId) {
        connection.lastActivation = currentTime;
        
        // Here we could implement post-before-pre weakening (LTD)
        // But we'll keep it simple for now
      }
    });
  }
  
  /**
   * Reset all neurons in the network
   */
  private resetAllNeurons(): void {
    this.layers.forEach(layer => {
      layer.neurons.forEach(neuron => neuron.reset());
    });
  }
  
  /**
   * Find a layer by type
   */
  private findLayerByType(type: 'input' | 'hidden' | 'output'): NeuronLayer | undefined {
    for (const layer of this.layers.values()) {
      if (layer.type === type) {
        return layer;
      }
    }
    return undefined;
  }
  
  /**
   * Get all layers in the network
   */
  public getLayers(): NeuronLayer[] {
    return Array.from(this.layers.values());
  }
  
  /**
   * Get all connections in the network
   */
  public getConnections(): SynapseConnection[] {
    let allConnections: SynapseConnection[] = [];
    this.connections.forEach(connections => {
      allConnections = allConnections.concat(connections);
    });
    return allConnections;
  }
  
  /**
   * Get connections between two specific layers
   */
  public getConnectionsBetweenLayers(sourceLayerId: string, targetLayerId: string): SynapseConnection[] {
    const connectionId = `${sourceLayerId}->${targetLayerId}`;
    return this.connections.get(connectionId) || [];
  }
  
  /**
   * Get all connections for the entire network
   */
  private getAllConnections(): SynapseConnection[] {
    let allConnections: SynapseConnection[] = [];
    this.connections.forEach(connections => {
      allConnections = allConnections.concat(connections);
    });
    return allConnections;
  }
  
  /**
   * Adjust excitability of all neurons
   * Implements homeostatic plasticity
   */
  public adjustExcitability(factor: number): void {
    this.layers.forEach(layer => {
      layer.neurons.forEach(neuron => {
        neuron.adjustExcitability(factor);
      });
    });
  }
}
