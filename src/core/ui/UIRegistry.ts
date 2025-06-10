
import { ReactNode } from 'react';
import { IntentType } from '@/types/intent';

// Base interface for all UI components
export interface UIComponent {
  id: string;
  render: (adaptiveProps?: Record<string, any>) => ReactNode;
}

// Interface for input methods
export interface InputMethod extends UIComponent {
  handleSubmit: (value: string) => void;
  handleChange: (value: string) => void;
  value: string;
  isProcessing?: boolean;
}

// Interface for output display components
export interface OutputDisplay extends UIComponent {
  content: any;
  type: string;
  metadata?: Record<string, any>;
}

// Interface for contextual panels that appear based on intent
export interface ContextualPanel extends UIComponent {
  forIntent: IntentType[];
  priority: number; // Higher numbers show on top
  isActive: boolean;
}

// Registry to manage UI components with enhanced features
export class UIRegistry {
  private inputMethods = new Map<string, InputMethod>();
  private outputDisplays = new Map<string, OutputDisplay>();
  private contextualPanels = new Map<string, ContextualPanel>();
  private componentMetadata = new Map<string, Record<string, any>>();
  
  // Input methods
  public registerInputMethod(input: InputMethod) {
    this.inputMethods.set(input.id, input);
  }
  
  public unregisterInputMethod(id: string) {
    this.inputMethods.delete(id);
  }
  
  public getInputMethod(id: string): InputMethod | undefined {
    return this.inputMethods.get(id);
  }
  
  public getAllInputMethods(): InputMethod[] {
    return Array.from(this.inputMethods.values());
  }
  
  // Output displays
  public registerOutputDisplay(display: OutputDisplay) {
    this.outputDisplays.set(display.id, display);
  }
  
  public unregisterOutputDisplay(id: string) {
    this.outputDisplays.delete(id);
  }
  
  public getOutputDisplay(id: string): OutputDisplay | undefined {
    return this.outputDisplays.get(id);
  }
  
  public getAllOutputDisplays(): OutputDisplay[] {
    return Array.from(this.outputDisplays.values());
  }
  
  // Contextual panels
  public registerContextualPanel(panel: ContextualPanel) {
    this.contextualPanels.set(panel.id, panel);
  }
  
  public unregisterContextualPanel(id: string) {
    this.contextualPanels.delete(id);
  }
  
  public getContextualPanel(id: string): ContextualPanel | undefined {
    return this.contextualPanels.get(id);
  }
  
  public getPanelsForIntent(intent: IntentType): ContextualPanel[] {
    return Array.from(this.contextualPanels.values())
      .filter(panel => panel.forIntent.includes(intent))
      .sort((a, b) => b.priority - a.priority);
  }
  
  // Component metadata for adaptive rendering
  public setComponentMetadata(componentId: string, metadata: Record<string, any>): void {
    this.componentMetadata.set(componentId, {
      ...this.getComponentMetadata(componentId),
      ...metadata
    });
  }
  
  public getComponentMetadata(componentId: string): Record<string, any> {
    return this.componentMetadata.get(componentId) || {};
  }
  
  // Get all registered component IDs
  public getAllComponentIds(): string[] {
    const ids = new Set<string>();
    
    this.inputMethods.forEach((_, id) => ids.add(id));
    this.outputDisplays.forEach((_, id) => ids.add(id));
    this.contextualPanels.forEach((_, id) => ids.add(id));
    
    return Array.from(ids);
  }
}
