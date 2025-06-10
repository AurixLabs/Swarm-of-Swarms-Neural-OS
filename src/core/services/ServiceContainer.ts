
import { systemKernel } from '@/core/SystemKernel';
import * as crypto from 'crypto-js';

/**
 * Service interface for all services in the system
 */
export interface Service {
  id: string;
  name: string;
  version: string;
  initialize(container: ServiceContainer): Promise<boolean>;
  destroy(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
}

/**
 * Health status for services with optional metrics
 */
export interface HealthStatus {
  id: string;
  status: 'healthy' | 'degraded' | 'failed';
  message?: string;
  lastChecked: number;
  metrics?: Record<string, number>;
}

/**
 * Service dependency definition
 */
export interface ServiceDependency {
  serviceId: string;
  required: boolean;
  version?: string;
}

/**
 * Service Container
 * 
 * Dependency injection system for modules with lifecycle management
 * and health monitoring. Services are registered, initialized, and
 * managed through this container.
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private readonly services = new Map<string, Service>();
  private readonly dependencies = new Map<string, ServiceDependency[]>();
  private readonly serviceHealth = new Map<string, HealthStatus>();
  private healthCheckInterval: number | null = null;
  private initialized = false;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
  
  /**
   * Register a service with the container
   */
  public registerService(service: Service, dependencies: ServiceDependency[] = []): boolean {
    if (this.services.has(service.id)) {
      console.warn(`Service with ID ${service.id} is already registered`);
      return false;
    }
    
    this.services.set(service.id, service);
    this.dependencies.set(service.id, dependencies);
    
    this.serviceHealth.set(service.id, {
      id: service.id,
      status: 'healthy',
      lastChecked: Date.now(),
      message: 'Service registered, not yet initialized'
    });
    
    return true;
  }
  
  /**
   * Initialize all registered services in dependency order
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    console.log('Initializing service container...');
    
    // Sort services by dependency order
    const sortedServices = this.sortServicesByDependency();
    
    // Initialize services in order
    for (const serviceId of sortedServices) {
      const service = this.services.get(serviceId);
      if (!service) continue;
      
      try {
        const success = await service.initialize(this);
        if (!success) {
          console.error(`Failed to initialize service: ${serviceId}`);
          
          // Update health status
          this.serviceHealth.set(serviceId, {
            id: serviceId,
            status: 'failed',
            lastChecked: Date.now(),
            message: 'Initialization failed'
          });
          
          // If this service is required by others, we need to fail
          if (this.isRequiredByOthers(serviceId)) {
            console.error(`Service ${serviceId} is required by other services, initialization failed`);
            return false;
          }
        } else {
          // Update health status
          this.serviceHealth.set(serviceId, {
            id: serviceId,
            status: 'healthy',
            lastChecked: Date.now(),
            message: 'Service initialized successfully'
          });
          
          console.log(`Service ${serviceId} initialized successfully`);
        }
      } catch (error) {
        console.error(`Error initializing service ${serviceId}:`, error);
        
        // Update health status
        this.serviceHealth.set(serviceId, {
          id: serviceId,
          status: 'failed',
          lastChecked: Date.now(),
          message: `Error: ${error.message || 'Unknown error'}`
        });
        
        // If this service is required by others, we need to fail
        if (this.isRequiredByOthers(serviceId)) {
          console.error(`Service ${serviceId} is required by other services, initialization failed`);
          return false;
        }
      }
    }
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    this.initialized = true;
    return true;
  }
  
  /**
   * Check if a service is required by other services
   */
  private isRequiredByOthers(serviceId: string): boolean {
    for (const [_, deps] of this.dependencies.entries()) {
      for (const dep of deps) {
        if (dep.serviceId === serviceId && dep.required) {
          return true;
        }
      }
    }
    return false;
  }
  
  /**
   * Sort services by dependency order
   */
  private sortServicesByDependency(): string[] {
    const result: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (serviceId: string) => {
      if (visited.has(serviceId)) return;
      if (visiting.has(serviceId)) {
        console.error(`Circular dependency detected for service ${serviceId}`);
        return;
      }
      
      visiting.add(serviceId);
      
      const dependencies = this.dependencies.get(serviceId) || [];
      for (const dep of dependencies) {
        if (this.services.has(dep.serviceId)) {
          visit(dep.serviceId);
        } else if (dep.required) {
          console.warn(`Required dependency ${dep.serviceId} not found for service ${serviceId}`);
        }
      }
      
      visiting.delete(serviceId);
      visited.add(serviceId);
      result.push(serviceId);
    };
    
    // Visit all services
    for (const serviceId of this.services.keys()) {
      visit(serviceId);
    }
    
    return result;
  }
  
  /**
   * Get a service by ID
   */
  public getService<T extends Service>(serviceId: string): T | undefined {
    return this.services.get(serviceId) as T | undefined;
  }
  
  /**
   * Get health status of a service
   */
  public getHealthStatus(serviceId: string): HealthStatus | undefined {
    return this.serviceHealth.get(serviceId);
  }
  
  /**
   * Get health status of all services
   */
  public getAllHealthStatus(): HealthStatus[] {
    return Array.from(this.serviceHealth.values());
  }
  
  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring() {
    if (this.healthCheckInterval !== null) {
      return;
    }
    
    this.healthCheckInterval = window.setInterval(() => {
      this.checkServicesHealth();
    }, 30000); // Check every 30 seconds
  }
  
  /**
   * Check health of all services
   */
  private async checkServicesHealth() {
    for (const [serviceId, service] of this.services.entries()) {
      try {
        const health = await service.healthCheck();
        this.serviceHealth.set(serviceId, health);
        
        // Report degraded or failed services
        if (health.status !== 'healthy') {
          systemKernel.events.emitEvent({
            type: 'SERVICE_HEALTH_ALERT',
            payload: {
              serviceId,
              status: health.status,
              message: health.message,
              timestamp: Date.now()
            }
          });
        }
      } catch (error) {
        console.error(`Error checking health for service ${serviceId}:`, error);
        this.serviceHealth.set(serviceId, {
          id: serviceId,
          status: 'failed',
          lastChecked: Date.now(),
          message: `Health check error: ${error.message || 'Unknown error'}`
        });
      }
    }
  }
  
  /**
   * Stop health monitoring
   */
  private stopHealthMonitoring() {
    if (this.healthCheckInterval !== null) {
      window.clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
  
  /**
   * Destroy all services in reverse dependency order
   */
  public async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    console.log('Shutting down service container...');
    
    // Stop health monitoring
    this.stopHealthMonitoring();
    
    // Get services in reverse dependency order
    const sortedServices = this.sortServicesByDependency().reverse();
    
    // Destroy services in reverse order
    for (const serviceId of sortedServices) {
      const service = this.services.get(serviceId);
      if (!service) continue;
      
      try {
        await service.destroy();
        console.log(`Service ${serviceId} destroyed successfully`);
      } catch (error) {
        console.error(`Error destroying service ${serviceId}:`, error);
      }
    }
    
    // Clear collections
    this.services.clear();
    this.dependencies.clear();
    this.serviceHealth.clear();
    
    this.initialized = false;
  }
}

// Export singleton instance
export const serviceContainer = ServiceContainer.getInstance();
