
import { BrowserEventEmitter } from '../BrowserEventEmitter';

interface ResourceMetrics {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
}

export class ResourceMonitor {
  private static instance: ResourceMonitor;
  private eventEmitter = new BrowserEventEmitter();
  private metricsInterval: number | null = null;
  private thresholds = {
    memoryUsage: 0.9, // 90% of available memory
    cpuUsage: 0.8,    // 80% CPU usage
  };

  private constructor() {}

  public static getInstance(): ResourceMonitor {
    if (!this.instance) {
      this.instance = new ResourceMonitor();
    }
    return this.instance;
  }

  public startMonitoring(intervalMs: number = 5000): void {
    if (this.metricsInterval) return;

    this.metricsInterval = window.setInterval(() => {
      this.checkResources();
    }, intervalMs);
  }

  public stopMonitoring(): void {
    if (this.metricsInterval) {
      window.clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  private async checkResources(): Promise<void> {
    const metrics = await this.gatherMetrics();
    
    if (this.isOverThreshold(metrics)) {
      this.eventEmitter.emit('resource:warning', metrics);
    }

    this.eventEmitter.emit('resource:metrics', metrics);
  }

  private async gatherMetrics(): Promise<ResourceMetrics> {
    const memory = (performance as any).memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };

    return {
      memory: {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      },
      cpu: {
        usage: await this.estimateCPUUsage(),
        loadAverage: []
      }
    };
  }

  private async estimateCPUUsage(): Promise<number> {
    const startTime = performance.now();
    let count = 0;
    
    while (performance.now() - startTime < 100) {
      count++;
    }
    
    return Math.min(1, count / 1000000);
  }

  private isOverThreshold(metrics: ResourceMetrics): boolean {
    const memoryUsage = metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit;
    return memoryUsage > this.thresholds.memoryUsage || 
           metrics.cpu.usage > this.thresholds.cpuUsage;
  }

  public on(event: string, handler: (data: any) => void): () => void {
    this.eventEmitter.on(event, handler);
    return () => this.eventEmitter.off(event, handler);
  }
}

export const resourceMonitor = ResourceMonitor.getInstance();
