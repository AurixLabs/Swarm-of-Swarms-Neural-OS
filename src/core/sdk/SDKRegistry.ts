
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { systemKernel } from '../SystemKernel';
import { aiKernel } from '../AIKernel';
import { uiKernel } from '../UIKernel';

export interface SDKApp {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  initialize: () => Promise<void>;
  destroy: () => void;
  onEvent?: (event: any) => void;
}

export class SDKRegistry {
  private apps = new Map<string, SDKApp>();
  private eventBus = new BrowserEventEmitter();
  private synergyGraph = new Map<string, Set<string>>();
  
  constructor() {
    // Listen for system events that might be relevant to SDK apps
    systemKernel.events.onEvent('INTENT_DETECTED', this.handleSystemEvent);
    aiKernel.events.onEvent('CONTEXT_UPDATED', this.handleAIEvent);
    uiKernel.events.onEvent('LAYOUT_CHANGED', this.handleUIEvent);
  }

  registerApp(app: SDKApp): void {
    if (this.apps.has(app.id)) {
      console.warn(`App ${app.id} is already registered`);
      return;
    }

    this.apps.set(app.id, app);
    this.analyzeSynergies(app);
    app.initialize().catch(console.error);
  }

  private analyzeSynergies(newApp: SDKApp): void {
    // Build connections between apps based on capabilities
    for (const [id, existingApp] of this.apps) {
      const synergies = this.findSynergies(newApp, existingApp);
      if (synergies.length > 0) {
        const connections = this.synergyGraph.get(newApp.id) || new Set();
        connections.add(existingApp.id);
        this.synergyGraph.set(newApp.id, connections);
      }
    }
  }

  private findSynergies(app1: SDKApp, app2: SDKApp): string[] {
    return app1.capabilities.filter(cap => 
      app2.capabilities.includes(cap)
    );
  }

  private handleSystemEvent = (event: any) => {
    // Broadcast relevant events to connected apps
    this.apps.forEach(app => {
      if (app.onEvent) {
        app.onEvent({
          type: 'SYSTEM_EVENT',
          source: 'system',
          payload: event
        });
      }
    });
  };

  private handleAIEvent = (event: any) => {
    // Find apps that can enhance AI responses
    const relevantApps = Array.from(this.apps.values())
      .filter(app => app.capabilities.includes('ai-enhancement'));
      
    relevantApps.forEach(app => {
      if (app.onEvent) {
        app.onEvent({
          type: 'AI_EVENT',
          source: 'ai',
          payload: event
        });
      }
    });
  };

  private handleUIEvent = (event: any) => {
    // Update UI based on collective app capabilities
    this.apps.forEach(app => {
      if (app.onEvent) {
        app.onEvent({
          type: 'UI_EVENT',
          source: 'ui',
          payload: event
        });
      }
    });
  }

  getConnectedApps(appId: string): SDKApp[] {
    const connections = this.synergyGraph.get(appId);
    if (!connections) return [];
    
    return Array.from(connections)
      .map(id => this.apps.get(id))
      .filter((app): app is SDKApp => !!app);
  }

  getSynergyScore(appId: string): number {
    const connections = this.synergyGraph.get(appId);
    return connections ? connections.size / this.apps.size : 0;
  }
}

// Export singleton instance
export const sdkRegistry = new SDKRegistry();
