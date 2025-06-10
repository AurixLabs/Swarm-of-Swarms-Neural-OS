import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { SystemEvent } from '../types/SystemEvent';

export interface Anomaly {
  id: string;
  timestamp: Date;
  metric: string;
  value: number;
  expectedRange: [number, number];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
}

export interface AnomalyThreshold {
  metric: string;
  upperBound: number;
  lowerBound: number;
  enabled: boolean;
}

export class AnomalyDetectionSystem extends BrowserEventEmitter {
  private thresholds: Map<string, AnomalyThreshold> = new Map();
  private detectedAnomalies: Anomaly[] = [];
  private isMonitoring = false;
  private baselineData: Map<string, number[]> = new Map();

  constructor() {
    super();
    this.initializeDefaultThresholds();
  }

  private initializeDefaultThresholds() {
    const defaultThresholds: AnomalyThreshold[] = [
      { metric: 'cpu_usage', upperBound: 85, lowerBound: 5, enabled: true },
      { metric: 'memory_usage', upperBound: 90, lowerBound: 10, enabled: true },
      { metric: 'response_time', upperBound: 1000, lowerBound: 10, enabled: true },
      { metric: 'error_rate', upperBound: 5, lowerBound: 0, enabled: true }
    ];

    defaultThresholds.forEach(threshold => 
      this.thresholds.set(threshold.metric, threshold)
    );
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.emit('monitoring_started');
    this.scheduleAnomalyCheck();
  }

  stopMonitoring() {
    this.isMonitoring = false;
    this.emit('monitoring_stopped');
  }

  private scheduleAnomalyCheck() {
    if (!this.isMonitoring) return;

    // Simulate real-time metric monitoring
    this.checkForAnomalies();

    // Schedule next check
    setTimeout(() => this.scheduleAnomalyCheck(), 5000); // 5 seconds
  }

  private checkForAnomalies() {
    this.thresholds.forEach((threshold, metric) => {
      if (!threshold.enabled) return;

      // Simulate getting current metric value
      const currentValue = this.simulateMetricValue(metric);
      this.updateBaseline(metric, currentValue);

      // Check against static thresholds
      if (currentValue > threshold.upperBound || currentValue < threshold.lowerBound) {
        this.detectAnomaly(metric, currentValue, [threshold.lowerBound, threshold.upperBound], 'threshold');
      }

      // Check against statistical anomalies
      const baseline = this.baselineData.get(metric) || [];
      if (baseline.length > 10) {
        const mean = baseline.reduce((sum, val) => sum + val, 0) / baseline.length;
        const stdDev = Math.sqrt(baseline.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / baseline.length);
        
        // 3-sigma rule
        if (Math.abs(currentValue - mean) > 3 * stdDev) {
          this.detectAnomaly(metric, currentValue, [mean - 2 * stdDev, mean + 2 * stdDev], 'statistical');
        }
      }
    });
  }

  private simulateMetricValue(metric: string): number {
    const baseValues = {
      cpu_usage: 45 + Math.random() * 30,
      memory_usage: 60 + Math.random() * 25,
      response_time: 150 + Math.random() * 100,
      error_rate: Math.random() * 2
    };

    // Occasionally inject anomalies for demonstration
    const shouldInjectAnomaly = Math.random() < 0.05; // 5% chance
    if (shouldInjectAnomaly) {
      return baseValues[metric as keyof typeof baseValues] * (2 + Math.random());
    }

    return baseValues[metric as keyof typeof baseValues] || Math.random() * 100;
  }

  private updateBaseline(metric: string, value: number) {
    const baseline = this.baselineData.get(metric) || [];
    baseline.push(value);
    
    // Keep only last 100 values for baseline
    if (baseline.length > 100) {
      baseline.splice(0, baseline.length - 100);
    }
    
    this.baselineData.set(metric, baseline);
  }

  private detectAnomaly(metric: string, value: number, expectedRange: [number, number], type: string) {
    const severity = this.calculateSeverity(value, expectedRange);
    
    const anomaly: Anomaly = {
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      metric,
      value,
      expectedRange,
      severity,
      description: `${type} anomaly detected: ${metric} = ${value.toFixed(2)}`,
      confidence: 0.8 + Math.random() * 0.2
    };

    this.detectedAnomalies.push(anomaly);
    
    // Keep only last 1000 anomalies
    if (this.detectedAnomalies.length > 1000) {
      this.detectedAnomalies.splice(0, this.detectedAnomalies.length - 1000);
    }

    this.emit('anomaly_detected', anomaly);
  }

  private calculateSeverity(value: number, expectedRange: [number, number]): 'low' | 'medium' | 'high' | 'critical' {
    const [lower, upper] = expectedRange;
    const range = upper - lower;
    const deviation = Math.max(Math.abs(value - lower), Math.abs(value - upper));
    
    if (deviation > range * 2) return 'critical';
    if (deviation > range) return 'high';
    if (deviation > range * 0.5) return 'medium';
    return 'low';
  }

  getRecentAnomalies(count: number = 50): Anomaly[] {
    return this.detectedAnomalies.slice(-count);
  }

  getAnomaliesByMetric(metric: string): Anomaly[] {
    return this.detectedAnomalies.filter(anomaly => anomaly.metric === metric);
  }

  updateThreshold(metric: string, threshold: Partial<AnomalyThreshold>) {
    const existing = this.thresholds.get(metric);
    if (existing) {
      this.thresholds.set(metric, { ...existing, ...threshold });
      this.emit('threshold_updated', { metric, threshold });
    }
  }
}

// Export singleton instance
export const anomalyDetectionSystem = new AnomalyDetectionSystem();
