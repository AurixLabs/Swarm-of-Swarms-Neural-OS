
// CMA Neural OS - Core Types with Enhanced Loop Prevention
export interface SystemStatus {
  core: 'active' | 'inactive' | 'error';
  kernels: KernelStatus[];
  timestamp: number;
}

export interface KernelStatus {
  kernelId: string;
  kernelType: 'system' | 'ai' | 'security' | 'network' | 'ethics';
  status: 'ACTIVE' | 'INITIALIZING' | 'ERROR';
  lastHeartbeat: number;
}

export interface SystemConfig {
  environment: 'development' | 'production';
  version: string;
  debug: boolean;
  kernelCount: number;
  loopDetection: boolean;
}

export const SYSTEM_INFO = {
  name: 'CMA Neural OS',
  version: '1.0.0-enhanced-loop-protection',
  architecture: 'Pure System Architecture with Enhanced Loop Detection',
  build: Date.now(),
  environment: import.meta.env.MODE || 'development',
  loopProtection: true
} as const;

export type SystemInfo = typeof SYSTEM_INFO;

// Enhanced global types for loop detection
declare global {
  interface Window {
    __CMA_SYSTEM_STARTED__?: boolean;
    __CMA_SYSTEM_FAILED__?: boolean;
    __CMA_INITIALIZATION_IN_PROGRESS__?: boolean;
  }
}
