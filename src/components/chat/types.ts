
import { TinyLlamaAgent } from '../../core/agents/TinyLlamaAgent';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'error';
  timestamp: Date;
  agentType?: string;
  spikingActivity?: number[];
  reasoningSteps?: string[];
  confidence?: number;
  error?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  bridge: TinyLlamaAgent;
}
