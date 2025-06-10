
import { IntelligenceOrchestrator, GodmodeResponse } from './IntelligenceOrchestrator';
import { ethicsEngine } from '../ethics/EthicsEngine';

export class GodmodeTinyLlamaAgent {
  private agentId: string;
  private orchestrator: IntelligenceOrchestrator;
  private isInitialized = false;

  constructor(agentId: string) {
    this.agentId = agentId;
    this.orchestrator = new IntelligenceOrchestrator(agentId);
  }

  async initialize(): Promise<boolean> {
    try {
      console.log(`🚀 Initializing GODMODE TinyLlama Agent: ${this.agentId}`);
      
      // Verify ethics engine is ready (CRITICAL)
      if (!ethicsEngine.isInitialized()) {
        console.error('❌ Ethics engine not initialized - GODMODE BLOCKED');
        return false;
      }

      // Configure godmode modules with priority ordering
      const godmodeModules = [
        {
          id: 'neuromorphic',
          wasmPath: '/wasm/neuromorphic.wasm',
          capabilities: ['spike_processing', 'pattern_recognition', 'intuition'],
          priority: 1
        },
        {
          id: 'reasoning_engine',
          wasmPath: '/wasm/reasoning_engine.wasm',
          capabilities: ['logical_reasoning', 'analysis', 'deduction'],
          priority: 2
        },
        {
          id: 'hybrid_intelligence',
          wasmPath: '/wasm/hybrid_intelligence.wasm',
          capabilities: ['orchestration', 'synthesis', 'meta_reasoning'],
          priority: 3
        },
        {
          id: 'llama_bridge',
          wasmPath: '/wasm/llama_bridge.wasm',
          capabilities: ['language_generation', 'conversation', 'creativity'],
          priority: 4
        }
      ];

      const initialized = await this.orchestrator.initialize(godmodeModules);
      
      if (initialized) {
        this.isInitialized = true;
        const moduleCount = this.orchestrator.getModuleCount();
        console.log(`✅ GODMODE TinyLlama Agent ${this.agentId} initialized with ${moduleCount} intelligence modules`);
        console.log(`🧠 Loaded modules: ${this.orchestrator.getLoadedModules().join(', ')}`);
        console.log(`🛡️ Ethics engine: ACTIVE and monitoring`);
      } else {
        console.error(`❌ Failed to initialize GODMODE agent ${this.agentId}`);
      }
      
      return initialized;
    } catch (error) {
      console.error(`❌ GODMODE initialization failed for agent ${this.agentId}:`, error);
      return false;
    }
  }

  async processRequest(input: string): Promise<GodmodeResponse> {
    if (!this.isInitialized) {
      throw new Error(`GODMODE Agent ${this.agentId} not initialized`);
    }

    try {
      console.log(`🧠 GODMODE Agent ${this.agentId} processing: "${input}"`);
      
      // Process with full godmode intelligence and ethical oversight
      const response = await this.orchestrator.processWithGodmodeIntelligence(input);
      
      console.log(`🔥 GODMODE processing complete - Ethical: ${response.ethicallyApproved}`);
      console.log(`⚡ Intelligence chain: ${response.intelligenceChain.join(' → ')}`);
      
      return response;
    } catch (error) {
      console.error(`❌ GODMODE Agent ${this.agentId} processing failed:`, error);
      throw error;
    }
  }

  getStatus(): string {
    if (!this.isInitialized) return 'Not Initialized';
    
    const moduleCount = this.orchestrator.getModuleCount();
    const ethicsStatus = ethicsEngine.isInitialized() ? 'ACTIVE' : 'OFFLINE';
    
    return `GODMODE (${moduleCount} modules, Ethics: ${ethicsStatus})`;
  }

  isModelLoaded(): boolean {
    return this.isInitialized && this.orchestrator.isReady();
  }

  getAvailableModules(): string[] {
    return this.orchestrator.getLoadedModules();
  }

  getModuleDetails(): any {
    const modules = this.orchestrator.getLoadedModules();
    return modules.map(moduleId => ({
      id: moduleId,
      loaded: true,
      status: 'GODMODE ACTIVE',
      ethicallyMonitored: true
    }));
  }
}
