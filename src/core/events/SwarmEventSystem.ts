
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { SystemEvent } from '../types/eventTypes';

export interface SwarmEvent extends SystemEvent {
  nodeId: string;
  swarmId: string;
  priority: number;
}

export class SwarmEventSystem extends BrowserEventEmitter {
  private swarmNodes: Map<string, Set<string>> = new Map();
  private eventHistory: SwarmEvent[] = [];
  private maxHistorySize = 1000;

  constructor() {
    super();
  }

  public registerNode(swarmId: string, nodeId: string): void {
    if (!this.swarmNodes.has(swarmId)) {
      this.swarmNodes.set(swarmId, new Set());
    }
    this.swarmNodes.get(swarmId)!.add(nodeId);
  }

  public broadcastToSwarm(swarmId: string, event: Omit<SwarmEvent, 'swarmId'>): void {
    const swarmEvent: SwarmEvent = {
      ...event,
      swarmId
    };

    this.addToHistory(swarmEvent);
    this.emit('swarm_event', swarmEvent);
    
    const nodes = this.swarmNodes.get(swarmId);
    if (nodes) {
      nodes.forEach(nodeId => {
        this.emit(`node_${nodeId}`, swarmEvent);
      });
    }
  }

  private addToHistory(event: SwarmEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  public getSwarmHistory(swarmId: string): SwarmEvent[] {
    return this.eventHistory.filter(event => event.swarmId === swarmId);
  }

  public removeNode(swarmId: string, nodeId: string): void {
    const nodes = this.swarmNodes.get(swarmId);
    if (nodes) {
      nodes.delete(nodeId);
      if (nodes.size === 0) {
        this.swarmNodes.delete(swarmId);
      }
    }
  }
}

export const swarmEventSystem = new SwarmEventSystem();
