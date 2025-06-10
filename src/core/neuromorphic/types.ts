
export interface NeuromorphicResult {
  output: number[];
  confidence: number;
  energyUsed: number;
  latency: number;
  metadata?: {
    spikeCount?: number;
    networkActivity?: number;
    processingMode?: string;
    intent?: string;
    sentiment?: string;
    entities?: Array<{ type: string; value: string }>;
    objects?: Array<{ label: string; confidence: number }>;
    scene?: string;
    spikePatterns?: number[];
  };
}

export interface ProcessingOptions {
  spikeThreshold?: number;
  learningRate?: number;
  temporalWindow?: number;
  enableSTDP?: boolean;
  energyOptimization?: boolean;
}

export interface NeuralInputType {
  type: 'text' | 'vision' | 'audio' | 'multimodal';
  data: any;
}

export interface STDPConfig {
  enabled: boolean;
  learningRate: number;
  potentiationWindow: number;
  depressionWindow: number;
  maxWeight: number;
  minWeight: number;
  weightDecay?: number;
}

export enum STDPLearningRule {
  SYMMETRIC = 'symmetric',
  ASYMMETRIC = 'asymmetric',
  TRIPLET = 'triplet',
  VOLTAGE_DEPENDENT = 'voltage_dependent'
}

export interface STDPModulation {
  dopamine: number;      // Reward signal (0-1)
  acetylcholine: number; // Attention signal (0-1)
  norepinephrine: number; // Novelty signal (0-1)
  serotonin: number;     // Mood signal (0-1)
}

export interface AdvancedLearningParams {
  stdpRule: STDPLearningRule;
  modulation: STDPModulation;
  heterosynapticEnabled: boolean;
  metaplasticityEnabled: boolean;
  structuralPlasticityEnabled: boolean;
}
