
import { DesignPrincipleKernel } from '../DesignKernel';

export class WhitespaceKernel implements DesignPrincipleKernel {
  public id = 'whitespace';
  public name = 'White Space Principle';
  private weight: number = 1.0;
  private whitespaceTypes: string[] = ['active'];
  private whitespaceRatio: number = 0.4;

  public applyPrinciple(context: any): any {
    return {
      whitespaceTypes: this.whitespaceTypes,
      whitespaceRatio: this.whitespaceRatio,
      whitespaceAnalysis: this.analyzeWhitespace(context)
    };
  }

  public evaluateDesign(design: any): { score: number; feedback: string } {
    let score = 0.8;
    let feedback = 'Strategic white space creates breathing room and improves readability.';
    
    return { score, feedback };
  }

  public getRecommendations(context: any): string[] {
    return [
      'Use active white space to direct user attention',
      'Balance content with adequate negative space',
      'Create visual hierarchy through white space'
    ];
  }

  public setWeight(weight: number): void {
    this.weight = Math.max(0, Math.min(2, weight));
  }

  public getWeight(): number {
    return this.weight;
  }

  public customizeParameters(params: Record<string, any>): void {
    if (params.whitespaceTypes !== undefined) {
      this.whitespaceTypes = Array.isArray(params.whitespaceTypes) 
        ? params.whitespaceTypes.slice(0, 3) 
        : ['active'];
    }
    if (params.whitespaceRatio !== undefined) {
      this.whitespaceRatio = Math.max(0, Math.min(1, Number(params.whitespaceRatio)));
    }
  }

  private analyzeWhitespace(context: any): any {
    return {
      activeWhitespaceScore: this.whitespaceTypes.includes('active') ? 0.7 : 0,
      passiveWhitespaceScore: this.whitespaceTypes.includes('passive') ? 0.6 : 0,
      whitespaceRatio: this.whitespaceRatio
    };
  }
}

