
export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxConcurrentRequests: number;
}

export const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 60,
  maxConcurrentRequests: 5
};

export const FAILOVER_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 30,
  maxConcurrentRequests: 3
};
