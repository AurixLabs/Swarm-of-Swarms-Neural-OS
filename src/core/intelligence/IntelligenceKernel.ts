
import { UniversalKernel } from '../UniversalKernel';
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { SystemEventBus } from '../events/SystemEventBus';

// Import the existing registry and cache
import { intelligenceRegistry } from './IntelligenceRegistry';
import { cognitiveCache } from './CognitiveCache';

// Import our new services
import {
  createWasmReasoningService,
  createCapabilityManager,
  createContextualAnalyzer,
  WasmReasoningService,
  CapabilityManager,
  ContextualAnalyzer
} from './services';

export class IntelligenceKernel extends UniversalKernel {
  private modelRegistry: Map<string, any> = new Map();
  private metadataRegistry: Map<string, any> = new Map();
  
  // Our refactored services
  private wasmService: WasmReasoningService;
  private capabilityManager: CapabilityManager;
  private contextualAnalyzer: ContextualAnalyzer;
  
  constructor() {
    super();
    
    // Initialize our services
    this.wasmService = createWasmReasoningService(this.events);
    this.capabilityManager = createCapabilityManager();
    this.contextualAnalyzer = createContextualAnalyzer(
      this.wasmService,
      this.capabilityManager,
      this.events
    );
    
    this._initialize();
  }
  
  // Changed to public method that doesn't do the real initialization
  public initialize(): void {
    console.log('IntelligenceKernel public initialize method called');
    // This is now just a public API method that doesn't do the actual initialization
  }
  
  // Private initialization method
  private _initialize(): void {
    console.log('Initializing IntelligenceKernel');
    
    // Setup event handlers
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    // Handle model updates
    this.events.on('MODEL_UPDATED', (payload) => {
      const { modelId, capabilities } = payload;
      if (modelId && capabilities) {
        this.capabilityManager.updateModelCapabilities(modelId, capabilities);
      }
    });
    
    // Handle contextual analysis requests
    this.events.on('ANALYZE_CONTEXT', (payload) => {
      const { context, options } = payload;
      if (context) {
        this.performContextualAnalysis(context, options);
      }
    });
    
    // Handle capability discovery requests
    this.events.on('DISCOVER_CAPABILITIES', () => {
      this.events.emit('CAPABILITIES_DISCOVERED', {
        capabilities: this.capabilityManager.getCapabilities(),
        timestamp: Date.now()
      });
    });
  }
  
  /**
   * Register a new intelligence capability
   */
  public registerCapability(capabilityId: string): boolean {
    const result = this.capabilityManager.registerCapability(capabilityId);
    if (result) {
      this.setState(`capability:${capabilityId}`, { active: true, timestamp: Date.now() });
      this.events.emit('CAPABILITY_REGISTERED', { capabilityId });
    }
    return result;
  }
  
  /**
   * Unregister an intelligence capability
   */
  public unregisterCapability(capabilityId: string): boolean {
    const result = this.capabilityManager.unregisterCapability(capabilityId);
    if (result) {
      this.deleteState(`capability:${capabilityId}`);
      this.events.emit('CAPABILITY_UNREGISTERED', { capabilityId });
    }
    return result;
  }
  
  /**
   * Register a model handler for specific intent types
   */
  public registerModelHandler(modelId: string, intentTypes: string[]): void {
    this.capabilityManager.registerModelHandler(modelId, intentTypes);
  }
  
  /**
   * Update capabilities for a given model
   */
  public updateModelCapabilities(modelId: string, capabilities: string[]): void {
    this.capabilityManager.updateModelCapabilities(modelId, capabilities);
    
    // Notify subscribers
    this.events.emit('MODEL_CAPABILITIES_UPDATED', {
      modelId,
      capabilities,
      timestamp: Date.now()
    });
  }
  
  /**
   * Perform contextual analysis on provided context
   * Delegates to the ContextualAnalyzer service
   */
  private async performContextualAnalysis(context: any, options?: any): Promise<any> {
    return this.contextualAnalyzer.analyzeContext(context, options);
  }
  
  /**
   * Check if a capability is available
   */
  public hasCapability(capabilityId: string): boolean {
    return this.capabilityManager.hasCapability(capabilityId);
  }
  
  /**
   * Get all registered capabilities
   */
  public getCapabilities(): string[] {
    return this.capabilityManager.getCapabilities();
  }
  
  /**
   * Register a contextual model
   */
  public registerContextualModel(modelId: string, enabled: boolean = true): void {
    this.capabilityManager.registerContextualModel(modelId, enabled);
  }
  
  /**
   * Enable or disable a contextual model
   */
  public setContextualModelEnabled(modelId: string, enabled: boolean): boolean {
    return this.capabilityManager.setContextualModelEnabled(modelId, enabled);
  }
  
  /**
   * Check if a contextual model is enabled
   */
  public isContextualModelEnabled(modelId: string): boolean {
    return this.capabilityManager.isContextualModelEnabled(modelId);
  }
}

// Export a singleton instance
export const intelligenceKernel = new IntelligenceKernel();
