
import { WASMLoader } from '../wasm/WASMLoader';
import { CosmicAgent } from '../../wasm/cosmic_intelligence';
import { HybridSwarm } from '../wasm/types';
import { NeuromorphicProcessor } from '../../wasm/neuromorphic';
import { AgentRequest, AgentResponse } from '../wasm/types';

export type AgentType = 'cosmic' | 'hybrid' | 'neuromorphic' | 'kernel' | 'bridge';

export class AgentFactory {
  private static agentCounter = 0;

  static async createAgent(type: AgentType): Promise<string> {
    const agentId = `agent_${type}_${++this.agentCounter}`;
    
    try {
      switch (type) {
        case 'cosmic':
          const cosmicModule = await WASMLoader.loadModule('cosmic_intelligence', '/wasm/cosmic_intelligence.wasm');
          if (cosmicModule) {
            const agent = new CosmicAgent();
            console.log(`🚀 Created Cosmic Agent: ${agentId}`);
            return agentId;
          }
          break;

        case 'hybrid':
          const hybridModule = await WASMLoader.loadModule('hybrid_intelligence', '/wasm/hybrid_intelligence.wasm');
          if (hybridModule) {
            console.log(`🧠 Created Hybrid Agent: ${agentId}`);
            return agentId;
          }
          break;

        case 'neuromorphic':
          const neuroModule = await WASMLoader.loadModule('neuromorphic', '/wasm/neuromorphic.wasm');
          if (neuroModule) {
            const processor = new NeuromorphicProcessor();
            console.log(`🧬 Created Neuromorphic Agent: ${agentId}`);
            return agentId;
          }
          break;

        case 'kernel':
          const kernelModule = await WASMLoader.loadModule('cosmic_kernel', '/wasm/cosmic_kernel.wasm');
          if (kernelModule) {
            console.log(`⚡ Created Kernel Agent: ${agentId}`);
            return agentId;
          }
          break;

        case 'bridge':
          const bridgeModule = await WASMLoader.loadModule('llama_bridge', '/wasm/llama_bridge.wasm');
          if (bridgeModule) {
            console.log(`🦙 Created Bridge Agent: ${agentId}`);
            return agentId;
          }
          break;

        default:
          throw new Error(`Unknown agent type: ${type}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create ${type} agent:`, error);
      throw error;
    }

    throw new Error(`Failed to create agent of type: ${type}`);
  }

  static async processRequest(agentId: string, request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();
    const agentType = agentId.split('_')[1] as AgentType;

    try {
      let response = '';
      
      switch (agentType) {
        case 'cosmic':
          if (WASMLoader.isModuleLoaded('cosmic_intelligence')) {
            const agent = new CosmicAgent();
            response = agent.cosmicThink(request.content, 'universal');
          }
          break;

        case 'hybrid':
          const hybridModule = WASMLoader.getLoadedModule('hybrid_intelligence');
          if (hybridModule) {
            const swarm = new hybridModule.HybridSwarm();
            response = swarm.process_intelligent_request(request.content, request.urgency);
          }
          break;

        case 'neuromorphic':
          if (WASMLoader.isModuleLoaded('neuromorphic')) {
            const processor = new NeuromorphicProcessor();
            const testData = new TextEncoder().encode(request.content);
            const result = processor.process_spikes(testData);
            response = `Neuromorphic processing complete: ${result.length} bytes processed`;
          }
          break;

        default:
          response = `Agent ${agentId} processed: ${request.content}`;
      }

      const processingTime = Date.now() - startTime;

      return {
        agentId,
        agentType,
        response,
        processingTime,
        confidence: 0.85
      };
    } catch (error) {
      console.error(`❌ Agent ${agentId} request failed:`, error);
      return {
        agentId,
        agentType,
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        processingTime: Date.now() - startTime,
        confidence: 0.0
      };
    }
  }
}
