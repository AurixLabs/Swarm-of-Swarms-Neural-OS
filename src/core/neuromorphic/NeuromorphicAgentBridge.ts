
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { hyperAgentManager } from '../wasm/HyperOptimizedAgent';
import { microAgentManager } from '../wasm/MicroAgentModule';

/**
 * Interface for the WASM Neuromorphic processor with agent integration methods
 */
interface NeuromorphicProcessorInterface {
  process_input: (input: Uint8Array) => Float32Array;
  receive_agent_spikes: (agentId: number, spikePattern: number) => number;
  process_agent_buffer: () => Float32Array;
  generate_agent_pattern: () => number;
  energy_usage: number;
}

/**
 * Bridge that connects the Neuromorphic Brain with WASM Agents
 * Allows bidirectional communication between neural networks and agents
 */
export class NeuromorphicAgentBridge {
  private processor: NeuromorphicProcessorInterface | null = null;
  private events: BrowserEventEmitter;
  private initialized = false;
  private connectedAgents: Set<string> = new Set();
  private neuromorphicFeedbackHandler: ((pattern: number) => void) | null = null;
  
  constructor(events?: BrowserEventEmitter) {
    this.events = events || new BrowserEventEmitter();
  }
  
  /**
   * Initialize the bridge with a WASM neuromorphic processor
   */
  public initialize(processor: NeuromorphicProcessorInterface): boolean {
    this.processor = processor;
    this.initialized = true;
    
    // Set up event listeners for agent events
    this.setupEventListeners();
    
    this.events.emit('NEUROMORPHIC_BRIDGE_INITIALIZED', {
      timestamp: Date.now()
    });
    
    return true;
  }
  
  /**
   * Set up event listeners for agent-related events
   */
  private setupEventListeners(): void {
    // Listen for agent deployment events
    this.events.on('agent:loaded', (event) => {
      console.log(`Agent ${event.agentId} loaded. Attempting to connect to neuromorphic brain.`);
      this.connectAgent(event.agentId);
    });
    
    // Listen for agent spike events
    this.events.on('agent:spike', (event) => {
      if (this.connectedAgents.has(event.agentId)) {
        this.processSpikeFromAgent(event.agentId, event.spikePattern);
      }
    });
  }
  
  /**
   * Connect an agent to the neuromorphic brain
   */
  public connectAgent(agentId: string): boolean {
    if (!this.initialized || !this.processor) {
      console.error('Cannot connect agent: neuromorphic bridge not initialized');
      return false;
    }
    
    try {
      // Add to connected agents list
      this.connectedAgents.add(agentId);
      
      // Send an initial spike pattern to the agent
      const initialPattern = this.processor.generate_agent_pattern();
      
      // Send to the appropriate agent manager based on agent ID
      if (agentId.startsWith('hyper-')) {
        hyperAgentManager.processSpikes(agentId, initialPattern);
      } else {
        // For now, we'll just log this as we haven't implemented the specific method in microAgentManager
        console.log(`Would send spike pattern ${initialPattern.toString(16)} to micro-agent ${agentId}`);
      }
      
      this.events.emit('NEUROMORPHIC_AGENT_CONNECTED', {
        agentId,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error(`Error connecting agent ${agentId} to neuromorphic brain:`, error);
      return false;
    }
  }
  
  /**
   * Process a spike pattern from an agent
   */
  public processSpikeFromAgent(agentId: string, spikePattern: number): number {
    if (!this.initialized || !this.processor) {
      console.error('Cannot process spike: neuromorphic bridge not initialized');
      return 0;
    }
    
    try {
      // Convert agent ID string to a number for the WASM interface
      // For simplicity, we'll just hash the string to a number
      const agentIdHash = this.hashAgentId(agentId);
      
      // Send the spikes to the processor and get feedback
      const feedback = this.processor.receive_agent_spikes(agentIdHash, spikePattern);
      
      // Log the feedback
      console.log(`Neuromorphic feedback for agent ${agentId}: 0x${feedback.toString(16)}`);
      
      // Emit an event with the feedback
      this.events.emit('NEUROMORPHIC_FEEDBACK', {
        agentId,
        feedback,
        timestamp: Date.now()
      });
      
      // If there's a feedback handler registered, call it
      if (this.neuromorphicFeedbackHandler) {
        this.neuromorphicFeedbackHandler(feedback);
      }
      
      return feedback;
    } catch (error) {
      console.error(`Error processing spike pattern from agent ${agentId}:`, error);
      return 0;
    }
  }
  
  /**
   * Process all accumulated agent spikes
   */
  public processAgentBuffer(): Float32Array {
    if (!this.initialized || !this.processor) {
      console.error('Cannot process agent buffer: neuromorphic bridge not initialized');
      return new Float32Array();
    }
    
    try {
      return this.processor.process_agent_buffer();
    } catch (error) {
      console.error('Error processing agent spike buffer:', error);
      return new Float32Array();
    }
  }
  
  /**
   * Generate a spike pattern to send to agents
   */
  public generateSpikePatternForAgents(): number {
    if (!this.initialized || !this.processor) {
      console.error('Cannot generate pattern: neuromorphic bridge not initialized');
      return 0;
    }
    
    try {
      return this.processor.generate_agent_pattern();
    } catch (error) {
      console.error('Error generating spike pattern for agents:', error);
      return 0;
    }
  }
  
  /**
   * Register a callback for neuromorphic feedback
   */
  public onNeuromorphicFeedback(callback: (pattern: number) => void): void {
    this.neuromorphicFeedbackHandler = callback;
  }
  
  /**
   * Disconnect an agent from the neuromorphic brain
   */
  public disconnectAgent(agentId: string): boolean {
    if (this.connectedAgents.has(agentId)) {
      this.connectedAgents.delete(agentId);
      
      this.events.emit('NEUROMORPHIC_AGENT_DISCONNECTED', {
        agentId,
        timestamp: Date.now()
      });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if an agent is connected to the neuromorphic brain
   */
  public isAgentConnected(agentId: string): boolean {
    return this.connectedAgents.has(agentId);
  }
  
  /**
   * Get all connected agents
   */
  public getConnectedAgents(): string[] {
    return Array.from(this.connectedAgents);
  }
  
  /**
   * Simple hash function to convert agent ID string to a number
   */
  private hashAgentId(agentId: string): number {
    let hash = 0;
    for (let i = 0; i < agentId.length; i++) {
      const char = agentId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

// Export a singleton instance
export const neuromorphicAgentBridge = new NeuromorphicAgentBridge();
export default neuromorphicAgentBridge;
