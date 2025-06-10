import { TinyLlamaDebugger } from './TinyLlamaDebugger';
import { unifiedWasmLoader } from '../wasm/UnifiedWasmLoader';
import { GodmodeTinyLlamaAgent } from './GodmodeTinyLlamaAgent';
import { getRandomPersonality, AgentPersonality, formatResponseWithPersonality } from './AgentPersonalities';
import { AgentResponseHandler } from './AgentResponseHandler';
import { WasmProcessor } from './WasmProcessor';

export interface AgentResponse {
  text: string;
  confidence: number;
  processingTime: number;
  modelUsed: string;
  spikingActivity?: number[];
  reasoningSteps?: string[];
  realProcessing: boolean;
}

export class TinyLlamaAgent {
  private agentId: string;
  private preferredModules: string[];
  private isInitialized = false;
  private loadedModules: Set<string> = new Set();
  private godmodeAgent: GodmodeTinyLlamaAgent | null = null;
  private godmodeEnabled = false;
  private personality: AgentPersonality | null = null;
  private usePersonality = false;

  constructor(agentId: string, preferredModules: string[] = ['reasoning_engine', 'neuromorphic'], enableGodmode: boolean = false, usePersonality: boolean = false) {
    this.agentId = agentId;
    this.preferredModules = preferredModules;
    this.godmodeEnabled = enableGodmode;
    this.usePersonality = usePersonality;
    
    if (this.usePersonality) {
      this.personality = getRandomPersonality();
      console.log(`🎭 Agent ${agentId} assigned personality: ${this.personality.name}`);
    }
    
    if (this.godmodeEnabled) {
      this.godmodeAgent = new GodmodeTinyLlamaAgent(agentId);
    }
  }

  async initialize(): Promise<boolean> {
    try {
      console.log(`🤖 Initializing TinyLlama Agent: ${this.agentId} (Godmode: ${this.godmodeEnabled})`);
      
      if (this.godmodeEnabled && this.godmodeAgent) {
        const result = await this.godmodeAgent.initialize();
        this.isInitialized = result;
        return result;
      }
      
      // Load WASM modules
      for (const moduleId of this.preferredModules) {
        console.log(`🔍 [${this.agentId}] Attempting to load: ${moduleId}`);
        
        const result = await unifiedWasmLoader.loadModule(moduleId);
        
        if (result.success) {
          this.loadedModules.add(moduleId);
          console.log(`✅ [${this.agentId}] Module ${moduleId} loaded successfully`);
        } else {
          console.warn(`⚠️ [${this.agentId}] Module ${moduleId} failed: ${result.error}`);
        }
      }

      this.isInitialized = true;
      const loadedCount = this.loadedModules.size;
      
      if (loadedCount > 0) {
        console.log(`✅ TinyLlama Agent ${this.agentId} initialized with ${loadedCount}/${this.preferredModules.length} modules`);
      } else {
        console.log(`⚠️ TinyLlama Agent ${this.agentId} initialized with 0 modules - using fallback responses`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to initialize agent ${this.agentId}:`, error);
      this.isInitialized = true;
      return true;
    }
  }

  async processRequest(input: string): Promise<AgentResponse> {
    if (!this.isInitialized && !this.godmodeEnabled) {
      throw new Error(`Agent ${this.agentId} not initialized`);
    }

    if (this.godmodeEnabled && this.godmodeAgent) {
      return this.processGodmodeRequest(input);
    }

    const startTime = Date.now();
    let spikingActivity: number[] = [];
    let realProcessing = false;

    try {
      // Try WASM processing
      const wasmResult = await WasmProcessor.processWithWasm(input, this.loadedModules, this.agentId);
      
      if (wasmResult.success) {
        realProcessing = true;
      }

      // Generate spiking activity if neuromorphic module is available
      if (this.loadedModules.has('neuromorphic')) {
        spikingActivity = WasmProcessor.generateSpikingPattern(input);
      }

      const processingTime = Date.now() - startTime;

      return AgentResponseHandler.createResponse(
        this.agentId,
        input,
        this.loadedModules,
        this.personality,
        this.usePersonality,
        processingTime,
        realProcessing
      );
    } catch (error) {
      console.error(`❌ Agent ${this.agentId} processing failed:`, error);
      throw error;
    }
  }

  private async processGodmodeRequest(input: string): Promise<AgentResponse> {
    const godmodeResponse = await this.godmodeAgent!.processRequest(input);
    
    let finalText = godmodeResponse.text;
    
    if (this.usePersonality && this.personality) {
      const { formatResponseWithPersonality } = await import('./AgentPersonalities');
      finalText = formatResponseWithPersonality(
        this.personality, 
        godmodeResponse.text, 
        input, 
        godmodeResponse.realProcessing
      );
    }
    
    return {
      text: finalText,
      confidence: godmodeResponse.confidence,
      processingTime: godmodeResponse.processingTime,
      modelUsed: `godmode_${godmodeResponse.intelligenceChain.join('_')}${this.personality ? '_' + this.personality.comedyStyle : ''}`,
      spikingActivity: godmodeResponse.spikingActivity,
      reasoningSteps: godmodeResponse.reasoningSteps,
      realProcessing: godmodeResponse.realProcessing
    };
  }

  getStatus(): string {
    if (!this.isInitialized) return 'Not Initialized';
    
    if (this.godmodeEnabled && this.godmodeAgent) {
      return this.godmodeAgent.getStatus();
    }
    
    const loadedCount = this.loadedModules.size;
    const totalCount = this.preferredModules.length;

    if (loadedCount === 0) {
      return 'Fallback Mode (No WASM)';
    } else if (loadedCount === totalCount) {
      return 'All Modules Loaded (Unified)';
    } else {
      return `Partial (${loadedCount}/${totalCount} modules)`;
    }
  }

  isModelLoaded(): boolean {
    if (this.godmodeEnabled && this.godmodeAgent) {
      return this.godmodeAgent.isModelLoaded();
    }
    return this.isInitialized;
  }

  getAvailableModules(): string[] {
    if (this.godmodeEnabled && this.godmodeAgent) {
      return this.godmodeAgent.getAvailableModules();
    }
    return Array.from(this.loadedModules);
  }

  getModuleDetails(): any {
    if (this.godmodeEnabled && this.godmodeAgent) {
      return this.godmodeAgent.getModuleDetails();
    }
    
    return Array.from(this.loadedModules).map(moduleId => ({
      id: moduleId,
      loaded: unifiedWasmLoader.isLoaded(moduleId),
      status: 'Loaded via UnifiedWasmLoader'
    }));
  }

  async enableGodmode(): Promise<boolean> {
    if (this.godmodeEnabled) {
      console.log(`Agent ${this.agentId} is already in GODMODE`);
      return true;
    }
    
    console.log(`🔥 Enabling GODMODE for agent ${this.agentId}...`);
    
    this.godmodeAgent = new GodmodeTinyLlamaAgent(this.agentId);
    const initialized = await this.godmodeAgent.initialize();
    
    if (initialized) {
      this.godmodeEnabled = true;
      console.log(`🚀 GODMODE ACTIVATED for agent ${this.agentId}!`);
    } else {
      console.error(`❌ Failed to enable GODMODE for agent ${this.agentId}`);
    }
    
    return initialized;
  }

  setPersonality(personality: AgentPersonality | null) {
    this.personality = personality;
    this.usePersonality = personality !== null;
    console.log(`🎭 Agent ${this.agentId} personality ${personality ? 'set to: ' + personality.name : 'disabled'}`);
  }

  getPersonality(): AgentPersonality | null {
    return this.personality;
  }
}
