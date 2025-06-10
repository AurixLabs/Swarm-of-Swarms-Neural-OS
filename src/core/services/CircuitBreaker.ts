
import { CircuitStatus, CircuitBreaker } from '../types/ServiceTypes';

export class CircuitBreakerManager {
  private circuitBreakers = new Map<string, CircuitBreaker>();

  public initializeBreaker(key: string): void {
    this.circuitBreakers.set(key, {
      status: 'CLOSED',
      failureThreshold: 5,
      failureCount: 0,
      resetTimeout: 30000, // 30 seconds
      lastStatusChange: Date.now()
    });
  }

  public checkBreaker(key: string): void {
    const circuitBreaker = this.circuitBreakers.get(key);
    if (!circuitBreaker) return;
    
    if (circuitBreaker.status === 'OPEN') {
      const elapsedTime = Date.now() - circuitBreaker.lastStatusChange;
      
      if (elapsedTime > circuitBreaker.resetTimeout) {
        circuitBreaker.status = 'HALF_OPEN';
        circuitBreaker.lastStatusChange = Date.now();
      } else {
        throw new Error(`Circuit breaker open for service: ${key}`);
      }
    }
  }

  public recordSuccess(key: string): void {
    const circuitBreaker = this.circuitBreakers.get(key);
    
    if (circuitBreaker) {
      if (circuitBreaker.status === 'HALF_OPEN') {
        circuitBreaker.status = 'CLOSED';
        circuitBreaker.lastStatusChange = Date.now();
      }
      circuitBreaker.failureCount = 0;
    }
  }

  public recordFailure(key: string): void {
    const circuitBreaker = this.circuitBreakers.get(key);
    
    if (circuitBreaker) {
      circuitBreaker.failureCount += 1;
      
      if (circuitBreaker.failureCount >= circuitBreaker.failureThreshold) {
        circuitBreaker.status = 'OPEN';
        circuitBreaker.lastStatusChange = Date.now();
      }
    }
  }

  public configure(
    key: string,
    config: {
      failureThreshold?: number;
      resetTimeout?: number;
    }
  ): void {
    const circuitBreaker = this.circuitBreakers.get(key);
    if (circuitBreaker) {
      if (config.failureThreshold !== undefined) {
        circuitBreaker.failureThreshold = config.failureThreshold;
      }
      if (config.resetTimeout !== undefined) {
        circuitBreaker.resetTimeout = config.resetTimeout;
      }
    }
  }

  public getStatus(key: string): CircuitStatus | undefined {
    return this.circuitBreakers.get(key)?.status;
  }

  public removeBreaker(key: string): void {
    this.circuitBreakers.delete(key);
  }

  public clear(): void {
    this.circuitBreakers.clear();
  }
}
