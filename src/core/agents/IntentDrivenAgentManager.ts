
import { wasmLoader } from '../wasm/RuntimeWasmLoader';
import type { AgentCapability } from '../../types/wasm';

export interface Intent {
  type: string;
  confidence: number;
  data?: any;
}

class IntentDrivenAgentManager {
  private capabilities: Map<string, AgentCapability> = new Map();
  private activeAgents: Set<string> = new Set();

  constructor() {
    console.log('🤖 Intent-Driven Agent Manager initialized');
    this.setupCapabilities();
  }

  private setupCapabilities() {
    const capabilities: AgentCapability[] = [
      {
        id: 'neuromorphic',
        name: 'Neuromorphic Processing',
        wasmModule: 'neuromorphic',
        fallback: () => ({ type: 'neuromorphic', status: 'fallback_active' })
      },
      {
        id: 'cma_neural_os',
        name: 'CMA Neural OS',
        wasmModule: 'cma_neural_os',
        fallback: () => ({ type: 'neural_os', status: 'fallback_active' })
      }
    ];

    capabilities.forEach(cap => {
      this.capabilities.set(cap.id, cap);
    });

    console.log(`📋 Registered ${capabilities.length} agent capabilities`);
  }

  async handleIntent(intent: Intent): Promise<any> {
    console.log('🤖 Agent Manager received intent:', intent);
    
    const requiredCapabilities = this.determineRequiredCapabilities(intent);
    console.log('🚀 Loading required capabilities:', requiredCapabilities);

    const results = await Promise.allSettled(
      requiredCapabilities.map(capId => this.activateCapability(capId))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Successfully activated ${successful}/${requiredCapabilities.length} capabilities`);

    return {
      intent,
      activatedCapabilities: successful,
      totalRequested: requiredCapabilities.length,
      results: results.map((r, i) => ({
        capability: requiredCapabilities[i],
        status: r.status,
        result: r.status === 'fulfilled' ? r.value : r.reason
      }))
    };
  }

  private determineRequiredCapabilities(intent: Intent): string[] {
    // Simple intent mapping - can be made more sophisticated
    switch (intent.type) {
      case 'process_neural':
        return ['neuromorphic', 'cma_neural_os'];
      case 'analyze_data':
        return ['neuromorphic'];
      default:
        return ['neuromorphic', 'cma_neural_os'];
    }
  }

  private async activateCapability(capabilityId: string): Promise<any> {
    const capability = this.capabilities.get(capabilityId);
    if (!capability) {
      throw new Error(`Unknown capability: ${capabilityId}`);
    }

    try {
      if (capability.wasmModule) {
        const wasmModule = await wasmLoader.loadModule(capability.wasmModule);
        this.activeAgents.add(capabilityId);
        return {
          capability: capability.name,
          status: 'wasm_loaded',
          module: wasmModule
        };
      } else {
        const fallbackResult = capability.fallback();
        this.activeAgents.add(capabilityId);
        return {
          capability: capability.name,
          status: 'fallback_active',
          result: fallbackResult
        };
      }
    } catch (error) {
      console.error(`❌ Failed to activate: ${capability.name}`);
      // Use fallback
      const fallbackResult = capability.fallback();
      this.activeAgents.add(capabilityId);
      return {
        capability: capability.name,
        status: 'fallback_used',
        result: fallbackResult,
        error: error
      };
    }
  }

  getActiveAgents(): string[] {
    return Array.from(this.activeAgents);
  }

  getCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities.values());
  }
}

export const agentManager = new IntentDrivenAgentManager();
