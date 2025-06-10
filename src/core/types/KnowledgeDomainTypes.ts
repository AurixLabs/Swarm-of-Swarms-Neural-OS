
/**
 * Knowledge Domain Types
 */

export interface KnowledgeCapability {
  id: string;
  name: string;
  description?: string;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  reliability: number;
  url?: string;
}

export interface KnowledgeResponse {
  answer: string;
  confidence: number;
  sources?: KnowledgeSource[];
  relatedConcepts?: string[];
  metadata?: Record<string, any>;
}

export interface KnowledgeDomain {
  id: string;
  name: string;
  type?: string;
  concepts?: string[];
  sources?: KnowledgeSource[] | string[];
  weight?: number;
  initialize: () => boolean;
  isInitialized: () => boolean;
  getWeight?: () => number;
  setWeight?: (weight: number) => void;
  getState: (key: string) => any;
  setState: (key: string, value: any) => void;
  shutdown?: () => void;
  query?: (question: string, context?: any) => Promise<KnowledgeResponse>;
  getCapabilities?: () => KnowledgeCapability[];
}

export interface KnowledgeEngineConfig {
  domains?: {
    id: string;
    weight: number;
    enabled: boolean;
  }[];
  enabledDomains?: string[];
  domainWeights?: Record<string, number>;
  confidence?: {
    threshold: number;
    fallbackAction: 'best_guess' | 'abstain' | 'human';
  };
  globalSettings?: {
    maxSources: number;
    defaultQueryTimeout: number;
    enableCrossReferences: boolean;
    crossDomainSynthesis?: boolean;
    defaultConfidenceThreshold?: number;
    adaptiveWeighting?: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}
