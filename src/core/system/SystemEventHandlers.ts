import { SystemEventBus } from '../events/SystemEventBus';
import { DistributedEthicalGuard } from '../ethics/DistributedEthicalGuard';
import { createSystemEvent } from '../utils/eventUtils';

export class SystemEventHandlers {
  private events: SystemEventBus;
  private moduleRestartAttempts: Record<string, number> = {};
  
  constructor(events: SystemEventBus) {
    this.events = events;
  }

  public handleSecurityCritical = (alert: any) => {
    this.events.emitEvent({
      type: 'SECURITY_ALERT', 
      payload: {
        ...alert,
        level: 'critical',
        systemTimestamp: Date.now()
      }
    });
  };

  public handleEthicsUpdated = (event: any) => {
    this.events.emitEvent({
      type: 'ethics:policy-changed', 
      payload: event
    });
  };

  public registerSelfHealingHandlers(pluginRegistry: any, state: Map<string, any>): void {
    this.events.on('KERNEL_RESET_REQUEST', (event) => {
      if (!event || !event.payload) return;
      
      const { kernelId, reason } = event.payload;
      console.log(`Attempting to reset kernel state for: ${kernelId}, reason: ${reason}`);
      
      if (kernelId === 'system') {
        state.forEach((_, key) => {
          if (key !== 'system:safeMode') {
            state.delete(key);
          }
        });
        
        console.log('System kernel state has been reset');
        this.events.emit('SYSTEM_STATE_RESET', { timestamp: Date.now() });
      } else {
        this.events.emit(`${kernelId.toUpperCase()}_RESET_REQUEST`, {
          reason,
          timestamp: Date.now()
        });
      }
    });
    
    this.events.on('MODULE_RESTART_REQUEST', (event) => {
      if (!event || !event.payload) return;
      
      const { moduleId, reason } = event.payload;
      
      if (!moduleId) {
        console.error('Module restart requested without moduleId');
        return;
      }
      
      this.handleModuleRestart(moduleId, reason, pluginRegistry);
    });

    this.registerSafetyEventHandlers(state);
  }

  private handleModuleRestart(moduleId: string, reason: string, pluginRegistry: any): void {
    if (!this.moduleRestartAttempts[moduleId]) {
      this.moduleRestartAttempts[moduleId] = 0;
    }
    
    this.moduleRestartAttempts[moduleId]++;
    
    if (this.moduleRestartAttempts[moduleId] > 3) {
      console.warn(`Too many restart attempts for module ${moduleId}, marking as failed`);
      this.events.emit('MODULE_RESTART_FAILED', {
        moduleId,
        reason: 'Too many restart attempts',
        timestamp: Date.now()
      });
      return;
    }
    
    console.log(`Attempting to restart module: ${moduleId}, reason: ${reason}`);
    
    const module = pluginRegistry.getPlugin(moduleId);
    
    if (!module) {
      console.warn(`Module ${moduleId} not found, cannot restart`);
      return;
    }
    
    try {
      module.destroy();
      pluginRegistry.unregisterPlugin(moduleId);
      
      pluginRegistry.registerPlugin(module);
      const success = module.initialize(pluginRegistry);
      
      if (success) {
        console.log(`Module ${moduleId} successfully restarted`);
        this.events.emit('MODULE_RESTART_SUCCESS', {
          moduleId,
          timestamp: Date.now()
        });
        this.moduleRestartAttempts[moduleId] = 0;
      } else {
        console.error(`Failed to restart module ${moduleId}`);
        this.events.emit('MODULE_RESTART_FAILED', {
          moduleId,
          reason: 'Initialization failed',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error(`Error restarting module ${moduleId}:`, error);
      this.events.emit('MODULE_RESTART_FAILED', {
        moduleId,
        reason: error.message || 'Unknown error',
        timestamp: Date.now()
      });
    }
  }

  private registerSafetyEventHandlers(state: Map<string, any>): void {
    this.events.on('SAFETY_ERROR_DETECTED', (event) => {
      if (!event || !event.payload) return;
      
      const { error } = event.payload;
      console.log(`SystemKernel received safety error: ${error.message}`);
      
      state.set('system:lastError', {
        message: error.message,
        timestamp: Date.now(),
        severity: error.severity
      });
    });
    
    this.events.on('SAFETY_RECOVERY_SUCCESS', (event) => {
      if (!event || !event.payload) return;
      
      const { error, strategyId } = event.payload;
      console.log(`Recovery successful for error: ${error.message} using strategy: ${strategyId}`);
      
      state.set('system:lastRecovery', {
        error: error.message,
        strategy: strategyId,
        timestamp: Date.now(),
        successful: true
      });
    });
  }
}
