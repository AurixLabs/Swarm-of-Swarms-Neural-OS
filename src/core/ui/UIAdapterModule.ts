
import { UIKernel } from './UIKernel';

export type UITheme = 'light' | 'dark' | 'system';

export interface UIAdapterOptions {
  theme?: UITheme;
  enableCognitiveUI?: boolean;
  accessibility?: {
    reducedMotion?: boolean;
    highContrast?: boolean;
    increasedFontSize?: boolean;
  };
}

/**
 * UIAdapterModule - Manages UI adaptations and device-specific interfaces
 */
export class UIAdapterModule {
  private kernel: UIKernel;
  private theme: UITheme = 'system';
  private cognitiveUIEnabled = true;
  private accessibility = {
    reducedMotion: false,
    highContrast: false,
    increasedFontSize: false
  };

  constructor(kernel: UIKernel, options: UIAdapterOptions = {}) {
    this.kernel = kernel;
    
    if (options.theme) {
      this.theme = options.theme;
    }
    
    if (options.enableCognitiveUI !== undefined) {
      this.cognitiveUIEnabled = options.enableCognitiveUI;
    }
    
    if (options.accessibility) {
      this.accessibility = {
        ...this.accessibility,
        ...options.accessibility
      };
    }
  }

  public setTheme(theme: UITheme): void {
    this.theme = theme;
    
    // Notify the kernel of theme change
    this.kernel.events.emitEvent({
      type: 'THEME_CHANGED',
      payload: { theme, timestamp: Date.now() }
    });
    
    // Apply theme to document
    this.applyThemeToDocument(theme);
  }
  
  public getTheme(): UITheme {
    return this.theme;
  }
  
  public enableCognitiveUI(): void {
    this.cognitiveUIEnabled = true;
    this.kernel.setCognitiveUIEnabled(true);
  }
  
  public disableCognitiveUI(): void {
    this.cognitiveUIEnabled = false;
    this.kernel.setCognitiveUIEnabled(false);
  }
  
  public isCognitiveUIEnabled(): boolean {
    return this.cognitiveUIEnabled;
  }
  
  public setAccessibilityOption(option: keyof typeof this.accessibility, value: boolean): void {
    this.accessibility[option] = value;
    
    // Notify the kernel of accessibility change
    this.kernel.events.emitEvent({
      type: 'LAYOUT_CHANGED',
      payload: { 
        accessibility: { [option]: value },
        timestamp: Date.now()
      }
    });
  }
  
  private applyThemeToDocument(theme: UITheme): void {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Apply new theme
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }
}
