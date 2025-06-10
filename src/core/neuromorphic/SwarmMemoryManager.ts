
/**
 * SwarmMemoryManager - Handles memory management for the fractal agent swarm
 */
import { MicroAgent } from './types/SwarmTypes';
import { BrowserEventEmitter } from '../BrowserEventEmitter';

export class SwarmMemoryManager {
  private agents: Map<string, MicroAgent>;
  private memoryLimit: number;
  private currentMemoryUsage: number = 0;
  private events: BrowserEventEmitter;
  
  constructor(
    agents: Map<string, MicroAgent>, 
    memoryLimit: number = 10 * 1024, 
    events: BrowserEventEmitter
  ) {
    this.agents = agents;
    this.memoryLimit = memoryLimit;
    this.events = events;
  }
  
  /**
   * Track memory allocation
   */
  public allocateMemory(amount: number): boolean {
    if (this.currentMemoryUsage + amount > this.memoryLimit) {
      this.collectGarbage();
      if (this.currentMemoryUsage + amount > this.memoryLimit) {
        return false;
      }
    }
    
    this.currentMemoryUsage += amount;
    return true;
  }
  
  /**
   * Track memory deallocation
   */
  public deallocateMemory(amount: number): void {
    this.currentMemoryUsage -= amount;
    if (this.currentMemoryUsage < 0) {
      this.currentMemoryUsage = 0;
    }
  }
  
  /**
   * Garbage collection to free up memory
   */
  public collectGarbage(): void {
    // Find idle agents with no tasks
    const idleAgents = Array.from(this.agents.values())
      .filter(agent => agent.taskQueue.length === 0 && !agent.isProcessing)
      // Start with deepest agents first
      .sort((a, b) => b.depth - a.depth);
    
    // Remove up to 25% of idle agents
    const removeCount = Math.ceil(idleAgents.length * 0.25);
    
    for (let i = 0; i < removeCount; i++) {
      if (i < idleAgents.length) {
        const agent = idleAgents[i];
        this.agents.delete(agent.id);
        this.deallocateMemory(agent.memoryUsage);
        
        this.events.emit('AGENT_REMOVED', {
          agentId: agent.id,
          reason: 'garbage_collection',
          memoryFreed: agent.memoryUsage,
          timestamp: Date.now()
        });
      }
    }
  }
  
  /**
   * Get current memory usage
   */
  public getCurrentMemoryUsage(): number {
    return this.currentMemoryUsage;
  }
  
  /**
   * Get memory limit
   */
  public getMemoryLimit(): number {
    return this.memoryLimit;
  }
}
