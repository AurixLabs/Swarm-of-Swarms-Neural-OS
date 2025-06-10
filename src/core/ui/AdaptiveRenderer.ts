
import { UITheme } from './UIAdapterModule';
import { UIMemory } from './UIMemory';

// Context data that influences rendering decisions
export interface RenderContext {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenSize: { width: number; height: number };
  userPreferences?: {
    reducedMotion?: boolean;
    highContrast?: boolean;
    fontSize?: 'small' | 'medium' | 'large';
  };
  userActivity?: {
    lastActive: number;
    sessionDuration: number;
  };
  environmentData?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    location?: string;
  };
}

// Renderer suggestion for adaptive UI
export interface RenderSuggestion {
  componentId: string;
  visibility: boolean;
  priority: number;
  layout: 'compact' | 'expanded' | 'detailed';
  adaptiveProperties?: Record<string, any>;
}

// The adaptive renderer that makes dynamic UI decisions
export class AdaptiveRenderer {
  private currentTheme: UITheme = 'system';
  private currentContext: RenderContext | null = null;
  private uiMemory: UIMemory;

  constructor(uiMemory: UIMemory) {
    this.uiMemory = uiMemory;
  }

  // Update rendering context
  public updateContext(context: RenderContext): void {
    this.currentContext = context;
  }

  // Set current theme
  public setTheme(theme: UITheme): void {
    this.currentTheme = theme;
  }

  // Get current theme
  public getTheme(): UITheme {
    return this.currentTheme;
  }

  // Generate rendering suggestions based on context and memory
  public generateSuggestions(componentIds: string[]): RenderSuggestion[] {
    if (!this.currentContext) {
      return [];
    }

    return componentIds.map(id => {
      const isFrequent = this.uiMemory.getFrequentComponents().includes(id);
      const visibility = this.uiMemory.getComponentVisibility(id);

      // Calculate layout based on device type and screen size
      let layout: 'compact' | 'expanded' | 'detailed' = 'compact';
      const { deviceType, screenSize } = this.currentContext;

      if (deviceType === 'desktop' && screenSize.width > 1200) {
        layout = 'detailed';
      } else if (deviceType === 'tablet' || screenSize.width > 768) {
        layout = 'expanded';
      }

      // Override with user preferences if available
      const featureLayout = this.uiMemory.suggestLayout(id);
      if (featureLayout) {
        layout = featureLayout;
      }

      return {
        componentId: id,
        visibility: visibility,
        priority: isFrequent ? 1 : 0,
        layout,
        adaptiveProperties: {
          fontSize: this.currentContext.userPreferences?.fontSize || 'medium',
          highContrast: this.currentContext.userPreferences?.highContrast || false,
          reducedMotion: this.currentContext.userPreferences?.reducedMotion || false
        }
      };
    });
  }

  // Adapt a component to the current context
  public adaptComponent(componentId: string): RenderSuggestion | null {
    if (!this.currentContext) {
      return null;
    }

    const suggestions = this.generateSuggestions([componentId]);
    return suggestions.length > 0 ? suggestions[0] : null;
  }
}
