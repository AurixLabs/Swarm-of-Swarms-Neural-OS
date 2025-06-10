
import { DesignPrincipleKernel } from '../DesignKernel';

export class BalanceKernel implements DesignPrincipleKernel {
  public id = 'balance';
  public name = 'Balance Principle';
  private weight: number = 1.0;
  private symmetrical: boolean = true;
  private radialBalance: boolean = false;

  public applyPrinciple(context: any): any {
    return {
      balanceType: this.symmetrical ? 'symmetrical' : 'asymmetrical',
      radialEnabled: this.radialBalance,
      weightDistribution: this.calculateWeightDistribution(context)
    };
  }

  public evaluateDesign(design: any): { score: number; feedback: string } {
    let score = 0.7; // Default score
    let feedback = 'Balance is well-maintained with even distribution of elements.';
    
    return { score, feedback };
  }

  public getRecommendations(context: any): string[] {
    return [
      'Consider symmetrical balance for formal designs',
      'Use asymmetrical balance for dynamic layouts',
      'Distribute visual weight evenly across the composition'
    ];
  }

  public setWeight(weight: number): void {
    this.weight = Math.max(0, Math.min(2, weight));
  }

  public getWeight(): number {
    return this.weight;
  }

  public customizeParameters(params: Record<string, any>): void {
    if (params.symmetrical !== undefined) {
      this.symmetrical = Boolean(params.symmetrical);
    }
    if (params.radialBalance !== undefined) {
      this.radialBalance = Boolean(params.radialBalance);
    }
  }

  private calculateWeightDistribution(context: any): any {
    return {
      left: 0.5,
      right: 0.5,
      top: 0.5,
      bottom: 0.5
    };
  }
}
