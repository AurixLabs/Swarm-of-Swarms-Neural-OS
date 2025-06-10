
import { EventEmitter } from 'events';

interface Service {
  id: string;
  name: string;
  version: string;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

interface ServiceOptions {
  dependencies?: string[];
  autoStart?: boolean;
  retryCount?: number;
  timeout?: number;
}

type ServiceStatus = 'idle' | 'starting' | 'running' | 'error' | 'shutdown';

interface ServiceHealth {
  id: string;
  status: ServiceStatus;
  lastChecked: number;
  errors: string[];
  metrics: Record<string, number>;
}

class ServiceContainer {
  private services = new Map<string, Service>();
  private serviceOptions = new Map<string, ServiceOptions>();
  private serviceStatus = new Map<string, ServiceStatus>();
  private serviceHealth = new Map<string, ServiceHealth>();
  private events = new EventEmitter();
  private healthCheckInterval: number | null = null;
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly DEFAULT_RETRY_COUNT = 3;
  
  constructor() {
    this.startHealthCheck();
  }
  
  /**
   * Register a service with the container
   */
  public register(service: Service, options: ServiceOptions = {}): void {
    if (this.services.has(service.id)) {
      throw new Error(`Service with ID '${service.id}' is already registered`);
    }
    
    // Initialize defaults
    const fullOptions: ServiceOptions = {
      dependencies: [],
      autoStart: true,
      retryCount: this.DEFAULT_RETRY_COUNT,
      timeout: this.DEFAULT_TIMEOUT,
      ...options
    };
    
    // Store service and its options
    this.services.set(service.id, service);
    this.serviceOptions.set(service.id, fullOptions);
    this.serviceStatus.set(service.id, 'idle');
    this.serviceHealth.set(service.id, {
      id: service.id,
      status: 'idle',
      lastChecked: Date.now(),
      errors: [],
      metrics: {}
    });
    
    // Start service if autoStart is true
    if (fullOptions.autoStart) {
      this.startService(service.id).catch(err => {
        console.error(`Failed to auto-start service '${service.id}':`, err);
      });
    }
    
    this.events.emit('service:registered', { serviceId: service.id });
  }
  
  /**
   * Start a service and its dependencies
   */
  public async startService(serviceId: string): Promise<void> {
    if (!this.services.has(serviceId)) {
      throw new Error(`Service '${serviceId}' is not registered`);
    }
    
    const status = this.serviceStatus.get(serviceId);
    if (status === 'running') {
      return; // Already running
    }
    
    // Update status to starting
    this.serviceStatus.set(serviceId, 'starting');
    this.events.emit('service:starting', { serviceId });
    
    const service = this.services.get(serviceId)!;
    const options = this.serviceOptions.get(serviceId)!;
    
    // Start dependencies first
    if (options.dependencies && options.dependencies.length > 0) {
      for (const depId of options.dependencies) {
        if (!this.services.has(depId)) {
          throw new Error(`Dependency '${depId}' for service '${serviceId}' is not registered`);
        }
        
        const depStatus = this.serviceStatus.get(depId);
        if (depStatus !== 'running') {
          await this.startService(depId);
        }
      }
    }
    
    // Start the service with retry logic
    let retries = options.retryCount || 0;
    let success = false;
    
    while (retries >= 0 && !success) {
      try {
        await this.startWithTimeout(service, options.timeout);
        success = true;
      } catch (error) {
        const health = this.serviceHealth.get(serviceId)!;
        health.errors.push((error as Error).message);
        this.serviceHealth.set(serviceId, health);
        
        retries--;
        if (retries < 0) {
          this.serviceStatus.set(serviceId, 'error');
          this.events.emit('service:error', { 
            serviceId, 
            error: error instanceof Error ? error : new Error(String(error)) 
          });
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Update status to running
    this.serviceStatus.set(serviceId, 'running');
    this.events.emit('service:started', { serviceId });
  }
  
  /**
   * Start a service with a timeout
   */
  private async startWithTimeout(service: Service, timeout?: number): Promise<void> {
    const actualTimeout = timeout || this.DEFAULT_TIMEOUT;
    
    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Service '${service.id}' initialization timed out after ${actualTimeout}ms`));
      }, actualTimeout);
    });
    
    // Race the service initialization against the timeout
    await Promise.race([
      service.initialize(),
      timeoutPromise
    ]);
  }
  
  /**
   * Shutdown a service and dependent services
   */
  public async shutdownService(serviceId: string): Promise<void> {
    if (!this.services.has(serviceId)) {
      throw new Error(`Service '${serviceId}' is not registered`);
    }
    
    const status = this.serviceStatus.get(serviceId);
    if (status !== 'running') {
      return; // Not running
    }
    
    // Identify services that depend on this one
    const dependentServices: string[] = [];
    for (const [id, options] of this.serviceOptions.entries()) {
      if (options.dependencies?.includes(serviceId)) {
        dependentServices.push(id);
      }
    }
    
    // Shut down dependent services first
    for (const depId of dependentServices) {
      await this.shutdownService(depId);
    }
    
    // Update status
    this.serviceStatus.set(serviceId, 'shutdown');
    this.events.emit('service:stopping', { serviceId });
    
    const service = this.services.get(serviceId)!;
    await service.shutdown();
    
    this.events.emit('service:stopped', { serviceId });
  }
  
  /**
   * Get service status
   */
  public getServiceStatus(serviceId: string): ServiceStatus | undefined {
    return this.serviceStatus.get(serviceId);
  }
  
  /**
   * Get service health information
   */
  public getServiceHealth(serviceId: string): ServiceHealth | undefined {
    return this.serviceHealth.get(serviceId);
  }
  
  /**
   * Get all services' health information
   */
  public getAllServicesHealth(): ServiceHealth[] {
    return Array.from(this.serviceHealth.values());
  }
  
  /**
   * Start periodic health check
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }
  
  /**
   * Perform health check on all services
   */
  private performHealthCheck(): void {
    const now = Date.now();
    
    for (const [serviceId, health] of this.serviceHealth.entries()) {
      const status = this.serviceStatus.get(serviceId) || 'idle';
      
      // Update health data
      health.lastChecked = now;
      health.status = status;
      
      // Trim error log if it's getting too large
      if (health.errors.length > 10) {
        health.errors = health.errors.slice(-10);
      }
      
      this.serviceHealth.set(serviceId, health);
    }
    
    this.events.emit('health:checked', { timestamp: now });
  }
  
  /**
   * Stop all services and clean up
   */
  public async shutdown(): Promise<void> {
    // Get all running services
    const runningServices = Array.from(this.serviceStatus.entries())
      .filter(([_, status]) => status === 'running')
      .map(([id]) => id);
    
    // Shut down all running services
    for (const serviceId of runningServices) {
      await this.shutdownService(serviceId);
    }
    
    // Clear health check interval
    if (this.healthCheckInterval !== null) {
      window.clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Clear event listeners
    this.events.removeAllListeners();
  }
  
  /**
   * Subscribe to container events
   */
  public subscribe(event: string, handler: (data: any) => void): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }
}

// Export singleton instance
export const serviceContainer = new ServiceContainer();
