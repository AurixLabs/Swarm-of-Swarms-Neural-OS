
import { SDKApp } from './SDKRegistry';

/**
 * Types of synergy effects that can occur between apps
 */
export type SynergyType = 'enhance' | 'transform' | 'combine';

/**
 * Represents a synergy effect between two SDK apps
 */
export interface SynergyEffect {
  source: {
    id: string;
    name: string;
  };
  target: {
    id: string;
    name: string;
  };
  type: SynergyType;
  impact: number; // 0-1 value representing synergy strength
  description: string;
}

/**
 * Class to calculate and manage synergies between SDK apps
 */
export class AppSynergy {
  /**
   * Calculate all potential synergy effects between the provided apps
   */
  static calculateSynergyEffects(apps: SDKApp[]): SynergyEffect[] {
    const synergies: SynergyEffect[] = [];
    
    // Compare each app with others to find potential synergies
    for (let i = 0; i < apps.length; i++) {
      for (let j = i + 1; j < apps.length; j++) {
        const sourceApp = apps[i];
        const targetApp = apps[j];
        
        const synergyEffect = this.calculateSynergyBetweenApps(sourceApp, targetApp);
        
        if (synergyEffect) {
          synergies.push(synergyEffect);
        }
      }
    }
    
    return synergies;
  }
  
  /**
   * Calculate synergy between two specific apps
   */
  static calculateSynergyBetweenApps(app1: SDKApp, app2: SDKApp): SynergyEffect | null {
    // Find common capabilities between apps
    const commonCapabilities = app1.capabilities.filter(cap => 
      app2.capabilities.includes(cap)
    );
    
    // No common capabilities means no direct synergy
    if (commonCapabilities.length === 0) {
      return null;
    }
    
    // Calculate synergy impact based on capability overlap
    const overlapRatio = commonCapabilities.length / 
      Math.max(app1.capabilities.length, app2.capabilities.length);
    
    // Determine synergy type based on capabilities
    const synergyType = this.determineSynergyType(app1.capabilities, app2.capabilities);
    
    // Generate description based on type and capabilities
    const description = this.generateSynergyDescription(synergyType, commonCapabilities);
    
    // Create the synergy effect
    return {
      source: {
        id: app1.id,
        name: app1.name
      },
      target: {
        id: app2.id,
        name: app2.name
      },
      type: synergyType,
      impact: overlapRatio * this.getSynergyMultiplier(synergyType),
      description
    };
  }
  
  /**
   * Determine the type of synergy based on capabilities
   */
  private static determineSynergyType(
    capabilities1: string[], 
    capabilities2: string[]
  ): SynergyType {
    // This is a simplified algorithm - in a real app, this would be more sophisticated
    
    // Check for 'transform' synergies (one app processes output of another)
    if (capabilities1.some(cap => cap.includes('process') || cap.includes('analysis')) &&
        capabilities2.some(cap => cap.includes('generate') || cap.includes('output'))) {
      return 'transform';
    }
    
    // Check for 'combine' synergies (apps work in parallel for enhanced output)
    if (capabilities1.some(cap => capabilities2.includes(cap))) {
      return 'combine';
    }
    
    // Default to 'enhance'
    return 'enhance';
  }
  
  /**
   * Get a multiplier based on synergy type to weight the impact
   */
  private static getSynergyMultiplier(type: SynergyType): number {
    switch (type) {
      case 'transform': return 1.5;  // Transform synergies have highest impact
      case 'combine': return 1.3;    // Combine synergies have medium impact
      case 'enhance': return 1.0;    // Enhance synergies have baseline impact
      default: return 1.0;
    }
  }
  
  /**
   * Generate a human-readable description of the synergy
   */
  private static generateSynergyDescription(
    type: SynergyType, 
    commonCapabilities: string[]
  ): string {
    const capability = commonCapabilities[0] || 'functionality';
    
    switch (type) {
      case 'transform':
        return `Transforms data between ${capability} processes`;
      case 'combine':
        return `Combines ${capability} capabilities for enhanced results`;
      case 'enhance':
        return `Enhances ${capability} performance and capabilities`;
      default:
        return `Improves overall system performance`;
    }
  }
  
  /**
   * Calculate the potential intelligence boost from a set of apps
   */
  static calculateIntelligenceBoost(apps: SDKApp[]): number {
    // Base intelligence boost from each app
    const baseBoost = apps.length * 5; // 5% per app as a baseline
    
    // Synergy effects add additional boost
    const synergies = this.calculateSynergyEffects(apps);
    const synergyBoost = synergies.reduce((total, synergy) => {
      return total + (synergy.impact * 10); // Convert impact to percentage points
    }, 0);
    
    return baseBoost + synergyBoost;
  }
}
