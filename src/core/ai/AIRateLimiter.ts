
import { RateLimitConfig, DEFAULT_CONFIG, FAILOVER_CONFIG } from './AIRateLimiterConfig';

export class AIRateLimiter {
  private static instance: AIRateLimiter;
  private requestCount: number = 0;
  private activeRequests: number = 0;
  private requestQueue: Array<() => Promise<void>> = [];
  private lastResetTime: number = Date.now();
  private inFailoverMode: boolean = false;
  private config: RateLimitConfig = DEFAULT_CONFIG;

  private constructor() {
    this.resetCounters();
  }

  public static getInstance(): AIRateLimiter {
    if (!this.instance) {
      this.instance = new AIRateLimiter();
    }
    return this.instance;
  }

  private resetCounters(): void {
    setInterval(() => {
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }, 60000);
  }

  public async acquireToken(): Promise<boolean> {
    if (this.canProcess()) {
      this.requestCount++;
      this.activeRequests++;
      return true;
    }

    return new Promise((resolve) => {
      this.requestQueue.push(async () => {
        resolve(true);
      });
    });
  }

  public releaseToken(): void {
    this.activeRequests--;
    
    if (this.requestQueue.length > 0 && this.canProcess()) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) nextRequest();
    }
  }

  public setFailoverMode(active: boolean): void {
    this.inFailoverMode = active;
    this.config = active ? FAILOVER_CONFIG : DEFAULT_CONFIG;
  }

  private canProcess(): boolean {
    const currentLimit = this.inFailoverMode ? 
      this.config.maxRequestsPerMinute / 2 : 
      this.config.maxRequestsPerMinute;
      
    return this.requestCount < currentLimit && 
           this.activeRequests < this.config.maxConcurrentRequests;
  }

  public getMetrics() {
    return {
      requestCount: this.requestCount,
      activeRequests: this.activeRequests,
      queueLength: this.requestQueue.length,
      inFailoverMode: this.inFailoverMode
    };
  }
}

export const aiRateLimiter = AIRateLimiter.getInstance();
