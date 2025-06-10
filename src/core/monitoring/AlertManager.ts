
import { BrowserEventEmitter } from '../events/BrowserEventEmitter';

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  source: string;
  data?: any;
  acknowledged: boolean;
  resolved: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: any) => boolean;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  enabled: boolean;
}

export class AlertManager extends BrowserEventEmitter {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private maxAlerts = 1000;

  constructor() {
    super();
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'high-cpu',
        name: 'High CPU Usage',
        condition: (metrics) => metrics.cpu?.usage > 80,
        severity: 'critical',
        description: 'CPU usage exceeds 80%',
        enabled: true
      },
      {
        id: 'high-memory',
        name: 'High Memory Usage',
        condition: (metrics) => metrics.memory?.percentage > 85,
        severity: 'critical',
        description: 'Memory usage exceeds 85%',
        enabled: true
      },
      {
        id: 'slow-network',
        name: 'Slow Network',
        condition: (metrics) => metrics.network?.rtt > 1000,
        severity: 'warning',
        description: 'Network RTT exceeds 1 second',
        enabled: true
      },
      {
        id: 'low-framerate',
        name: 'Low Frame Rate',
        condition: (metrics) => metrics.performance?.frameRate < 30,
        severity: 'warning',
        description: 'Frame rate below 30 FPS',
        enabled: true
      },
      {
        id: 'kernel-error',
        name: 'Kernel Error',
        condition: (data) => data.type === 'kernel-error',
        severity: 'critical',
        description: 'Kernel module has encountered an error',
        enabled: true
      }
    ];
  }

  checkRules(data: any, source: string = 'system'): void {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        if (rule.condition(data)) {
          this.createAlert({
            type: rule.severity,
            title: rule.name,
            message: rule.description,
            source,
            data
          });
        }
      } catch (error) {
        console.error(`❌ Error checking rule ${rule.id}:`, error);
      }
    }
  }

  createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>): Alert {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      ...alertData
    };

    this.alerts.unshift(alert);

    // Limit alerts count
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    console.log(`🚨 Alert created: ${alert.title} - ${alert.message}`);
    this.emit('alert-created', alert);

    // Auto-acknowledge info alerts after 30 seconds
    if (alert.type === 'info') {
      setTimeout(() => {
        this.acknowledgeAlert(alert.id);
      }, 30000);
    }

    return alert;
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      this.emit('alert-acknowledged', alert);
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.acknowledged = true;
      this.emit('alert-resolved', alert);
      return true;
    }
    return false;
  }

  getAlerts(filter?: {
    type?: Alert['type'];
    acknowledged?: boolean;
    resolved?: boolean;
    limit?: number;
  }): Alert[] {
    let filtered = this.alerts;

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(a => a.type === filter.type);
      }
      if (filter.acknowledged !== undefined) {
        filtered = filtered.filter(a => a.acknowledged === filter.acknowledged);
      }
      if (filter.resolved !== undefined) {
        filtered = filtered.filter(a => a.resolved === filter.resolved);
      }
      if (filter.limit) {
        filtered = filtered.slice(0, filter.limit);
      }
    }

    return filtered;
  }

  getActiveAlerts(): Alert[] {
    return this.getAlerts({ 
      acknowledged: false, 
      resolved: false 
    });
  }

  getCriticalAlerts(): Alert[] {
    return this.getAlerts({ 
      type: 'critical', 
      resolved: false 
    });
  }

  addRule(rule: Omit<AlertRule, 'id'>): AlertRule {
    const newRule: AlertRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...rule
    };

    this.rules.push(newRule);
    this.emit('rule-added', newRule);
    return newRule;
  }

  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      const removed = this.rules.splice(index, 1)[0];
      this.emit('rule-removed', removed);
      return true;
    }
    return false;
  }

  toggleRule(ruleId: string): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = !rule.enabled;
      this.emit('rule-toggled', rule);
      return true;
    }
    return false;
  }

  getRules(): AlertRule[] {
    return [...this.rules];
  }

  clearAlerts(): void {
    this.alerts = [];
    this.emit('alerts-cleared');
  }

  getAlertStats() {
    const total = this.alerts.length;
    const active = this.getActiveAlerts().length;
    const critical = this.getCriticalAlerts().length;
    const acknowledged = this.alerts.filter(a => a.acknowledged).length;
    const resolved = this.alerts.filter(a => a.resolved).length;

    return {
      total,
      active,
      critical,
      acknowledged,
      resolved
    };
  }
}

export const alertManager = new AlertManager();
