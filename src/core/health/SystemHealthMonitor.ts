
import { SystemEventBus } from '../events/SystemEventBus';
import { PluginRegistry } from '../plugins/PluginRegistry';
import { createSystemEvent } from '../utils/eventUtils';

export class SystemHealthMonitor {
  private isEnabled = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly events: SystemEventBus;
  private readonly pluginRegistry: PluginRegistry;

  constructor(events: SystemEventBus, pluginRegistry: PluginRegistry) {
    this.events = events;
    this.pluginRegistry = pluginRegistry;
  }

  public enable(): void {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    this.monitoringInterval = setInterval(() => this.checkSystemHealth(), 30000);
    
    this.events.emitEvent(createSystemEvent('SYSTEM_HEALTH_MONITORING', {
      status: 'enabled',
      timestamp: Date.now()
    }));
  }

  public disable(): void {
    if (!this.isEnabled) return;
    
    this.isEnabled = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.events.emitEvent(createSystemEvent('SYSTEM_HEALTH_MONITORING', {
      status: 'disabled',
      timestamp: Date.now()
    }));
  }

  private checkSystemHealth(): void {
    // Check kernel modules health
    const moduleStatuses = this.pluginRegistry.listPlugins().map(id => {
      const module = this.pluginRegistry.getPlugin(id);
      return {
        id,
        status: module ? 'healthy' : 'unavailable',
        timestamp: Date.now()
      };
    });
    
    // Emit health status event
    this.events.emitEvent(createSystemEvent('SYSTEM_HEALTH_STATUS', {
      modules: moduleStatuses,
      overallStatus: moduleStatuses.every(m => m.status === 'healthy') ? 'healthy' : 'degraded',
      timestamp: Date.now()
    }));
  }
}
