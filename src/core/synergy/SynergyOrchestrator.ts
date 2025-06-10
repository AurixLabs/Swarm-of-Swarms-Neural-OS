
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { SDKApp } from '../sdk/SDKRegistry';
import { SynergyEffect } from '../sdk/AppSynergy';

export interface SynergyState {
  activeConnections: Map<string, Set<string>>;
  synergyScores: Map<string, number>;
  systemBoost: number;
}

export class SynergyOrchestrator {
  private eventBus = new BrowserEventEmitter();
  private state: SynergyState = {
    activeConnections: new Map(),
    synergyScores: new Map(),
    systemBoost: 0
  };

  public activateSynergy(app1: SDKApp, app2: SDKApp): SynergyEffect | null {
    // Calculate potential synergy
    const synergy = this.calculateSynergyPotential(app1, app2);
    
    if (synergy && synergy.impact > 0.3) { // Minimum threshold for activation
      // Record the connection
      this.recordConnection(app1.id, app2.id);
      
      // Update system boost
      this.updateSystemBoost();
      
      // Notify system of new synergy
      this.eventBus.emit('synergy:activated', {
        source: app1.id,
        target: app2.id,
        impact: synergy.impact,
        timestamp: Date.now()
      });
      
      return synergy;
    }
    
    return null;
  }

  private calculateSynergyPotential(app1: SDKApp, app2: SDKApp): SynergyEffect | null {
    const commonCapabilities = app1.capabilities.filter(cap => 
      app2.capabilities.includes(cap)
    );

    if (commonCapabilities.length === 0) return null;

    const impact = (commonCapabilities.length / 
      Math.max(app1.capabilities.length, app2.capabilities.length)) * 
      this.getCapabilityMultiplier(commonCapabilities);

    return {
      source: { id: app1.id, name: app1.name },
      target: { id: app2.id, name: app2.name },
      type: this.determineSynergyType(commonCapabilities),
      impact,
      description: `Enhanced ${commonCapabilities.join(', ')} capabilities`
    };
  }

  private getCapabilityMultiplier(capabilities: string[]): number {
    // Higher multiplier for more complex capabilities
    return capabilities.some(cap => 
      cap.includes('ai') || cap.includes('ml') || cap.includes('analytics')
    ) ? 1.5 : 1.0;
  }

  private determineSynergyType(capabilities: string[]): 'enhance' | 'transform' | 'combine' {
    if (capabilities.some(cap => cap.includes('transform'))) return 'transform';
    if (capabilities.some(cap => cap.includes('combine'))) return 'combine';
    return 'enhance';
  }

  private recordConnection(app1Id: string, app2Id: string): void {
    // Record bidirectional connection
    this.ensureConnection(app1Id).add(app2Id);
    this.ensureConnection(app2Id).add(app1Id);
  }

  private ensureConnection(appId: string): Set<string> {
    if (!this.state.activeConnections.has(appId)) {
      this.state.activeConnections.set(appId, new Set());
    }
    return this.state.activeConnections.get(appId)!;
  }

  private updateSystemBoost(): void {
    let totalSynergy = 0;
    this.state.activeConnections.forEach((connections, appId) => {
      const synergyScore = connections.size * 0.1; // 10% boost per connection
      this.state.synergyScores.set(appId, synergyScore);
      totalSynergy += synergyScore;
    });
    
    this.state.systemBoost = Math.min(totalSynergy, 2.0); // Cap at 200% boost
  }

  public getSystemBoost(): number {
    return this.state.systemBoost;
  }

  public getSynergyScore(appId: string): number {
    return this.state.synergyScores.get(appId) || 0;
  }

  public on(event: string, handler: (data: any) => void): () => void {
    this.eventBus.on(event, handler);
    return () => this.eventBus.off(event, handler);
  }
}

export const synergyOrchestrator = new SynergyOrchestrator();
