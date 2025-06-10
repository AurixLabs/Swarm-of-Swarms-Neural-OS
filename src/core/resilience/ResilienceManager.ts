
import { BrowserEventEmitter } from '../events/BrowserEventEmitter';

export interface ResilienceConfig {
  maxRetries: number;
  backoffMultiplier: number;
  healingInterval: number;
  resourceThresholds: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export interface SystemHealth {
  overall: number;
  components: Record<string, number>;
  issues: string[];
  recommendations: string[];
}

export interface HealingAction {
  id: string;
  type: 'restart' | 'scale' | 'migrate' | 'throttle';
  target: string;
  priority: number;
  estimatedImpact: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

export class ResilienceManager extends BrowserEventEmitter {
  private config: ResilienceConfig;
  private healingActions: Map<string, HealingAction> = new Map();
  private systemHealth: SystemHealth;
  private healingTimer: number | null = null;

  constructor(config: Partial<ResilienceConfig> = {}) {
    super();
    this.config = {
      maxRetries: 3,
      backoffMultiplier: 2,
      healingInterval: 5000,
      resourceThresholds: {
        cpu: 80,
        memory: 85,
        network: 90
      },
      ...config
    };

    this.systemHealth = {
      overall: 100,
      components: {},
      issues: [],
      recommendations: []
    };

    this.startAutoHealing();
  }

  private startAutoHealing(): void {
    if (this.healingTimer) {
      clearInterval(this.healingTimer);
    }

    this.healingTimer = window.setInterval(() => {
      this.performHealthCheck();
      this.executeHealingActions();
    }, this.config.healingInterval);
  }

  private async performHealthCheck(): Promise<void> {
    const components = ['system', 'ai', 'memory', 'security', 'network'];
    const newHealth: SystemHealth = {
      overall: 0,
      components: {},
      issues: [],
      recommendations: []
    };

    let totalHealth = 0;
    for (const component of components) {
      const health = await this.checkComponentHealth(component);
      newHealth.components[component] = health;
      totalHealth += health;

      if (health < 70) {
        newHealth.issues.push(`${component} kernel performance degraded (${health}%)`);
        this.planHealingAction(component, health);
      }
    }

    newHealth.overall = Math.round(totalHealth / components.length);

    // Generate recommendations
    if (newHealth.overall < 80) {
      newHealth.recommendations.push('Consider scaling resources');
    }
    if (newHealth.issues.length > 2) {
      newHealth.recommendations.push('Initiate emergency protocols');
    }

    this.systemHealth = newHealth;
    this.emit('health-updated', newHealth);
  }

  private async checkComponentHealth(component: string): Promise<number> {
    // Simulate health check with realistic variations
    const baseHealth = 85 + Math.random() * 15;
    const cpuLoad = Math.random() * 100;
    const memoryUsage = Math.random() * 100;

    let health = baseHealth;

    // Adjust based on resource usage
    if (cpuLoad > this.config.resourceThresholds.cpu) {
      health -= (cpuLoad - this.config.resourceThresholds.cpu) * 0.5;
    }
    if (memoryUsage > this.config.resourceThresholds.memory) {
      health -= (memoryUsage - this.config.resourceThresholds.memory) * 0.3;
    }

    return Math.max(0, Math.min(100, Math.round(health)));
  }

  private planHealingAction(component: string, health: number): void {
    if (this.healingActions.has(component)) {
      return; // Already have an action for this component
    }

    let actionType: HealingAction['type'] = 'restart';
    let priority = 1;

    if (health < 30) {
      actionType = 'migrate';
      priority = 3;
    } else if (health < 50) {
      actionType = 'scale';
      priority = 2;
    } else if (health < 70) {
      actionType = 'throttle';
      priority = 1;
    }

    const action: HealingAction = {
      id: `heal-${component}-${Date.now()}`,
      type: actionType,
      target: component,
      priority,
      estimatedImpact: 100 - health,
      status: 'pending'
    };

    this.healingActions.set(component, action);
    this.emit('healing-planned', action);
  }

  private async executeHealingActions(): Promise<void> {
    const pendingActions = Array.from(this.healingActions.values())
      .filter(action => action.status === 'pending')
      .sort((a, b) => b.priority - a.priority);

    for (const action of pendingActions.slice(0, 2)) { // Execute max 2 at a time
      await this.executeAction(action);
    }
  }

  private async executeAction(action: HealingAction): Promise<void> {
    action.status = 'executing';
    this.emit('healing-started', action);

    try {
      console.log(`🔄 Executing ${action.type} on ${action.target}`);
      
      // Simulate healing action
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      action.status = 'completed';
      this.healingActions.delete(action.target);
      this.emit('healing-completed', action);
      
      console.log(`✅ Healing action completed: ${action.type} on ${action.target}`);
    } catch (error) {
      action.status = 'failed';
      this.emit('healing-failed', { action, error });
      console.error(`❌ Healing action failed: ${action.type} on ${action.target}`, error);
    }
  }

  getSystemHealth(): SystemHealth {
    return { ...this.systemHealth };
  }

  getActiveActions(): HealingAction[] {
    return Array.from(this.healingActions.values());
  }

  forceHealing(component: string): void {
    this.planHealingAction(component, 30); // Force healing by simulating low health
  }

  destroy(): void {
    if (this.healingTimer) {
      clearInterval(this.healingTimer);
      this.healingTimer = null;
    }
    this.healingActions.clear();
    this.removeAllListeners();
  }
}

export const resilienceManager = new ResilienceManager();
