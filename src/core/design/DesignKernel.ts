import { UniversalKernel } from '../UniversalKernel';
import { systemKernel } from '../SystemKernel';
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { createSystemEvent } from '../utils/eventUtils';

// Import all kernel classes
import { BalanceKernel } from './principles/BalanceKernel';
import { EmphasisKernel } from './principles/EmphasisKernel';
import { ProportionKernel } from './principles/ProportionKernel';
import { LineKernel } from './principles/LineKernel';
import { LightKernel } from './principles/LightKernel';
import { RhythmKernel } from './principles/RhythmKernel';
import { MovementKernel } from './principles/MovementKernel';
import { ContrastKernel } from './principles/ContrastKernel';
import { UnityKernel } from './principles/UnityKernel';
import { HierarchyKernel } from './principles/HierarchyKernel';
import { PatternKernel } from './principles/PatternKernel';
import { WhitespaceKernel } from './principles/WhitespaceKernel';

// Define the types of design events
export type DesignEventType = 
  | 'DESIGN_PRINCIPLE_APPLIED'
  | 'DESIGN_EVALUATION'
  | 'DESIGN_RECOMMENDATION'
  | 'AESTHETIC_ANALYSIS'
  | 'PRINCIPLE_WEIGHTS_UPDATED'
  | 'USER_PREFERENCE_UPDATED';

// Define a common interface for all design principle sub-kernels
export interface DesignPrincipleKernel {
  id: string;
  name: string;
  applyPrinciple: (context: any) => any;
  evaluateDesign: (design: any) => { score: number; feedback: string };
  getRecommendations: (context: any) => string[];
  setWeight?: (weight: number) => void;
  getWeight?: () => number;
  customizeParameters?: (parameters: Record<string, any>) => void;
}

// User preference interface for design principles
export interface DesignUserPreferences {
  principleWeights: Record<string, number>;
  colorPreferences?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
  spacing?: {
    dense?: boolean;
    multiplier?: number;
  };
  typography?: {
    preferredScale?: 'minor-third' | 'major-third' | 'perfect-fourth' | 'golden-ratio';
    baseFontSize?: number;
  };
  customParameters?: Record<string, Record<string, any>>;
}

export class DesignKernel extends UniversalKernel {
  private principleKernels: Map<string, DesignPrincipleKernel> = new Map();
  private userPreferences: DesignUserPreferences = {
    principleWeights: {}
  };
  
  constructor() {
    super();
    // Register with the system kernel
    systemKernel.registerModule("design", {
      id: 'design',
      name: 'Design Kernel',
      version: '1.0.0',
      initialize: (kernel) => {
        console.log('Design Kernel initialized');
        return true;
      }
    });
  }

  /**
   * Register a design principle sub-kernel
   */
  public registerPrincipleKernel(kernel: DesignPrincipleKernel): boolean {
    if (this.principleKernels.has(kernel.id)) {
      console.warn(`Design principle kernel with ID ${kernel.id} already registered.`);
      return false;
    }
    
    this.principleKernels.set(kernel.id, kernel);
    
    // Initialize weight in user preferences
    this.userPreferences.principleWeights[kernel.id] = 1.0;
    
    // Emit event that a new principle kernel was registered
    this.events.emit('DESIGN_PRINCIPLE_REGISTERED', {
      id: kernel.id,
      name: kernel.name
    });
    
    return true;
  }

  /**
   * Get a specific design principle kernel
   */
  public getPrincipleKernel(id: string): DesignPrincipleKernel | undefined {
    return this.principleKernels.get(id);
  }

  /**
   * List all registered design principle kernels
   */
  public listPrincipleKernels(): DesignPrincipleKernel[] {
    return Array.from(this.principleKernels.values());
  }

  /**
   * Apply all design principles to a given context
   */
  public applyAllPrinciples(context: any): any {
    const results: Record<string, any> = {};
    
    this.principleKernels.forEach((kernel, id) => {
      results[id] = kernel.applyPrinciple(context);
    });
    
    this.events.emit('DESIGN_PRINCIPLE_APPLIED', {
      context,
      results
    });
    
    return results;
  }

