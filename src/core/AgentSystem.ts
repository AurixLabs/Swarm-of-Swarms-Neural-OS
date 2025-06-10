
// Pure agent system - no UI dependencies
export class AgentSystem {
  private agents: Map<string, any> = new Map();
  
  constructor() {
    console.log('🧠 CMA Agent System initialized - UI-free');
  }
  
  registerAgent(id: string, agent: any) {
    this.agents.set(id, agent);
    console.log(`✅ Agent ${id} registered`);
  }
  
  getAgent(id: string) {
    return this.agents.get(id);
  }
  
  getAllAgents() {
    return Array.from(this.agents.values());
  }
  
  processRequest(input: string): string {
    console.log(`🔄 Processing: ${input}`);
    return `Processed by ${this.agents.size} agents`;
  }
}

export const agentSystem = new AgentSystem();
