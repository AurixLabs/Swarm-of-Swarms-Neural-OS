
import { ReactNode } from 'react';

export interface UIComponentDefinition {
  id: string;
  name: string;
  type: string;
  location: string;
  component: ReactNode | null;
  metadata?: Record<string, any>;
}

export class UIComponentRegistry {
  private components: Map<string, UIComponentDefinition> = new Map();

  public registerComponent(component: UIComponentDefinition): boolean {
    if (this.components.has(component.id)) {
      return false;
    }
    
    this.components.set(component.id, component);
    return true;
  }

  public unregisterComponent(componentId: string): boolean {
    return this.components.delete(componentId);
  }

  public getComponent(componentId: string): UIComponentDefinition | undefined {
    return this.components.get(componentId);
  }

  public isComponentRegistered(componentId: string): boolean {
    return this.components.has(componentId);
  }

  public getAllComponents(): UIComponentDefinition[] {
    return Array.from(this.components.values());
  }

  public getComponentsByLocation(location: string): UIComponentDefinition[] {
    return Array.from(this.components.values())
      .filter(component => component.location === location);
  }

  public setComponentMetadata(componentId: string, metadata: Record<string, any>): boolean {
    const component = this.components.get(componentId);
    if (!component) {
      return false;
    }

    this.components.set(componentId, {
      ...component,
      metadata: { ...component.metadata, ...metadata }
    });
    
    return true;
  }
}
