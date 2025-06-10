
import { ModuleBase, ModuleStatus, ModuleHealth } from './ModuleBase';
import { eventBus } from './EventBus';

export interface SystemMetrics {
  uptime: number;
  eventCount: number;
  errorCount: number;
  lastHeartbeat: number;
  performance: number;
  memoryUsage: number;
  eventThroughput: number;
}

export class EventSystemModule extends ModuleBase {
  private metrics: SystemMetrics;
  private heartbeatInterval?: NodeJS.Timeout;
  private eventQueue: any[] = [];
  private isProcessing = false;

  constructor() {
    super('event-system', 'Event System Core', 1.0);
    
    this.metrics = {
      uptime: 0,
      eventCount: 0,
      errorCount: 0,
      lastHeartbeat: Date.now(),
      performance: 100,
      memoryUsage: 0,
      eventThroughput: 0
    };
  }

  async initialize(): Promise<void> {
    this.updateStatus('initializing');
    
    try {
      console.log('🔧 Initializing EventSystemModule...');
      
      // Start heartbeat monitoring
      this.startHeartbeat();
      
      // Start event processing
      this.startEventProcessing();
      
      // Listen for system events
      this.setupEventListeners();
      
      this.updateStatus('running');
      this.updateHealth('healthy');
      
      eventBus.emit('system:initialized', { moduleId: this.id, metrics: this.metrics });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.updateStatus('stopping');
    
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Process remaining events
    await this.processRemainingEvents();
    
    this.updateStatus('stopped');
    eventBus.emit('system:shutdown', { moduleId: this.id });
  }

  async restart(): Promise<void> {
    await this.shutdown();
    await this.initialize();
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.metrics.lastHeartbeat = Date.now();
      this.metrics.uptime += 1000;
      
      // Update performance based on event processing speed
      const queueSize = this.eventQueue.length;
      this.metrics.performance = Math.max(0, 100 - (queueSize * 5));
      
      // Estimate memory usage
      this.metrics.memoryUsage = (performance as any)?.memory?.usedJSHeapSize || 0;
      
      eventBus.emit('system:heartbeat', { 
        moduleId: this.id, 
        metrics: this.metrics,
        queueSize 
      });
    }, 1000);
  }

  private startEventProcessing(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        await this.processEventQueue();
      }
    }, 100);
  }

  private async processEventQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const startTime = Date.now();
    let processedCount = 0;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        await this.processEvent(event);
        processedCount++;
        
        // Update throughput
        const elapsed = Date.now() - startTime;
        this.metrics.eventThroughput = Math.round((processedCount / elapsed) * 1000);
      }
    } catch (error) {
      this.metrics.errorCount++;
      this.handleError(error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEvent(event: any): Promise<void> {
    this.metrics.eventCount++;
    
    // Simulate event processing with temporal awareness
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    
    eventBus.emit('system:event:processed', { 
      moduleId: this.id, 
      eventType: event.type,
      processingTime: Date.now() - event.timestamp 
    });
  }

  private setupEventListeners(): void {
    // Listen for events from other modules
    eventBus.on('*', (eventType: string, data: any) => {
      if (!eventType.startsWith('system:')) {
        this.eventQueue.push({
          type: eventType,
          data,
          timestamp: Date.now()
        });
      }
    });
  }

  private async processRemainingEvents(): Promise<void> {
    console.log(`🔄 Processing ${this.eventQueue.length} remaining events...`);
    await this.processEventQueue();
  }

  getSystemMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  getModuleHealth(): ModuleHealth {
    const { performance, errorCount, eventCount } = this.metrics;
    const errorRate = eventCount > 0 ? (errorCount / eventCount) * 100 : 0;

    if (performance < 30 || errorRate > 10) {
      return 'critical';
    } else if (performance < 70 || errorRate > 5) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  // Public methods for external module communication
  registerModule(moduleId: string, metadata: any): void {
    eventBus.emit('system:module:registered', { moduleId, metadata });
  }

  unregisterModule(moduleId: string): void {
    eventBus.emit('system:module:unregistered', { moduleId });
  }
}

export const eventSystemModule = new EventSystemModule();
