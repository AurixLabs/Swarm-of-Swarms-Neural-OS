
import { UniversalKernel } from './UniversalKernel';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { BrowserEventEmitter } from './BrowserEventEmitter';
import { systemKernel } from './SystemKernel';
import { aiKernel } from './AIKernel';
import { v4 as uuidv4 } from 'uuid';

// Collaborative event types
export type CollaborativeEventType = 
  | 'COLLABORATION_STARTED'
  | 'COLLABORATION_ENDED'
  | 'AGENT_JOINED'
  | 'AGENT_LEFT'
  | 'MESSAGE_SENT'
  | 'MESSAGE_RECEIVED'
  | 'SHARED_CONTEXT_UPDATED'
  | 'CONSENSUS_REACHED'
  | 'CONFLICT_DETECTED'
  | 'SYNCHRONIZATION_COMPLETED'
  | 'COLLECTIVE_INTELLIGENCE_MEASURED'
  | 'DISTRIBUTED_TASK_ASSIGNED'
  | 'DISTRIBUTED_TASK_COMPLETED'
  | 'COLLABORATION_INSIGHT_GENERATED';

// Collaborative event interface
export interface CollaborativeEvent {
  type: CollaborativeEventType;
  payload: any;
}

// Collaborative agent interface
export interface CollaborativeAgent {
  id: string;
  name: string;
  capabilities: string[];
  specialization: string[];
  trustScore: number;
  online: boolean;
  lastActive: number;
}

// Collaborative session interface
export interface CollaborativeSession {
  id: string;
  name: string;
  agents: CollaborativeAgent[];
  startTime: number;
  endTime?: number;
  sharedContext: Record<string, any>;
  messages: CollaborativeMessage[];
  active: boolean;
}

// Message interface for collaborative sessions
export interface CollaborativeMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  content: any;
  timestamp: number;
  type: 'text' | 'data' | 'command' | 'system' | 'insight';
  metadata?: Record<string, any>;
}

// Collaboration insight interface
export interface CollaborationInsight {
  id: string;
  sessionId: string;
  content: string;
  confidence: number;
  contributingAgents: string[];
  timestamp: number;
  tags: string[];
}

// Collaborative Event Bus
class CollaborativeEventBus extends BrowserEventEmitter {
  emitEvent<T extends CollaborativeEvent>(event: T) {
    this.emit(event.type, event.payload);
    return event;
  }
  
  onEvent<T extends CollaborativeEvent>(eventType: T['type'], handler: (payload: any) => void) {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }
}

// Collaborative Kernel implementation
export class CollaborativeKernel extends UniversalKernel {
  public readonly events = new CollaborativeEventBus();
  private activeSessions = new Map<string, CollaborativeSession>();
  private registeredAgents = new Map<string, CollaborativeAgent>();
  private _state: Record<string, any> = {};
  
  constructor() {
    super();
    this.registerSystemAgent();
    this.registerAIAgent();
  }
  
  /**
   * Register the system as a collaborative agent
   */
  private registerSystemAgent(): void {
    this.registerAgent({
      id: 'system',
      name: 'System',
      capabilities: ['coordination', 'synchronization', 'monitoring'],
      specialization: ['system-level-operations', 'security'],
      trustScore: 1.0,
      online: true,
      lastActive: Date.now()
    });
  }
  
  /**
   * Register the AI kernel as a collaborative agent
   */
  private registerAIAgent(): void {
    this.registerAgent({
      id: 'ai',
      name: 'AI Assistant',
      capabilities: ['reasoning', 'knowledge', 'natural-language'],
      specialization: ['cognitive-tasks', 'information-retrieval'],
      trustScore: 0.9,
      online: true,
      lastActive: Date.now()
    });
  }
  
  /**
   * Register a collaborative agent
   */
  public registerAgent(agent: CollaborativeAgent): string {
    this.registeredAgents.set(agent.id, agent);
    
    this.events.emitEvent({
      type: 'AGENT_JOINED',
      payload: {
        agentId: agent.id,
        name: agent.name,
        capabilities: agent.capabilities,
        timestamp: Date.now()
      }
    });
    
    return agent.id;
  }
  
