
import { AIEventBus } from './AIEventBus';
import { securityBridge } from '../security/SecurityBridge';

export class AIHealthMonitor {
  private healthCheckInterval: number | null = null;
  
  constructor(
    private eventBus: AIEventBus,
    private modules: Map<string, any>
  ) {}

  startMonitoring() {
    if (this.healthCheckInterval) return;
    
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck();
      securityBridge.updateKernelStatus('ai', 'healthy');
    }, 30000);
  }

  stopMonitoring() {
    if (this.healthCheckInterval !== null) {
      window.clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private performHealthCheck() {
    try {
      // Check module health
      for (const [id, module] of this.modules.entries()) {
        if (!module) {
          console.warn(`Self-healing: Module ${id} is null, removing from registry`);
          this.modules.delete(id);
        }
      }
      
      this.eventBus.emitEvent({
        type: 'CONTEXT_UPDATED',
        payload: { healthCheck: 'completed', timestamp: Date.now() }
      });
    } catch (error) {
      console.error('AI health check failed:', error);
    }
  }
}
