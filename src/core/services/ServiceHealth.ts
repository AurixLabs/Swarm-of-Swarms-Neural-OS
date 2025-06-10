
import { ServiceStatus, ServiceHealth } from '../types/ServiceTypes';

export class ServiceHealthManager {
  private healthStatus = new Map<string, ServiceHealth>();

  public initializeHealth(key: string): void {
    this.healthStatus.set(key, {
      status: 'HEALTHY',
      lastCheck: Date.now(),
      failureCount: 0
    });
  }

  public recordSuccess(key: string): void {
    const health = this.healthStatus.get(key);
    
    if (health) {
      health.status = 'HEALTHY';
      health.lastCheck = Date.now();
      health.failureCount = 0;
    }
  }

  public recordFailure(key: string, error: unknown): void {
    const health = this.healthStatus.get(key);
    
    if (health) {
      health.failureCount += 1;
      health.lastCheck = Date.now();
      
      if (health.failureCount >= 3) {
        health.status = 'UNHEALTHY';
      } else if (health.failureCount >= 1) {
        health.status = 'DEGRADED';
      }
      
      health.details = {
        lastError: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      };
    }
  }

  public getHealth(key: string): ServiceHealth | undefined {
    return this.healthStatus.get(key);
  }

  public getAllHealth(): Record<string, ServiceHealth> {
    const result: Record<string, ServiceHealth> = {};
    for (const [key, health] of this.healthStatus.entries()) {
      result[key] = health;
    }
    return result;
  }

  public setHealth(key: string, status: ServiceStatus, details?: Record<string, any>): void {
    const health = this.healthStatus.get(key);
    
    if (health) {
      health.status = status;
      health.lastCheck = Date.now();
      
      if (details) {
        health.details = details;
      }
    }
  }

  public removeHealth(key: string): void {
    this.healthStatus.delete(key);
  }

  public clear(): void {
    this.healthStatus.clear();
  }
}
