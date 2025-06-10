import React, { useState, useRef, useEffect } from 'react';
import { Bot, Brain, Cpu, Zap } from 'lucide-react';
import { TinyLlamaAgent } from '../../core/agents/TinyLlamaAgent';
import { Message, Agent } from './types';
import AgentSelector from './AgentSelector';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agentsInitialized, setAgentsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents: Agent[] = [
    {
      id: 'godmode-agent',
      name: '🔥 TinyLlama 2.0 GODMODE',
      description: 'Full intelligence chain with ethical oversight - RECOMMENDED',
      icon: <Zap className="w-4 h-4" />,
      bridge: new TinyLlamaAgent('godmode-agent', ['neuromorphic', 'reasoning_engine', 'hybrid_intelligence', 'llama_bridge'], true)
    },
    {
      id: 'tinyllama-chat',
      name: 'TinyLlama Lite (Resource Efficient)',
      description: 'Lightweight 1.1B parameter model for constrained environments',
      icon: <Bot className="w-4 h-4" />,
      bridge: new TinyLlamaAgent('chat-agent', ['llama_bridge'])
    },
    {
      id: 'embedded-intelligence',
      name: 'Neuromorphic Only (Specialists)',
      description: 'Pure spike patterns - for pattern recognition tasks',
      icon: <Brain className="w-4 h-4" />,
      bridge: new TinyLlamaAgent('intel-agent', ['neuromorphic'])
    },
    {
      id: 'reasoning-engine',
      name: 'Logic Engine (Specialists)',
      description: 'Pure reasoning - for mathematical/analytical tasks',
      icon: <Cpu className="w-4 h-4" />,
      bridge: new TinyLlamaAgent('reason-agent', ['reasoning_engine'])
    }
  ];

  useEffect(() => {
    initializeAgents();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeAgents = async () => {
    console.log('🚀 Initializing TinyLlama agents with WASM modules...');
    
    const initPromises = agents.map(async (agent) => {
      try {
        const initialized = await agent.bridge.initialize();
        console.log(`Agent ${agent.name}: ${initialized ? 'SUCCESS' : 'FAILED'}`);
        return { agent, initialized };
      } catch (error) {
        console.error(`Agent ${agent.name} initialization failed:`, error);
        return { agent, initialized: false };
      }
    });
    
    const results = await Promise.all(initPromises);
    const successCount = results.filter(r => r.initialized).length;
    
    console.log(`✅ Agent initialization complete: ${successCount}/${agents.length} agents ready`);
    setAgentsInitialized(true);
    
    // Auto-select GODMODE agent first, fallback to first available
    if (!selectedAgent) {
      const godmodeAgent = results.find(r => r.agent.id === 'godmode-agent' && r.initialized)?.agent;
      const firstWorkingAgent = results.find(r => r.initialized)?.agent;
      
      if (godmodeAgent) {
        setSelectedAgent(godmodeAgent);
        console.log('🔥 Auto-selected GODMODE agent as default');
      } else if (firstWorkingAgent) {
        setSelectedAgent(firstWorkingAgent);
        console.log(`⚡ Auto-selected ${firstWorkingAgent.name} as fallback`);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedAgent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await selectedAgent.bridge.processRequest(currentInput);
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.text,
        sender: 'agent',
        timestamp: new Date(),
        agentType: selectedAgent.name,
        spikingActivity: response.spikingActivity,
        reasoningSteps: response.reasoningSteps,
        confidence: response.confidence
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Agent processing failed:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Agent encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'error',
        timestamp: new Date(),
        agentType: selectedAgent.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentStatus = (agent: Agent) => {
    const status = agent.bridge.getStatus();
    const isWorking = agent.bridge.isModelLoaded();
    
    return {
      status,
      working: isWorking,
      color: isWorking ? 'text-green-600' : 'text-yellow-600'
    };
  };

  return (
    <div className="flex flex-col h-screen max-h-[80vh] bg-gray-50 rounded-lg border">
      {/* Header */}
      <div className="border-b bg-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          🧠 TinyLlama 2.0 Neural Agents - GODMODE Ready! (Resource-Adaptive)
        </h2>
        
        <AgentSelector
          agents={agents}
          selectedAgent={selectedAgent}
          agentsInitialized={agentsInitialized}
          onAgentSelect={setSelectedAgent}
          getAgentStatus={getAgentStatus}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        selectedAgent={selectedAgent}
        isLoading={isLoading}
        agentsInitialized={agentsInitialized}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default ChatInterface;
