
import { DesignPrincipleKernel } from '../DesignKernel';

export class RhythmKernel implements DesignPrincipleKernel {
  public id = 'rhythm';
  public name = 'Rhythm Principle';
  private weight: number = 1.0;
  private repeatCount: number = 3;
  private rhythmType: 'regular' | 'flowing' | 'progressive' = 'regular';

  public applyPrinciple(context: any): any {
    return {
      repeatCount: this.repeatCount,
      rhythmType: this.rhythmType,
      sequencePattern: this.generateRhythmPattern(context)
    };
  }

  public evaluateDesign(design: any): { score: number; feedback: string } {
    let score = 0.7; // Default score
    let feedback = 'Rhythm creates a sense of organized movement in the design.';
    
    return { score, feedback };
  }

  public getRecommendations(context: any): string[] {
    return [
      'Use repetition to create visual rhythm',
      'Vary element sizes to create progressive rhythm',
      'Consider alternating element placement for dynamic flow'
    ];
  }

  public setWeight(weight: number): void {
    this.weight = Math.max(0, Math.min(2, weight));
  }

  public getWeight(): number {
    return this.weight;
  }

  public customizeParameters(params: Record<string, any>): void {
    if (params.repeatCount !== undefined) {
      this.repeatCount = Math.max(1, Math.min(5, Number(params.repeatCount)));
    }
    if (params.rhythmType !== undefined) {
      this.rhythmType = ['regular', 'flowing', 'progressive'].includes(params.rhythmType) 
        ? params.rhythmType 
        : 'regular';
    }
  }

  private generateRhythmPattern(context: any): any {
    return {
      elements: Array(this.repeatCount).fill({}).map((_, index) => ({
        position: index,
        variation: this.rhythmType
      }))
    };
  }
}

