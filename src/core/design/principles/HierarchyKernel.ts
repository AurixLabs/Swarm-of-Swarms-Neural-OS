
import { DesignPrincipleKernel } from '../DesignKernel';

export class HierarchyKernel implements DesignPrincipleKernel {
  public id = 'hierarchy';
  public name = 'Hierarchy Principle';
  private weight: number = 1.0;
  private hierarchyMethods: string[] = ['size', 'color'];
  private layerCount: number = 3;

  public applyPrinciple(context: any): any {
    return {
      hierarchyMethods: this.hierarchyMethods,
      layerCount: this.layerCount,
      hierarchyAnalysis: this.analyzeHierarchy(context)
    };
  }

  public evaluateDesign(design: any): { score: number; feedback: string } {
    let score = 0.8;
    let feedback = 'Hierarchy organizes elements by importance and guides user attention.';
    
    return { score, feedback };
  }

  public getRecommendations(context: any): string[] {
    return [
      'Use size variation to highlight important elements',
      'Apply color contrast to create visual hierarchy',
      'Position key elements strategically'
    ];
  }

  public setWeight(weight: number): void {
    this.weight = Math.max(0, Math.min(2, weight));
  }

  public getWeight(): number {
    return this.weight;
  }

  public customizeParameters(params: Record<string, any>): void {
    if (params.hierarchyMethods !== undefined) {
      this.hierarchyMethods = Array.isArray(params.hierarchyMethods) 
        ? params.hierarchyMethods.slice(0, 3) 
        : ['size', 'color'];
    }
    if (params.layerCount !== undefined) {
      this.layerCount = Math.max(1, Math.min(5, Number(params.layerCount)));
    }
  }

  private analyzeHierarchy(context: any): any {
    return {
      sizeHierarchy: this.hierarchyMethods.includes('size') ? 0.7 : 0,
      colorHierarchy: this.hierarchyMethods.includes('color') ? 0.8 : 0,
      positionLayers: Array(this.layerCount).fill(null).map((_, i) => ({
        layer: i + 1,
        importance: 1 - (i * 0.2)
      }))
    };
  }
}

