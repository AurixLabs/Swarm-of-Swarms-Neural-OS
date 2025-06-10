
import { DesignPrincipleKernel } from '../DesignKernel';

export class UnityKernel implements DesignPrincipleKernel {
  public id = 'unity';
  public name = 'Unity Principle';
  private weight: number = 1.0;
  private unityMethods: string[] = ['proximity', 'alignment'];
  private cohesiveness: number = 0.7;

  public applyPrinciple(context: any): any {
    return {
      unityMethods: this.unityMethods,
      cohesiveness: this.cohesiveness,
      unityAnalysis: this.analyzeUnity(context)
    };
  }

  public evaluateDesign(design: any): { score: number; feedback: string } {
    let score = 0.85;
    let feedback = 'Unity creates a sense of wholeness and coherence in the design.';
    
    return { score, feedback };
  }

  public getRecommendations(context: any): string[] {
    return [
      'Group related elements together',
      'Use consistent alignment across design',
      'Create visual connections between design elements'
    ];
  }

  public setWeight(weight: number): void {
    this.weight = Math.max(0, Math.min(2, weight));
  }

  public getWeight(): number {
    return this.weight;
  }

  public customizeParameters(params: Record<string, any>): void {
    if (params.unityMethods !== undefined) {
      this.unityMethods = Array.isArray(params.unityMethods) 
        ? params.unityMethods.slice(0, 3) 
        : ['proximity', 'alignment'];
    }
    if (params.cohesiveness !== undefined) {
      this.cohesiveness = Math.max(0, Math.min(1, Number(params.cohesiveness)));
    }
  }

  private analyzeUnity(context: any): any {
    return {
      proximityScore: this.unityMethods.includes('proximity') ? 0.7 : 0,
      alignmentScore: this.unityMethods.includes('alignment') ? 0.8 : 0
    };
  }
}

