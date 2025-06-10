
import { PhilosophicalKernel } from '../PhilosophicalKernel';

export interface KernelRegistryState {
  kernels: Map<string, any>;
}

export type KernelType = 
  | 'system'
  | 'ai'
  | 'memory'
  | 'security'
  | 'collaborative'
  | 'regulatory'
  | 'ui'
  | 'ethicalReasoning';

export interface KernelConfiguration {
  id: string;
  type: KernelType;
  dependencies?: string[];
  immutable?: boolean;   // Added to support immutable kernels like ethical reasoning
}

export interface KernelRecommendation {
  recommendedKernels: string[];
  setupComplexity: 'low' | 'medium' | 'high';
  focus: string;
}

// Kernel elegance evaluation interfaces
export interface KernelMergeAnalysis {
  primaryKernel: string;
  secondaryKernel: string;
  overlapPercentage: number;
  mergeComplexity: 'low' | 'medium' | 'high';
  benefits: string[];
  risks: string[];
}

export interface KernelEleganceReport {
  redundantKernels: string[];
  overlappingFunctionality: {
    [key: string]: string[];
  };
  mergeRecommendations: KernelMergeAnalysis[];
  eleganceScore: number; // 0-100
}
