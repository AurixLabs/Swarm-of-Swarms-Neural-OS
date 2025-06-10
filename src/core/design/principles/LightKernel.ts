
import { DesignPrincipleKernel } from '../DesignKernel';

export class LightKernel implements DesignPrincipleKernel {
  public id = 'light';
  public name = 'Light Principle';
  private weight: number = 1.0;
  private minimumContrastRatio: number = 4.5;
  private preferredLightDirection: string = '45 degrees top-left';
  private useShadows: boolean = true;
  private useHighlights: boolean = true;
  
  /**
   * Apply light principles to design context
   */
  public applyPrinciple(context: any): any {
    return {
      contrast: this.calculateOptimalContrast(context),
      brightness: this.suggestBrightness(context),
      shadows: this.useShadows ? this.recommendShadows(context) : null,
      highlights: this.useHighlights ? this.calculateHighlights(context) : null
    };
  }
  
  /**
   * Evaluate a design based on light principles
   */
  public evaluateDesign(design: any): { score: number; feedback: string } {
    let score = 0;
    let feedback = '';
    
    // Check for contrast
    if (design.backgroundColor && design.textColor) {
      const contrastScore = this.evaluateContrast(design.backgroundColor, design.textColor);
      score += contrastScore * 0.4;
      
      if (contrastScore > 0.8) {
        feedback += 'Excellent text-background contrast. ';
      } else if (contrastScore > 0.5) {
        feedback += 'Acceptable contrast, but could be improved for better readability. ';
      } else {
        feedback += 'Poor contrast may cause readability issues. Consider adjusting colors. ';
      }
    }
    
    // Evaluate light direction and consistency
    if (design.shadows && this.useShadows) {
      const shadowConsistency = this.evaluateShadowConsistency(design.shadows);
      score += shadowConsistency * 0.3;
      
      if (shadowConsistency > 0.8) {
        feedback += 'Consistent light direction creates cohesive depth. ';
      } else if (shadowConsistency > 0.5) {
        feedback += 'Light direction could be more consistent. ';
      } else {
        feedback += 'Inconsistent shadows create confusing lighting scheme. ';
      }
    }
    
    // Additional light principle evaluations
    // (simplified for example)
    score = Math.min(score + 0.3, 1); // Ensure score is between 0-1
    
    return { score, feedback };
  }
  
  /**
   * Get light-based recommendations
   */
  public getRecommendations(context: any): string[] {
    const baseRecommendations = [
      `Ensure text has sufficient contrast with background (minimum ${this.minimumContrastRatio}:1 ratio)`,
      `Use consistent light source direction (${this.preferredLightDirection}) for all shadows`,
      'Consider using shadows to create depth hierarchy',
      'Balance bright and dark areas to create visual interest',
      'Use highlights strategically to draw attention to key elements'
    ];
    
    // Filter recommendations based on settings
    return baseRecommendations.filter(rec => {
      if (!this.useShadows && rec.includes('shadows')) return false;
      if (!this.useHighlights && rec.includes('highlights')) return false;
      return true;
    });
  }
  
  /**
   * Set the weight for this principle
   */
  public setWeight(weight: number): void {
    this.weight = weight;
  }
  
  /**
   * Get current weight
   */
  public getWeight(): number {
    return this.weight;
  }
  
  /**
   * Customize parameters for this principle
   */
  public customizeParameters(params: Record<string, any>): void {
    if (params.minimumContrastRatio !== undefined) {
      this.minimumContrastRatio = Math.max(1, Number(params.minimumContrastRatio) || 4.5);
    }
    
    if (params.preferredLightDirection !== undefined) {
      this.preferredLightDirection = params.preferredLightDirection;
    }
    
    if (params.useShadows !== undefined) {
      this.useShadows = Boolean(params.useShadows);
    }
    
    if (params.useHighlights !== undefined) {
      this.useHighlights = Boolean(params.useHighlights);
    }
  }
  
  /**
   * Helper method for optimal contrast
   */
  private calculateOptimalContrast(context: any): any {
    // Implementation for calculating optimal contrast
    return {
      recommendedTextColors: context.backgroundColor ? ['#000000', '#FFFFFF'] : [],
      minimumRatio: this.minimumContrastRatio
    };
  }
  
  /**
   * Helper method for brightness suggestions
   */
  private suggestBrightness(context: any): any {
    // Implementation for brightness suggestions
    return {
      recommendation: context.isDarkTheme ? 'Increase brightness of accent elements by 15%' : 'Maintain current brightness levels'
    };
  }
  
  /**
   * Helper method for shadow recommendations
   */
  private recommendShadows(context: any): any {
    // Implementation for shadow recommendations
    return {
      lightSource: this.preferredLightDirection,
      shadowColor: 'rgba(0,0,0,0.1)',
      elevation: {
        low: '0 1px 2px',
        medium: '0 2px 4px',
        high: '0 4px 8px'
      }
    };
  }
  
  /**
   * Helper method for highlight calculations
   */
  private calculateHighlights(context: any): any {
    // Implementation for highlight calculations
    return {
      highlightColor: 'rgba(255,255,255,0.8)',
      placement: this.preferredLightDirection.includes('top-left') ? 'top-left edges' : 'custom edges'
    };
  }
  
  /**
   * Evaluates contrast between two colors
   */
  private evaluateContrast(bg: string, text: string): number {
    // Simplified contrast evaluation
    return 0.75; // Mock implementation
  }
  
  /**
   * Evaluates consistency of shadows
   */
  private evaluateShadowConsistency(shadows: any[]): number {
    // Simplified shadow consistency evaluation
    return 0.8; // Mock implementation
  }
}
