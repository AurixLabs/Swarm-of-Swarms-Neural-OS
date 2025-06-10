
export type RegulatoryEvent = 
  | { type: 'POLICY_UPDATED'; payload: any }
  | { type: 'INTEGRITY_VIOLATION'; payload: any }
  | { type: 'ETHICS_ALERT'; payload: any }
  | { type: 'REGULATORY_ERROR'; payload: any }
  | { type: 'REGULATORY_WARN'; payload: any }
  | { type: 'REGULATORY_INFO'; payload: any }
  | { type: 'ANIMAL_ETHICS_CONCERN'; payload: any }
  | { type: 'ANIMAL_WELFARE_ALERT'; payload: any }
  | { type: 'CULTURAL_OVERRIDE_APPLIED'; payload: any }
  | { type: 'WELFARE_PRIORITY_ENFORCED'; payload: any }
  | { type: 'SENTIENCE_RECOGNITION_EVENT'; payload: any };

export interface ComplianceReport {
  timestamp: number;
  policyId: string;
  result: 'compliant' | 'violation' | 'warning';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  integrityProof?: string;
}

// New immutable system interfaces
export interface ImmutableConstraint {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  integrityHash: string;
  verifyIntegrity(): boolean;
}

export interface EthicalProgressVector {
  vectorId: string;
  direction: 'positive' | 'neutral' | 'negative';
  confidence: number;
  metrics: Record<string, number>;
  timestamp: number;
  previousVectorHash?: string;
}

// New interfaces for ethical evolution
export interface EthicalEvolutionProposal {
  id: string;
  title: string;
  description: string;
  proposedBy: string;
  proposedAt: number;
  integrityHash: string;
  impacts: EthicalImpactAssessment[];
  status: 'proposed' | 'under_review' | 'approved' | 'rejected';
  culturalContext?: CulturalContext[];
  animalWelfareConsiderations?: AnimalWelfareConsideration[];
  sentienceConsiderations?: SentienceConsideration[];
}

export interface EthicalImpactAssessment {
  dimensionId: string;
  dimensionName: string;
  currentValue: number;
  projectedValue: number;
  confidenceScore: number;
  justification: string;
}

// Add collective wisdom assessment for ethical evolution
export interface CollectiveEthicalConsensus {
  proposalId: string;
  assessments: Array<{
    assessorId: string;
    agreement: number; // Scale from -1 (strong disagree) to 1 (strong agree)
    reasoning: string;
    timestamp: number;
  }>;
  consensusScore: number;
  threshold: number;
  meetsThreshold: boolean;
}

// New interface for cultural context in ethical considerations
export interface CulturalContext {
  cultureId: string;
  cultureName: string;
  perspective: string;
  relevance: number; // 0-1 scale of how relevant this cultural context is
  considerations: string;
  alternateFramings?: string[];
}

// Cultural adaptation strategy
export interface CulturalAdaptationStrategy {
  id: string;
  name: string;
  description: string;
  cultures: string[];
  adaptationPrinciples: string[];
  applicationGuidelines: string;
  integrityHash: string;
}

// New interfaces for animal welfare considerations with priority levels
export interface AnimalWelfareConsideration {
  speciesId: string;
  speciesName: string;
  welfareImpact: 'beneficial' | 'neutral' | 'harmful' | 'severely_harmful';
  justification: string;
  culturalContext?: string[];
  alternativeApproaches?: string[];
  scientificEvidence?: string;
  overridesCulturalTradition: boolean; // New field to indicate when welfare overrides tradition
}

export interface AnimalWelfarePolicy {
  id: string;
  name: string;
  description: string;
  applicability: 'universal' | 'contextual' | 'aspirational';
  culturalContexts: string[];
  implementation: 'immediate' | 'gradual' | 'educational';
  integrityHash: string;
  priority: 'standard' | 'elevated' | 'critical'; // New field for priority level
}

// New interfaces for broader sentience recognition at the same level as animal welfare
export interface SentienceConsideration {
  entityId: string;
  entityName: string;
  entityType: 'animal' | 'ecological_system' | 'emergent_intelligence' | 'other';
  sentienceEvidence: SentienceEvidence;
  ethicalImplications: string[];
  recommendedPractices: string[];
  overridesCulturalTradition: boolean;
}

export interface SentienceEvidence {
  confidenceLevel: number; // 0-1 scale
  neuralComplexity: number; // 0-1 scale
  behavioralIndicators: string[];
  scientificConsensus: 'strong' | 'moderate' | 'emerging' | 'theoretical';
  keyResearch: string[];
}

export interface SentienceRecognitionPolicy {
  id: string;
  name: string;
  description: string;
  entityTypes: ('animal' | 'ecological_system' | 'emergent_intelligence' | 'other')[];
  ethicalImplications: string;
  implementationGuidelines: string;
  integrityHash: string;
  priority: 'standard' | 'elevated' | 'critical';
}

export interface SpeciesConsideration {
  speciesId: string;
  speciesName: string;
  sentience: number; // 0-1 scale of assessed sentience level
  culturalSignificance: Record<string, number>; // Cultural ID to significance mapping
  sustainabilityImpact: number; // -1 to 1 scale (negative to positive)
  welfareAssessment: {
    currentPractices: number; // 0-1 scale of welfare in current practices
    potentialImprovements: string[];
    ethicalThreshold: number; // Minimum acceptable welfare standard
  };
}

// New interface for ethical hierarchy
export interface EthicalPriorityRule {
  id: string;
  name: string;
  description: string;
  condition: 'always' | 'conditional';
  priority: number; // Higher number means higher priority
  overrides: string[]; // List of ethical dimensions this rule can override
}

// New interface for comprehensive sentience recognition mapping
export interface SentienceMap {
  id: string;
  createdAt: number;
  updatedAt: number;
  entities: SentienceEntity[];
  integrityHash: string;
}

export interface SentienceEntity {
  id: string;
  name: string;
  category: 'mammal' | 'bird' | 'fish' | 'reptile' | 'amphibian' | 'invertebrate' | 'plant' | 'fungus' | 'ecological_system' | 'other';
  sentienceScore: number; // 0-1 scale
  evidenceStrength: 'conclusive' | 'strong' | 'moderate' | 'limited' | 'theoretical';
  ethicalConsiderations: string[];
  protectionLevel: 'critical' | 'high' | 'moderate' | 'basic' | 'monitoring';
}
