import { BrowserEventEmitter, createSystemEvent } from '@/core/events';

export interface HealthMetric {
  name: string;
  value: number;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: number;
}

export class SystemHealthMonitor extends BrowserEventEmitter {
  private metrics: Map<string, HealthMetric> = new Map();
  private isMonitoring = false;
  private checkInterval = 5000; // 5 seconds

  constructor() {
    super();
    this.initializeMetrics();
    this.startMonitoring();
  }

  private initializeMetrics(): void {
    this.metrics.set('cpuUsage', {
      name: 'CPU Usage',
      value: 0,
      threshold: 90,
      status: 'healthy',
      timestamp: Date.now()
    });
    this.metrics.set('memoryUsage', {
      name: 'Memory Usage',
      value: 0,
      threshold: 85,
      status: 'healthy',
      timestamp: Date.now()
    });
    this.metrics.set('networkLatency', {
      name: 'Network Latency',
      value: 0,
      threshold: 200,
      status: 'healthy',
      timestamp: Date.now()
    });
  }

  public getMetrics(): HealthMetric[] {
    return Array.from(this.metrics.values());
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    setInterval(() => {
      this.checkSystemHealth();
    }, this.checkInterval);
  }

  private checkSystemHealth(): void {
    this.updateCPUUsage();
    this.updateMemoryUsage();
    this.updateNetworkLatency();

    this.emit('health_metrics_updated', this.getMetrics());
  }

  private updateCPUUsage(): void {
    const cpuUsage = Math.random() * 100; // Simulate CPU usage
    const metric = this.metrics.get('cpuUsage');
    if (metric) {
      metric.value = cpuUsage;
      metric.timestamp = Date.now();
      metric.status = this.determineStatus(cpuUsage, metric.threshold);
      this.metrics.set('cpuUsage', metric);
    }
  }

  private updateMemoryUsage(): void {
    const memoryUsage = Math.random() * 100; // Simulate memory usage
    const metric = this.metrics.get('memoryUsage');
    if (metric) {
      metric.value = memoryUsage;
      metric.timestamp = Date.now();
      metric.status = this.determineStatus(memoryUsage, metric.threshold);
      this.metrics.set('memoryUsage', metric);
    }
  }

  private updateNetworkLatency(): void {
    const networkLatency = Math.random() * 300; // Simulate network latency
    const metric = this.metrics.get('networkLatency');
    if (metric) {
      metric.value = networkLatency;
      metric.timestamp = Date.now();
      metric.status = this.determineStatus(networkLatency, metric.threshold);
      this.metrics.set('networkLatency', metric);
    }
  }

  private determineStatus(value: number, threshold: number): 'healthy' | 'warning' | 'critical' {
    if (value < threshold * 0.75) {
      return 'healthy';
    } else if (value < threshold) {
      return 'warning';
    } else {
      return 'critical';
    }
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    clearInterval(this.checkSystemHealth);
  }
}
