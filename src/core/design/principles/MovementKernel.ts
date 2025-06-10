
import { DesignPrincipleKernel } from '../DesignKernel';

export class MovementKernel implements DesignPrincipleKernel {
  public id = 'movement';
  public name = 'Movement Principle';
  private weight: number = 1.0;
  private movementType: 'linear' | 'circular' | 'diagonal' = 'linear';
  private directionality: number = 0.5; // 0-1 range, controls flow intensity

  public applyPrinciple(context: any): any {
    return {
      movementType: this.movementType,
      directionality: this.directionality,
      guidancePoints: this.calculateGuidancePoints(context)
    };
  }

  public evaluateDesign(design: any): { score: number; feedback: string } {
    let score = 0.75;
    let feedback = 'Movement guides the viewer\'s eye through the design.';
    
    return { score, feedback };
  }

  public getRecommendations(context: any): string[] {
    return [
      'Use leading lines to create visual movement',
      'Arrange elements to guide the viewer\'s eye',
      'Create dynamic compositions with varied element placement'
    ];
  }

  public setWeight(weight: number): void {
    this.weight = Math.max(0, Math.min(2, weight));
  }

  public getWeight(): number {
    return this.weight;
  }

  public customizeParameters(params: Record<string, any>): void {
    if (params.movementType !== undefined) {
      this.movementType = ['linear', 'circular', 'diagonal'].includes(params.movementType) 
        ? params.movementType 
        : 'linear';
    }
    if (params.directionality !== undefined) {
      this.directionality = Math.max(0, Math.min(1, Number(params.directionality)));
    }
  }

  private calculateGuidancePoints(context: any): any {
    return {
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 1, y: 1 },
      type: this.movementType
    };
  }
}

