
// Core intent detection system
export class IntentDetector {
  private static instance: IntentDetector;
  
  private constructor() {
    console.log('🎯 IntentDetector initialized');
  }
  
  static getInstance(): IntentDetector {
    if (!IntentDetector.instance) {
      IntentDetector.instance = new IntentDetector();
    }
    return IntentDetector.instance;
  }
  
  detectIntent(input: string): string[] {
    const intents: string[] = [];
    
    // Agent-related intent patterns
    const agentPatterns = [
      /\b(agent|agents|deploy|activate|neural|swarm|intelligence)\b/i,
      /\b(analyze|data|processing|cognitive)\b/i,
      /\b(communication|message|chat|interface)\b/i
    ];
    
    agentPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        intents.push('agent_activation');
      }
    });
    
    return intents;
  }
}

export const intentDetector = IntentDetector.getInstance();
