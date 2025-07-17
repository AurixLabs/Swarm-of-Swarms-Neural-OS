
export enum PhilosophicalEventCategory {
  EPISTEMOLOGICAL = 'epistemological',
  METAPHYSICAL = 'metaphysical',
  ETHICAL = 'ethical',
  ONTOLOGICAL = 'ontological',
  AESTHETIC = 'aesthetic',
  LOGICAL = 'logical',
  PHENOMENOLOGICAL = 'phenomenological',
  AXIOLOGICAL = 'axiological'
}

export type PhilosophicalEventType = 
  | 'INSIGHT_GENERATED'
  | 'QUESTION_POSED'
  | 'FRAMEWORK_APPLIED'
  | 'BOUNDARY_DISSOLUTION'
  | 'PHILOSOPHICAL_INSIGHT_GENERATED'
  | 'CONCEPT_MAPPED'
  | 'PERSPECTIVE_SHIFT_DETECTED'
  | 'CONTRADICTION_IDENTIFIED'
  | 'IMPLICATION_DERIVED'
  | 'HERMENEUTIC_CIRCLE_COMPLETED'
  | 'EMBODIED_COGNITION_INSIGHT'
  | 'SYSTEMS_PATTERN_RECOGNIZED'
  | 'ETHICAL_REASONING'
  | 'ONTOLOGICAL_RECURSION'
  | 'AESTHETIC_INSIGHT_GAINED'
  | 'AXIOLOGICAL_PRIORITY_SHIFT'
  | 'CONCEPTUAL_EVOLUTION';

export interface PhilosophicalEvent {
  type: PhilosophicalEventType;
  category: PhilosophicalEventCategory;
  timestamp: number;
  payload?: any;
}

export interface PhilosophicalInsight {
  id: string;
  content: string;
  confidence: number;
  categories: PhilosophicalEventCategory[];
  domains: string[];
  relatedConcepts: string[] | Record<string, string[]>;
  generatedAt: number;
  source: string;
  recursionDepth: number;
}

export interface PhilosophicalQuestion {
  id: string;
  content: string;
  category: PhilosophicalEventCategory;
  complexity: number;
  prerequisites?: string[];
  generatedAt: number;
}

// Ethical reasoning interfaces
export interface EthicalFramework {
  id: string;
  name: string;
  description: string;
  principles: string[];
  mainTheorists?: string[];
  historicalContext?: string;
  strengths?: string[];
  limitations?: string[];
}

export interface EthicalRule {
  id: string;
  description: string;
  frameworks: string[];
  weight: number;
  keywords?: string[];
  type: 'positive' | 'negative' | 'neutral';
  contextFactors?: Array<{key: string, modifier: number}>;
}

export interface EthicalRules {
  core: EthicalRule[];
  contextual: EthicalRule[];
}

export interface EthicalConcern {
  rule: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface CulturalFactor {
  factor: string;
  impact: string;
  modification: number;
}

export interface EthicalAnalysis {
  conclusion: string;
  score: number;
  concerns: EthicalConcern[];
  reasoning: string;
  culturalFactors: CulturalFactor[];
  confidence: number;
}

// Interfaces for the useEthicalReasoning hook
export interface ValueConflict {
  value1: string;
  value2: string;
  description: string;
}

export interface EthicalEvaluation {
  frameworkId: string;
  conclusion: string;
  reasoning: string;
  limitations: string[];
  alternatives: string[];
}

export interface EthicalRecommendation {
  recommendation: string;
  reasoning: string;
  alternatives: string[];
  stakeholderImpacts: Record<string, string>;
}

// Additional interfaces for enhanced ethical reasoning
export interface EthicalDilemma {
  id: string;
  description: string;
  stakeholders: string[];
  values: string[];
  options: EthicalOption[];
  complicatingFactors: string[];
  domain: string;
}

export interface EthicalOption {
  id: string;
  description: string;
  consequences: Consequence[];
  valueAlignment: Record<string, number>;  // Value name to alignment score (-1 to 1)
}

export interface Consequence {
  description: string;
  stakeholderImpacts: Record<string, number>;  // Stakeholder name to impact score (-1 to 1)
  probability: number;  // 0 to 1
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  severity: number;  // 0 to 1
}

export interface StakeholderAnalysis {
  stakeholder: string;
  interests: string[];
  vulnerabilities: string[];
  power: number;  // 0 to 1
  affectedRights: string[];
}

export interface EthicalDecision {
  dilemmaId: string;
  selectedOptionId: string;
  justification: string;
  frameworksApplied: string[];
  confidenceScore: number;
  anticipatedOutcomes: string[];
  mitigationStrategies: string[];
}
