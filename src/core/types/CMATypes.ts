
// Types for Cognitive Modular Architecture

export type CognitiveVerificationType = 
  'KNOWLEDGE_QUESTION' | 
  'REASONING_PATTERN' | 
  'ETHICS_ALIGNMENT' | 
  'MEMORY_ASSOCIATION' | 
  'PHILOSOPHICAL_STANCE' | 
  'CREATIVE_SIGNATURE' | 
  'LINGUISTIC_PATTERN' | 
  'DECISION_MAKING_STYLE';

export interface CognitiveSystemState {
  activeKernels: string[];
  cognitiveLoad: number;
  attentionFocus: string[];
  memoryAccess: {
    episodic: boolean;
    semantic: boolean;
    procedural: boolean;
  };
  securityLevel: 'normal' | 'elevated' | 'critical';
  timestamp: number;
}

export interface KernelHealthStatus {
  kernelId: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  metrics: {
    memoryUsage: number;
    responseTime: number;
    errorRate: number;
    lastHealthCheck: number;
  };
  dependencies: string[];
}

export interface CMADiagnostics {
  systemUptime: number;
  activeKernels: number;
  memoryUtilization: number;
  processingLatency: number;
  errorCount: number;
  lastDiagnosticRun: number;
}

// Add missing types needed by other parts of the application
export interface CMAEvent {
  type: string;
  payload: any;
  timestamp?: number;
  source?: string;
  id?: string; // Add missing property
}

export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export interface SystemEvent {
  type: string;
  payload: any;
  priority?: EventPriority;
  timestamp?: number;
}