  /**
   * Register all design principles at once
   */
  public registerAllPrinciples(): void {
    // Core Principles
    this.registerPrincipleKernel(new BalanceKernel());
    this.registerPrincipleKernel(new EmphasisKernel());
    this.registerPrincipleKernel(new ProportionKernel());
    this.registerPrincipleKernel(new LineKernel());
    this.registerPrincipleKernel(new LightKernel());
    this.registerPrincipleKernel(new RhythmKernel());
    this.registerPrincipleKernel(new MovementKernel());
    this.registerPrincipleKernel(new ContrastKernel());
    this.registerPrincipleKernel(new UnityKernel());
    this.registerPrincipleKernel(new HierarchyKernel());
    this.registerPrincipleKernel(new PatternKernel());
    this.registerPrincipleKernel(new WhitespaceKernel());
    
    // Emit event for principle registration
    this.events.emit('DESIGN_PRINCIPLES_REGISTERED', {
      count: this.principleKernels.size,
      principles: Array.from(this.principleKernels.keys())
    });
  }

  /**
   * Evaluate a design using all registered principles
   */
  public evaluateDesign(design: any): {
    overall: number;
    principleScores: Record<string, { score: number; feedback: string }>;
  } {
    const principleScores: Record<string, { score: number; feedback: string }> = {};
    let weightedScore = 0;
    let totalWeight = 0;

    this.principleKernels.forEach((kernel, id) => {
      const evaluation = kernel.evaluateDesign(design);
      principleScores[id] = evaluation;
      
      const weight = this.userPreferences.principleWeights[id] || 1.0;
      weightedScore += evaluation.score * weight;
      totalWeight += weight;
    });

    const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

    this.events.emit('DESIGN_EVALUATION', {
      design,
      overall: overallScore,
      principleScores
    });

    return {
      overall: overallScore,
      principleScores
    };
  }

  /**
   * Get design recommendations from all principles
   */
  public getDesignRecommendations(context: any): Record<string, string[]> {
    const recommendations: Record<string, string[]> = {};
    
    this.principleKernels.forEach((kernel, id) => {
      recommendations[id] = kernel.getRecommendations(context);
    });
    
    this.events.emit('DESIGN_RECOMMENDATION', {
      context,
      recommendations
    });
    
    return recommendations;
  }

  /**
   * Set the weight of a design principle (for users to customize importance)
   */
  public setPrincipleWeight(principleId: string, weight: number): boolean {
    if (!this.principleKernels.has(principleId)) {
      console.warn(`Design principle with ID ${principleId} not found.`);
      return false;
    }
    
    // Validate weight is between 0 and 2 (0 = ignore, 1 = normal, 2 = double importance)
    const validatedWeight = Math.max(0, Math.min(2, weight));
    this.userPreferences.principleWeights[principleId] = validatedWeight;
    
    // If kernel has setWeight method, propagate the change
    const kernel = this.principleKernels.get(principleId);
    if (kernel && kernel.setWeight) {
      kernel.setWeight(validatedWeight);
    }
    
    this.events.emit('PRINCIPLE_WEIGHTS_UPDATED', {
      principleId,
      weight: validatedWeight
    });
    
    return true;
  }

  /**
   * Get current principle weights
   */
  public getPrincipleWeights(): Record<string, number> {
    return { ...this.userPreferences.principleWeights };
  }

  /**
   * Reset all principle weights to default (1.0)
   */
  public resetPrincipleWeights(): void {
    for (const id of this.principleKernels.keys()) {
      this.userPreferences.principleWeights[id] = 1.0;
      
      // If kernel has setWeight method, reset it
      const kernel = this.principleKernels.get(id);
      if (kernel && kernel.setWeight) {
        kernel.setWeight(1.0);
      }
    }
    
    this.events.emit('PRINCIPLE_WEIGHTS_UPDATED', {
      reset: true,
      weights: this.userPreferences.principleWeights
    });
  }

  /**
   * Get current user preferences
   */
  public getUserPreferences(): DesignUserPreferences {
    return { ...this.userPreferences };
  }

  /**
   * Update user preferences
   */
  public updateUserPreferences(preferences: Partial<DesignUserPreferences>): void {
    // Update principle weights if provided
    if (preferences.principleWeights) {
      for (const [id, weight] of Object.entries(preferences.principleWeights)) {
        this.setPrincipleWeight(id, weight);
      }
    }
    
    // Update other preferences
    this.userPreferences = {
      ...this.userPreferences,
      ...preferences,
      // Preserve the updated weights
      principleWeights: this.userPreferences.principleWeights
    };
    
    // Apply custom parameters to individual principles
    if (preferences.customParameters) {
      for (const [principleId, params] of Object.entries(preferences.customParameters)) {
        const kernel = this.principleKernels.get(principleId);
        if (kernel && kernel.customizeParameters) {
          kernel.customizeParameters(params);
        }
      }
    }
    
    this.events.emit('USER_PREFERENCE_UPDATED', {
      preferences: this.userPreferences
    });
  }
}

// Create singleton instance
export const designKernel = new DesignKernel();
