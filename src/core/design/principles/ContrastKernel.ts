
import { DesignPrincipleKernel } from '../DesignKernel';

export class ContrastKernel implements DesignPrincipleKernel {
  public id = 'contrast';
  public name = 'Contrast Principle';
  private weight: number = 1.0;
  private contrastTypes: string[] = ['color', 'size'];
  private contrastIntensity: number = 0.6;

  public applyPrinciple(context: any): any {
    return {
      contrastTypes: this.contrastTypes,
      contrastIntensity: this.contrastIntensity,
      contrastAnalysis: this.analyzeContrast(context)
    };
  }

  public evaluateDesign(design: any): { score: number; feedback: string } {
    let score = 0.8;
    let feedback = 'Contrast helps differentiate and highlight key design elements.';
    
    return { score, feedback };
  }

  public getRecommendations(context: any): string[] {
    return [
      'Use contrasting colors to create visual interest',
      'Vary element sizes to establish hierarchy',
      'Create contrast through texture and shape differences'
    ];
  }

  public setWeight(weight: number): void {
    this.weight = Math.max(0, Math.min(2, weight));
  }

  public getWeight(): number {
    return this.weight;
  }

  public customizeParameters(params: Record<string, any>): void {
    if (params.contrastTypes !== undefined) {
      this.contrastTypes = Array.isArray(params.contrastTypes) 
        ? params.contrastTypes.slice(0, 3) 
        : ['color', 'size'];
    }
    if (params.contrastIntensity !== undefined) {
      this.contrastIntensity = Math.max(0, Math.min(1, Number(params.contrastIntensity)));
    }
  }

  private analyzeContrast(context: any): any {
    return {
      colorContrast: this.contrastTypes.includes('color') ? 0.7 : 0,
      sizeContrast: this.contrastTypes.includes('size') ? 0.6 : 0
    };
  }
}

