import { BrowserEventEmitter } from '../events/BrowserEventEmitter';

export interface SystemMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    cores: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    heap: {
      used: number;
      total: number;
      limit: number;
    };
  };
  network: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  performance: {
    timing: PerformanceTiming;
    navigation: PerformanceNavigation;
    frameRate: number;
    renderTime: number;
  };
}

export interface MetricsBaseline {
  cpu: { min: number; max: number; avg: number };
  memory: { min: number; max: number; avg: number };
  network: { minRtt: number; maxDownlink: number };
  performance: { avgFrameRate: number; avgRenderTime: number };
}

export class MetricsCollector extends BrowserEventEmitter {
  private metrics: SystemMetrics[] = [];
  private baseline: MetricsBaseline | null = null;
  private collecting = false;
  private intervalId: number | null = null;

  constructor() {
    super();
  }

  async startCollection(intervalMs: number = 1000): Promise<void> {
    if (this.collecting) return;
    
    this.collecting = true;
    console.log('🔍 Starting metrics collection...');

    this.intervalId = window.setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.metrics.push(metrics);
        
        // Keep only last 1000 entries
        if (this.metrics.length > 1000) {
          this.metrics = this.metrics.slice(-1000);
        }

        this.emit('metrics-collected', metrics);
        
        // Check for anomalies
        if (this.baseline) {
          this.checkAnomalies(metrics);
        }
      } catch (error) {
        console.error('❌ Error collecting metrics:', error);
        this.emit('metrics-error', error);
      }
    }, intervalMs);
  }

  stopCollection(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.collecting = false;
    console.log('⏹️ Stopped metrics collection');
  }

  private async collectMetrics(): Promise<SystemMetrics> {
    const timestamp = Date.now();

    // CPU metrics (approximated from performance)
    const cpu = await this.getCPUMetrics();
    
    // Memory metrics
    const memory = this.getMemoryMetrics();
    
    // Network metrics
    const network = this.getNetworkMetrics();
    
    // Performance metrics
    const performance = this.getPerformanceMetrics();

    return {
      timestamp,
      cpu,
      memory,
      network,
      performance
    };
  }

  private async getCPUMetrics() {
    const cores = navigator.hardwareConcurrency || 4;
    
    // Estimate CPU usage from performance timing
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 10));
    const endTime = performance.now();
    const actualDelay = endTime - startTime;
    
    // Simple CPU approximation (more delay = higher usage)
    const usage = Math.min(Math.max((actualDelay - 10) * 10, 0), 100);

    return {
      usage,
      cores,
      frequency: 0 // Not available in browser
    };
  }

  private getMemoryMetrics() {
    const memInfo = (performance as any).memory;
    
    if (memInfo) {
      return {
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        percentage: (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100,
        heap: {
          used: memInfo.usedJSHeapSize,
          total: memInfo.totalJSHeapSize,
          limit: memInfo.jsHeapSizeLimit
        }
      };
    }

    // Fallback for browsers without memory API
    return {
      used: 0,
      total: 0,
      percentage: 0,
      heap: { used: 0, total: 0, limit: 0 }
    };
  }

  private getNetworkMetrics() {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };
    }

    return {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false
    };
  }

  private getPerformanceMetrics() {
    const timing = performance.timing;
    const navigation = performance.navigation;
    
    // Frame rate estimation
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFrameRate = () => {
      frameCount++;
      requestAnimationFrame(measureFrameRate);
    };
    measureFrameRate();
    
    const currentTime = performance.now();
    const frameRate = frameCount / ((currentTime - lastTime) / 1000);

    return {
      timing,
      navigation,
      frameRate: Math.min(frameRate, 60),
      renderTime: timing.loadEventEnd - timing.navigationStart
    };
  }

  private checkAnomalies(metrics: SystemMetrics): void {
    if (!this.baseline) return;

    const alerts: string[] = [];

    // CPU anomaly detection
    if (metrics.cpu.usage > this.baseline.cpu.max * 1.5) {
      alerts.push(`High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`);
    }

    // Memory anomaly detection
    if (metrics.memory.percentage > this.baseline.memory.max * 1.3) {
      alerts.push(`High memory usage: ${metrics.memory.percentage.toFixed(1)}%`);
    }

    // Network anomaly detection
    if (metrics.network.rtt > this.baseline.network.minRtt * 3) {
      alerts.push(`High network latency: ${metrics.network.rtt}ms`);
    }

    if (alerts.length > 0) {
      this.emit('anomaly-detected', {
        timestamp: metrics.timestamp,
        alerts,
        metrics
      });
    }
  }

  calculateBaseline(): MetricsBaseline | null {
    if (this.metrics.length < 30) return null;

    const recent = this.metrics.slice(-100);
    
    const cpuValues = recent.map(m => m.cpu.usage);
    const memoryValues = recent.map(m => m.memory.percentage);
    const rttValues = recent.map(m => m.network.rtt).filter(r => r > 0);
    const downlinkValues = recent.map(m => m.network.downlink).filter(d => d > 0);
    const frameRates = recent.map(m => m.performance.frameRate).filter(f => f > 0);
    const renderTimes = recent.map(m => m.performance.renderTime).filter(r => r > 0);

    this.baseline = {
      cpu: {
        min: Math.min(...cpuValues),
        max: Math.max(...cpuValues),
        avg: cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length
      },
      memory: {
        min: Math.min(...memoryValues),
        max: Math.max(...memoryValues),
        avg: memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length
      },
      network: {
        minRtt: rttValues.length > 0 ? Math.min(...rttValues) : 0,
        maxDownlink: downlinkValues.length > 0 ? Math.max(...downlinkValues) : 0
      },
      performance: {
        avgFrameRate: frameRates.length > 0 ? frameRates.reduce((a, b) => a + b, 0) / frameRates.length : 60,
        avgRenderTime: renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0
      }
    };

    console.log('📊 Baseline calculated:', this.baseline);
    this.emit('baseline-updated', this.baseline);
    
    return this.baseline;
  }

  getRecentMetrics(count: number = 50): SystemMetrics[] {
    return this.metrics.slice(-count);
  }

  getCurrentMetrics(): SystemMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getBaseline(): MetricsBaseline | null {
    return this.baseline;
  }

  isCollecting(): boolean {
    return this.collecting;
  }

  getMetricsCount(): number {
    return this.metrics.length;
  }
}

export const metricsCollector = new MetricsCollector();
