
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ErrorRecord {
  message: string;
  stack?: string;
  timestamp: number;
  component?: string;
  handled: boolean;
  severity: ErrorSeverity;
}

export interface RecoveryStrategy {
  id: string;
  condition: (error: ErrorRecord) => boolean;
  action: (error: ErrorRecord) => Promise<boolean>;
  priority: number;
}
