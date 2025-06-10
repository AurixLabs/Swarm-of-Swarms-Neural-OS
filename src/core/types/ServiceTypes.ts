
export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
export type CircuitStatus = 'OPEN' | 'CLOSED' | 'HALF_OPEN';

export interface ServiceHealth {
  status: ServiceStatus;
  lastCheck: number;
  failureCount: number;
  details?: Record<string, any>;
}

export interface CircuitBreaker {
  status: CircuitStatus;
  failureThreshold: number;
  failureCount: number;
  resetTimeout: number;
  lastStatusChange: number;
}
