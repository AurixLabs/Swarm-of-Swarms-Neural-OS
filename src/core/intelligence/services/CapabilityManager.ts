
/**
 * Service responsible for managing intelligence capabilities
 */
export class CapabilityManager {
  private intelligenceModules: Set<string> = new Set();
  private intentMap: Map<string, string[]> = new Map();
  private contextualModels: Map<string, boolean> = new Map();
  
  constructor() {
    this.initializeCapabilities();
  }
  
  /**
   * Initialize default capabilities
   */
  private initializeCapabilities(): void {
    // Register standard intelligence capabilities
    this.registerCapability('intent-detection');
    this.registerCapability('text-generation');
    this.registerCapability('image-analysis');
    this.registerCapability('contextual-understanding');
    
    // Register default model handlers
    this.registerModelHandler('text', ['query-processing', 'response-generation']);
    this.registerModelHandler('image', ['object-detection', 'scene-analysis']);
    this.registerModelHandler('multimodal', ['cross-modal-reasoning', 'unified-understanding']);
  }
  
  /**
   * Register a new intelligence capability
   */
  public registerCapability(capabilityId: string): boolean {
    if (this.intelligenceModules.has(capabilityId)) {
      return false;
    }
    
    this.intelligenceModules.add(capabilityId);
    console.log(`Intelligence capability registered: ${capabilityId}`);
    
    return true;
  }
  
  /**
   * Unregister an intelligence capability
   */
  public unregisterCapability(capabilityId: string): boolean {
    if (!this.intelligenceModules.has(capabilityId)) {
      return false;
    }
    
    this.intelligenceModules.delete(capabilityId);
    console.log(`Intelligence capability unregistered: ${capabilityId}`);
    
    return true;
  }
  
  /**
   * Register a model handler for specific intent types
   */
  public registerModelHandler(modelId: string, intentTypes: string[]): void {
    this.intentMap.set(modelId, intentTypes);
    console.log(`Model handler registered: ${modelId} for intents: ${intentTypes.join(', ')}`);
  }
  
  /**
   * Update capabilities for a given model
   */
  public updateModelCapabilities(modelId: string, capabilities: string[]): void {
    this.intentMap.set(modelId, capabilities);
    console.log(`Model capabilities updated: ${modelId}`);
  }
  
  /**
   * Register a contextual model
   */
  public registerContextualModel(modelId: string, enabled: boolean = true): void {
    this.contextualModels.set(modelId, enabled);
    console.log(`Contextual model registered: ${modelId}, enabled: ${enabled}`);
  }
  
  /**
   * Enable or disable a contextual model
   */
  public setContextualModelEnabled(modelId: string, enabled: boolean): boolean {
    if (!this.contextualModels.has(modelId)) {
      return false;
    }
    
    this.contextualModels.set(modelId, enabled);
    console.log(`Contextual model ${enabled ? 'enabled' : 'disabled'}: ${modelId}`);
    
    return true;
  }
  
  /**
   * Check if a contextual model is enabled
   */
  public isContextualModelEnabled(modelId: string): boolean {
    return this.contextualModels.get(modelId) || false;
  }
  
  /**
   * Check if a capability is available
   */
  public hasCapability(capabilityId: string): boolean {
    return this.intelligenceModules.has(capabilityId);
  }
  
  /**
   * Get all registered capabilities
   */
  public getCapabilities(): string[] {
    return Array.from(this.intelligenceModules);
  }
  
  /**
   * Select appropriate models for a given context
   */
  public selectModelsForContext(context: any): string[] {
    // Simplified model selection logic
    const modelIds: string[] = [];
    
    if (typeof context === 'string') {
      modelIds.push('text');
    } else if (context.image) {
      modelIds.push('image');
      if (context.text) {
        modelIds.push('multimodal');
      }
    } else if (Array.isArray(context)) {
      modelIds.push('multimodal');
    }
    
    return modelIds;
  }
}

// Export a factory function to create the service
export const createCapabilityManager = () => {
  return new CapabilityManager();
};
