import { EventEmitter } from 'events';

export type ModuleStatus = 'initializing' | 'running' | 'degraded' | 'failed' | 'stopped';
export type ModulePriority = 'critical' | 'high' | 'medium' | 'low';

export interface ModuleConfig {
  id: string;
  name: string;
  version: string;
  priority: ModulePriority;
  dependencies: string[];
  maxRestartAttempts: number;
  healthCheckInterval: number;
}

export interface ModuleHealth {
  status: ModuleStatus;
  uptime: number;
  lastHealthCheck: number;
  errorCount: number;
  restartCount: number;
  memoryUsage: number;
  cpuUsage: number;
  isResponding: boolean;
}

export interface ModuleMetrics {
  operationsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  successRate: number;
  temporalEvents: number;
}

export abstract class ModuleBase extends EventEmitter {
  protected config: ModuleConfig;
  protected health: ModuleHealth;
  protected metrics: ModuleMetrics;
  protected isInitialized = false;
  protected healthCheckTimer?: NodeJS.Timeout;
  private temporalEventHistory: Array<{ timestamp: number; event: string; data: any }> = [];

  constructor(config: ModuleConfig) {
    super();
    this.config = config;
    this.health = {
      status: 'initializing',
      uptime: 0,
      lastHealthCheck: Date.now(),
      errorCount: 0,
      restartCount: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      isResponding: true
    };
    this.metrics = {
      operationsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      successRate: 100,
      temporalEvents: 0
    };
  }

  // Abstract methods that each module must implement
  abstract initialize(): Promise<void>;
  abstract shutdown(): Promise<void>;
  abstract performHealthCheck(): Promise<boolean>;
  abstract getModuleSpecificMetrics(): Record<string, any>;

  async start(): Promise<void> {
    try {
      console.log(`🚀 Starting module: ${this.config.name}`);
      this.recordTemporalEvent('module_start_attempt', { moduleId: this.config.id });
      
      await this.initialize();
      this.isInitialized = true;
      this.health.status = 'running';
      this.startHealthChecking();
      
      this.recordTemporalEvent('module_started', { moduleId: this.config.id });
      this.emit('module:started', this);
      console.log(`✅ Module started successfully: ${this.config.name}`);
    } catch (error) {
      this.health.status = 'failed';
      this.health.errorCount++;
      this.recordTemporalEvent('module_start_failed', { 
        moduleId: this.config.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      this.emit('module:failed', this, error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      console.log(`🛑 Stopping module: ${this.config.name}`);
      this.recordTemporalEvent('module_stop_attempt', { moduleId: this.config.id });
      
      this.stopHealthChecking();
      await this.shutdown();
      this.health.status = 'stopped';
      this.isInitialized = false;
      
      this.recordTemporalEvent('module_stopped', { moduleId: this.config.id });
      this.emit('module:stopped', this);
      console.log(`✅ Module stopped: ${this.config.name}`);
    } catch (error) {
      this.health.errorCount++;
      this.recordTemporalEvent('module_stop_failed', { 
        moduleId: this.config.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async restart(): Promise<void> {
    if (this.health.restartCount >= this.config.maxRestartAttempts) {
      throw new Error(`Module ${this.config.name} exceeded maximum restart attempts`);
    }

    this.health.restartCount++;
    this.recordTemporalEvent('module_restart', { 
      moduleId: this.config.id, 
      attemptCount: this.health.restartCount 
    });

    await this.stop();
    await this.start();
  }

  protected recordTemporalEvent(event: string, data: any): void {
    const temporalEvent = {
      timestamp: Date.now(),
      event,
      data: { ...data, moduleId: this.config.id }
    };
    
    this.temporalEventHistory.push(temporalEvent);
    this.metrics.temporalEvents++;
    
    // Keep only last 1000 events for memory efficiency
    if (this.temporalEventHistory.length > 1000) {
      this.temporalEventHistory = this.temporalEventHistory.slice(-1000);
    }
    
    this.emit('temporal:event', temporalEvent);
  }

  private startHealthChecking(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        const isHealthy = await this.performHealthCheck();
        this.health.lastHealthCheck = Date.now();
        this.health.isResponding = isHealthy;
        
        if (!isHealthy && this.health.status === 'running') {
          this.health.status = 'degraded';
          this.recordTemporalEvent('module_degraded', { moduleId: this.config.id });
          this.emit('module:degraded', this);
        } else if (isHealthy && this.health.status === 'degraded') {
          this.health.status = 'running';
          this.recordTemporalEvent('module_recovered', { moduleId: this.config.id });
          this.emit('module:recovered', this);
        }
        
        this.emit('module:health_updated', this);
      } catch (error) {
        this.health.errorCount++;
        this.health.status = 'failed';
        this.recordTemporalEvent('health_check_failed', { 
          moduleId: this.config.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        this.emit('module:failed', this, error);
      }
    }, this.config.healthCheckInterval);
  }

  private stopHealthChecking(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  // Public getters
  getId(): string { return this.config.id; }
  getName(): string { return this.config.name; }
  getVersion(): string { return this.config.version; }
  getPriority(): ModulePriority { return this.config.priority; }
  getDependencies(): string[] { return [...this.config.dependencies]; }
  getHealth(): ModuleHealth { return { ...this.health }; }
  getMetrics(): ModuleMetrics { return { ...this.metrics }; }
  getTemporalEvents(timeRange?: { start: number; end: number }): Array<{ timestamp: number; event: string; data: any }> {
    if (!timeRange) return [...this.temporalEventHistory];
    
    return this.temporalEventHistory.filter(event => 
      event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );
  }
  isRunning(): boolean { return this.health.status === 'running'; }
  canRestart(): boolean { return this.health.restartCount < this.config.maxRestartAttempts; }
}
