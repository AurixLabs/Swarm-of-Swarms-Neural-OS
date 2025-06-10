
// Unified SystemEvent types
export interface SystemEvent {
  id: string;
  type: string;
  timestamp: number;
  source: string;
  data: any;
  metadata?: {
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
    temporalKey?: string;
    kernelId?: string;
  };
}

export interface KernelEvent extends SystemEvent {
  kernelId: string;
  kernelType: string;
}

export interface TemporalSystemEvent extends SystemEvent {
  temporalDimension?: string;
  temporalKey: string;
  stateSnapshot?: any;
}

export interface ErrorEvent extends SystemEvent {
  error: Error | string;
  stackTrace?: string;
  context?: any;
}

export interface PerformanceEvent extends SystemEvent {
  metrics: {
    duration?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    [key: string]: any;
  };
}
