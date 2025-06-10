
import React from 'react';
import { Agent } from './types';

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  agentsInitialized: boolean;
  onAgentSelect: (agent: Agent) => void;
  getAgentStatus: (agent: Agent) => { status: string; working: boolean; color: string };
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
  agents,
  selectedAgent,
  agentsInitialized,
  onAgentSelect,
  getAgentStatus
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {agents.map((agent) => {
        const agentStatus = getAgentStatus(agent);
        return (
          <button
            key={agent.id}
            onClick={() => onAgentSelect(agent)}
            disabled={!agentsInitialized}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedAgent?.id === agent.id
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${!agentsInitialized ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {agent.icon}
              <span className="font-medium text-sm">{agent.name}</span>
              <div className={`w-2 h-2 rounded-full ${agentStatus.working ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <p className="text-xs text-gray-600">{agent.description}</p>
            <p className={`text-xs ${agentStatus.color}`}>{agentStatus.status}</p>
          </button>
        );
      })}
    </div>
  );
};

export default AgentSelector;
