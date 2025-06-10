
import { RealAgentManager } from './RealAgentManager';
import { AgentRequest, AgentResponse } from '../wasm/types';

export interface AgentStatus {
  activeAgents: number;
  totalAgents: number;
  loadingAgents: number;
  errorAgents: number;
  capabilities: string[];
  lastUpdate: number;
}

export class SafeAgentManager {
  private realManager: RealAgentManager;
  private status: AgentStatus;
  private statusCallbacks: Set<(status: AgentStatus) => void> = new Set();

  constructor() {
    this.realManager = new RealAgentManager();
    this.status = {
      activeAgents: 0,
      totalAgents: 0,
      loadingAgents: 0,
      errorAgents: 0,
      capabilities: [],
      lastUpdate: Date.now()
    };
  }

  async initializeAgentSwarm(count: number = 3): Promise<boolean> {
    try {
      console.log(`🚀 SafeAgentManager: Initializing swarm with ${count} agents`);
      
      this.updateStatus({ loadingAgents: count });

      const success = await this.realManager.initialize();
      if (!success) {
        this.updateStatus({ errorAgents: count, loadingAgents: 0 });
        return false;
      }

      const agents = await this.realManager.createSwarm(count);
      
      this.updateStatus({
        activeAgents: agents.length,
        totalAgents: agents.length,
        loadingAgents: 0,
        errorAgents: count - agents.length,
        capabilities: this.realManager.getLoadedModules()
      });

      return agents.length > 0;
    } catch (error) {
      console.error('❌ SafeAgentManager initialization failed:', error);
      this.updateStatus({ 
        errorAgents: count, 
        loadingAgents: 0,
        capabilities: []
      });
      return false;
    }
  }

  async sendRequest(content: string, options: { urgency?: 'low' | 'medium' | 'high' | 'critical' } = {}): Promise<AgentResponse> {
    const request: AgentRequest = {
      content,
      urgency: options.urgency || 'medium'
    };

    return await this.realManager.sendRequest(request);
  }

  async testAgentCommunication(): Promise<boolean> {
    return await this.realManager.testCommunication();
  }

  getLoadingStatus(): AgentStatus {
    return { ...this.status };
  }

  onStatusChange(callback: (status: AgentStatus) => void): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  private updateStatus(updates: Partial<AgentStatus>): void {
    this.status = {
      ...this.status,
      ...updates,
      lastUpdate: Date.now()
    };

    this.statusCallbacks.forEach(callback => {
      try {
        callback(this.status);
      } catch (error) {
        console.error('❌ Status callback error:', error);
      }
    });
  }

  destroy(): void {
    this.realManager.destroy();
    this.statusCallbacks.clear();
    console.log('🧹 SafeAgentManager destroyed');
  }
}

export const safeAgentManager = new SafeAgentManager();