  /**
   * Update agent status
   */
  public updateAgentStatus(agentId: string, online: boolean): void {
    const agent = this.registeredAgents.get(agentId);
    if (!agent) return;
    
    agent.online = online;
    agent.lastActive = Date.now();
    this.registeredAgents.set(agentId, agent);
    
    // Update agent in all active sessions
    this.activeSessions.forEach(session => {
      const agentIndex = session.agents.findIndex(a => a.id === agentId);
      if (agentIndex >= 0) {
        session.agents[agentIndex] = agent;
        this.activeSessions.set(session.id, session);
      }
    });
    
    this.events.emitEvent({
      type: online ? 'AGENT_JOINED' : 'AGENT_LEFT',
      payload: {
        agentId,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Create a new collaborative session
   */
  public createSession(name: string, agentIds: string[] = []): CollaborativeSession {
    const sessionId = `session-${uuidv4()}`;
    
    // Gather agents
    const agents: CollaborativeAgent[] = [];
    agentIds.forEach(id => {
      const agent = this.registeredAgents.get(id);
      if (agent) {
        agents.push(agent);
      }
    });
    
    // Always include system agent
    if (!agents.some(a => a.id === 'system')) {
      const systemAgent = this.registeredAgents.get('system');
      if (systemAgent) {
        agents.push(systemAgent);
      }
    }
    
    const session: CollaborativeSession = {
      id: sessionId,
      name,
      agents,
      startTime: Date.now(),
      sharedContext: {},
      messages: [],
      active: true
    };
    
    this.activeSessions.set(sessionId, session);
    
    this.events.emitEvent({
      type: 'COLLABORATION_STARTED',
      payload: {
        sessionId,
        name,
        agents: agents.map(a => ({ id: a.id, name: a.name })),
        timestamp: session.startTime
      }
    });
    
    return session;
  }
  
  /**
   * End a collaborative session
   */
  public endSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    session.active = false;
    session.endTime = Date.now();
    this.activeSessions.set(sessionId, session);
    
    this.events.emitEvent({
      type: 'COLLABORATION_ENDED',
      payload: {
        sessionId,
        duration: session.endTime - session.startTime,
        agentCount: session.agents.length,
        messageCount: session.messages.length,
        timestamp: session.endTime
      }
    });
  }
  
  /**
   * Get a session by ID
   */
  public getSession(sessionId: string): CollaborativeSession | undefined {
    return this.activeSessions.get(sessionId);
  }
  
  /**
   * Add an agent to a session
   */
  public addAgentToSession(sessionId: string, agentId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    const agent = this.registeredAgents.get(agentId);
    
    if (!session || !agent) return false;
    
    // Check if agent is already in session
    if (session.agents.some(a => a.id === agentId)) {
      return true;
    }
    
    session.agents.push(agent);
    this.activeSessions.set(sessionId, session);
    
    // Add system message about agent joining
    this.sendMessage(sessionId, 'system', {
      type: 'system',
      content: `${agent.name} has joined the session.`
    });
    
    return true;
  }
  
  /**
   * Remove an agent from a session
   */
  public removeAgentFromSession(sessionId: string, agentId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    
    const agentIndex = session.agents.findIndex(a => a.id === agentId);
    if (agentIndex < 0) return false;
    
    const agent = session.agents[agentIndex];
    session.agents.splice(agentIndex, 1);
    this.activeSessions.set(sessionId, session);
    
    // Add system message about agent leaving
    this.sendMessage(sessionId, 'system', {
      type: 'system',
      content: `${agent.name} has left the session.`
    });
    
    return true;
  }
  
  /**
   * Send a message to a collaborative session
   */
  public sendMessage(
    sessionId: string,
    senderId: string,
    message: {
      type: 'text' | 'data' | 'command' | 'system' | 'insight',
      content: any,
      metadata?: Record<string, any>
    }
  ): CollaborativeMessage | null {
    const session = this.activeSessions.get(sessionId);
    const sender = this.registeredAgents.get(senderId);
    
    if (!session || !sender) {
      return null;
    }
    
    const newMessage: CollaborativeMessage = {
      id: uuidv4(),
      sessionId,
      senderId,
      senderName: sender.name,
      content: message.content,
      timestamp: Date.now(),
      type: message.type,
      metadata: message.metadata
    };
    
    session.messages.push(newMessage);
    this.activeSessions.set(sessionId, session);
    
    this.events.emitEvent({
      type: 'MESSAGE_SENT',
      payload: {
        sessionId,
        messageId: newMessage.id,
        senderId,
        senderName: sender.name,
        timestamp: newMessage.timestamp
      }
    });
    
    // Update AI context if this is a text message
    if (message.type === 'text' || message.type === 'insight') {
      aiKernel.events.emitEvent({
        type: 'CONTEXT_UPDATED',
        payload: {
          source: 'collaborative_session',
          content: message.content,
          sessionId
        }
      });
    }
    
    return newMessage;
  }
  
  /**
   * Get messages from a session
   */
  public getMessages(sessionId: string, limit: number = 50): CollaborativeMessage[] {
    const session = this.activeSessions.get(sessionId);
    if (!session) return [];
    
    return session.messages
      .slice(-limit)
      .sort((a, b) => a.timestamp - b.timestamp);
  }
  
  /**
   * Update the shared context for a session
   */
  public updateSharedContext(
    sessionId: string,
    updates: Record<string, any>,
    updaterId: string
  ): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    
    // Update the shared context
    session.sharedContext = {
      ...session.sharedContext,
      ...updates,
      _lastUpdated: Date.now(),
      _lastUpdatedBy: updaterId
    };
    
    this.activeSessions.set(sessionId, session);
    
    this.events.emitEvent({
      type: 'SHARED_CONTEXT_UPDATED',
      payload: {
        sessionId,
        updaterId,
        updates: Object.keys(updates),
        timestamp: Date.now()
      }
    });
    
    return true;
  }
  
  /**
   * Generate a collaboration insight
   */
  public generateInsight(
    sessionId: string,
    content: string,
    contributingAgents: string[],
    confidence: number = 0.8,
    tags: string[] = []
  ): CollaborationInsight {
    const insight: CollaborationInsight = {
      id: uuidv4(),
      sessionId,
      content,
      confidence,
      contributingAgents,
      timestamp: Date.now(),
      tags
    };
    
    // Add to session as a special message
    this.sendMessage(sessionId, 'system', {
      type: 'insight',
      content,
      metadata: {
        contributingAgents,
        confidence,
        tags
      }
    });
    
    this.events.emitEvent({
      type: 'COLLABORATION_INSIGHT_GENERATED',
      payload: {
        insightId: insight.id,
        sessionId,
        content,
        confidence,
        contributingAgents,
        timestamp: insight.timestamp
      }
    });
    
    // Share with system kernel
    systemKernel.events.emitEvent({
      type: 'DATA_UPDATED',
      payload: {
        source: 'collaborative_kernel',
        type: 'insight',
        content: insight
      }
    });
    
    return insight;
  }
  
  /**
   * Measure collective intelligence of a session
   */
  public measureCollectiveIntelligence(sessionId: string): number {
    const session = this.activeSessions.get(sessionId);
    if (!session) return 0;
    
    // In a real implementation, this would use sophisticated methods
    // For demo, use a basic formula based on agents and messages
    const agentDiversity = Math.min(1, session.agents.length / 5); // Max out at 5 agents
    const messageCount = Math.min(1, session.messages.length / 50); // Max out at 50 messages
    const agentSpecializationFactor = session.agents.reduce((acc, agent) => 
      acc + Math.min(1, agent.specialization.length / 3), 0) / Math.max(1, session.agents.length);
    
    const collectiveIQ = (agentDiversity * 0.4 + messageCount * 0.3 + agentSpecializationFactor * 0.3) * 100;
    
    this.events.emitEvent({
      type: 'COLLECTIVE_INTELLIGENCE_MEASURED',
      payload: {
        sessionId,
        score: collectiveIQ,
        factors: {
          agentDiversity,
          messageCount,
          agentSpecializationFactor
        },
        timestamp: Date.now()
      }
    });
    
    return collectiveIQ;
  }
  
  /**
   * Get all registered agents
   */
  public getRegisteredAgents(): CollaborativeAgent[] {
    return Array.from(this.registeredAgents.values());
  }
  
  /**
   * Get all active sessions
   */
  public getActiveSessions(): CollaborativeSession[] {
    return Array.from(this.activeSessions.values()).filter(s => s.active);
  }
  
  /**
   * Clean up resources
   */
  public shutdown(): void {
    // End all active sessions
    this.getActiveSessions().forEach(session => {
      this.endSession(session.id);
    });
    
    this.events.removeAllListeners();
  }
}

// Create singleton instance
export const collaborativeKernel = new CollaborativeKernel();

// React context
const CollaborativeContext = createContext<CollaborativeKernel | null>(null);

// Provider component
export const CollaborativeProvider = ({ children }: { children: ReactNode }) => (
  <CollaborativeContext.Provider value={collaborativeKernel}>
    {children}
  </CollaborativeContext.Provider>
);

// React hook for accessing the kernel
export const useCollaborative = () => {
  const context = useContext(CollaborativeContext);
  if (!context) {
    throw new Error('useCollaborative must be used within a CollaborativeProvider');
  }
  return context;
};

// Hook for collaborative operations
export const useCollaborativeOperations = () => {
  const collaborativeKernel = useCollaborative();
  const [sessions, setSessions] = useState<CollaborativeSession[]>([]);
  const [agents, setAgents] = useState<CollaborativeAgent[]>([]);

  useEffect(() => {
    // Update sessions when they change
    const updateSessions = () => {
      setSessions(collaborativeKernel.getActiveSessions());
    };
    
    // Update agents when they change
    const updateAgents = () => {
      setAgents(collaborativeKernel.getRegisteredAgents());
    };
    
    // Subscribe to relevant events
    const unsubscribeStart = collaborativeKernel.events.onEvent(
      'COLLABORATION_STARTED', 
      updateSessions
    );
    
    const unsubscribeEnd = collaborativeKernel.events.onEvent(
      'COLLABORATION_ENDED', 
      updateSessions
    );
    
    const unsubscribeJoin = collaborativeKernel.events.onEvent(
      'AGENT_JOINED', 
      updateAgents
    );
    
    const unsubscribeLeave = collaborativeKernel.events.onEvent(
      'AGENT_LEFT', 
      updateAgents
    );
    
    // Initial updates
    updateSessions();
    updateAgents();
    
    return () => {
      unsubscribeStart();
      unsubscribeEnd();
      unsubscribeJoin();
      unsubscribeLeave();
    };
  }, [collaborativeKernel]);

  return {
    sessions,
    agents,
    createSession: collaborativeKernel.createSession.bind(collaborativeKernel),
    endSession: collaborativeKernel.endSession.bind(collaborativeKernel),
    sendMessage: collaborativeKernel.sendMessage.bind(collaborativeKernel),
    getMessages: collaborativeKernel.getMessages.bind(collaborativeKernel),
    addAgentToSession: collaborativeKernel.addAgentToSession.bind(collaborativeKernel),
    removeAgentFromSession: collaborativeKernel.removeAgentFromSession.bind(collaborativeKernel),
    updateSharedContext: collaborativeKernel.updateSharedContext.bind(collaborativeKernel),
    generateInsight: collaborativeKernel.generateInsight.bind(collaborativeKernel),
    measureCollectiveIntelligence: collaborativeKernel.measureCollectiveIntelligence.bind(collaborativeKernel)
  };
};
