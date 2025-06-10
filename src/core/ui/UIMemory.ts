
// Interface for UI component interaction data
interface ComponentInteraction {
  id: string;
  componentType: string;
  timestamp: number;
  duration?: number;
  interactionType: 'view' | 'click' | 'hover' | 'focus';
}

// Interface for UI layout preferences
interface LayoutPreference {
  id: string;
  layout: 'compact' | 'expanded' | 'detailed';
  lastUsed: number;
  frequency: number;
}

// The UI Memory system that learns from user interactions
export class UIMemory {
  private interactions: ComponentInteraction[] = [];
  private layoutPreferences = new Map<string, LayoutPreference>();
  private componentVisibility = new Map<string, boolean>();
  private interactionWeights = new Map<string, number>();
  
  // Record a component interaction
  public recordInteraction(interaction: ComponentInteraction): void {
    this.interactions.push(interaction);
    
    // Ensure we don't store too many interactions
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-1000);
    }
    
    // Update weights based on recency
    this.updateInteractionWeights(interaction);
  }
  
  // Update interaction weights (more recent = higher weight)
  private updateInteractionWeights(interaction: ComponentInteraction): void {
    const existingWeight = this.interactionWeights.get(interaction.id) || 0;
    // Decay old weight and add new interaction
    const newWeight = (existingWeight * 0.95) + 1;
    this.interactionWeights.set(interaction.id, newWeight);
  }
  
  // Record layout preference
  public setLayoutPreference(featureId: string, layout: 'compact' | 'expanded' | 'detailed'): void {
    const existing = this.layoutPreferences.get(featureId);
    
    if (existing) {
      this.layoutPreferences.set(featureId, {
        ...existing,
        layout,
        lastUsed: Date.now(),
        frequency: existing.frequency + 1
      });
    } else {
      this.layoutPreferences.set(featureId, {
        id: featureId,
        layout,
        lastUsed: Date.now(),
        frequency: 1
      });
    }
  }
  
  // Get layout preference for a feature
  public getLayoutPreference(featureId: string): LayoutPreference | undefined {
    return this.layoutPreferences.get(featureId);
  }
  
  // Set component visibility
  public setComponentVisibility(componentId: string, isVisible: boolean): void {
    this.componentVisibility.set(componentId, isVisible);
  }
  
  // Get component visibility
  public getComponentVisibility(componentId: string): boolean {
    return this.componentVisibility.get(componentId) || false;
  }
  
  // Get most frequently used components
  public getFrequentComponents(limit: number = 5): string[] {
    return Array.from(this.interactionWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
  }
  
  // Predict which components should be visible based on current context
  public predictVisibleComponents(context: any): string[] {
    // Simple implementation - show frequent components
    // In a real implementation, this would use more sophisticated algorithms
    return this.getFrequentComponents();
  }
  
  // Suggest layout based on usage patterns
  public suggestLayout(featureId: string): 'compact' | 'expanded' | 'detailed' | undefined {
    const preference = this.layoutPreferences.get(featureId);
    return preference?.layout;
  }
}
