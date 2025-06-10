
import { AgentResponse } from './TinyLlamaAgent';
import { AgentPersonality, formatResponseWithPersonality } from './AgentPersonalities';

export class AgentResponseHandler {
  static createResponse(
    agentId: string,
    input: string,
    loadedModules: Set<string>,
    personality: AgentPersonality | null,
    usePersonality: boolean,
    processingTime: number,
    realProcessing: boolean = false
  ): AgentResponse {
    const loadedModuleIds = Array.from(loadedModules);
    let response = '';
    let confidence = 0.1;
    let modelUsed = 'unified_fallback_template';

    if (loadedModuleIds.length > 0) {
      response = `🧠 Agent ${agentId} processed: "${input}"

🎯 Available modules: ${loadedModuleIds.join(', ')}
⚡ Status: WASM modules loaded via UnifiedWasmLoader
🔥 Processing: ${realProcessing ? 'Real WASM execution' : 'Module analysis only - NO REAL AI'}

${this.getAgentPurposeMessage(agentId)}`;

      confidence = realProcessing ? 0.8 : 0.3;
      modelUsed = loadedModuleIds[0] || 'unified_fallback';
    } else {
      response = `🤖 Agent ${agentId} CONFESSION: "${input}"

❌ ZERO WASM modules currently loaded - I'M BASICALLY USELESS!
📋 Attempted modules: reasoning_engine, neuromorphic - ALL FAILED!
🔄 Status: Pure fallback mode - NO REAL AI HAPPENING!
💡 I'm just giving you template responses and pretending to be smart!

${this.getAgentPurposeMessage(agentId)}

🚨 HONESTY ALERT: This is basically just a chatbot with delusions of grandeur!`;
    }

    // Apply personality if enabled
    if (usePersonality && personality) {
      response = formatResponseWithPersonality(
        personality,
        response,
        input,
        realProcessing
      );
      modelUsed += personality ? '_' + personality.comedyStyle : '';
    }

    return {
      text: response,
      confidence,
      processingTime,
      modelUsed,
      spikingActivity: [],
      reasoningSteps: [],
      realProcessing
    };
  }

  private static getAgentPurposeMessage(agentId: string): string {
    switch (agentId) {
      case 'chat-agent':
        return '💬 Designed for efficient conversation in resource-constrained environments';
      case 'intel-agent':
        return '🧠 Specialized for pattern recognition and neuromorphic processing';
      case 'reason-agent':
        return '🔬 Focused on logical reasoning and mathematical analysis';
      default:
        return '🤖 General-purpose intelligent agent';
    }
  }
}
