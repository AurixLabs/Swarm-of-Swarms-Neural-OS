
import { KernelRecommendation, KernelType } from '../types/KernelTypes';

export const generateKernelComplexityScore = (totalKernels: number): number => {
  return Math.min(totalKernels * 2, 10);
};

export const getRecommendedKernels = (useCase: string): KernelType[] => {
  const recommendations: Record<string, KernelType[]> = {
    'startup': ['system', 'ai', 'memory'],
    'enterprise': ['system', 'ai', 'security', 'memory', 'collaborative'],
    'non-profit': ['system', 'memory', 'collaborative', 'ai'],
    'default': ['system', 'ai', 'memory']
  };
  
  return recommendations[useCase as keyof typeof recommendations] || recommendations['default'];
};

export const getKernelWizardConfig = (businessType: string): KernelRecommendation => {
  const wizardRecommendations: Record<string, KernelRecommendation> = {
    'startup': {
      recommendedKernels: ['system', 'ai', 'memory'],
      setupComplexity: 'low',
      focus: 'speed'
    },
    'enterprise': {
      recommendedKernels: ['system', 'ai', 'security', 'memory', 'collaborative'],
      setupComplexity: 'medium',
      focus: 'reliability'
    },
    'non-profit': {
      recommendedKernels: ['system', 'ai', 'collaborative', 'memory'],
      setupComplexity: 'medium',
      focus: 'collaboration'
    }
  };

  return wizardRecommendations[businessType] || wizardRecommendations['startup'];
};

// Helper for kernel consolidation analysis
export const analyzeKernelOverlap = (kernels: string[]): { 
  potentialMerges: Array<{kernels: string[], reason: string}>,
  noOverlap: string[]
} => {
  // This is a simplified analysis - a real implementation would be more sophisticated
  const potentialMerges: Array<{kernels: string[], reason: string}> = [
    {
      kernels: ['regulatory', 'socialJustice'],
      reason: 'Both handle policy enforcement and value-based constraints'
    },
    {
      kernels: ['collaborative', 'ui'],
      reason: 'UI often handles collaborative elements; could be simplified'
    }
  ];
  
  const noOverlap = ['system', 'ai', 'memory', 'security'];
  
  return { potentialMerges, noOverlap };
};
