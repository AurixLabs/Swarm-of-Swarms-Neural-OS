
export interface FailoverEvent {
  failedKernelId: string;
  backupKernelId: string;
  timestamp: number;
}

export interface KernelHealthEvent {
  kernelId: string;
  healthy: boolean;
  reason?: string;
}

export type FailoverMap = Map<string, string[]>;
