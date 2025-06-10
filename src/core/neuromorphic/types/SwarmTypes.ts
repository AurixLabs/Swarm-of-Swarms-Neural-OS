
/**
 * Type definitions for the fractal agent swarm
 */

export interface MicroAgent {
  id: string;
  depth: number;
  parent: string | null;
  taskQueue: Uint8Array[];
  isProcessing: boolean;
  memoryUsage: number;
}

export interface SwarmTask {
  id: string;
  data: Uint8Array;
  priority: number;
  assignedAgents: string[];
  completed: boolean;
  result?: Uint8Array;
}

export interface SwarmStats {
  agentCount: number;
  taskCount: number;
  completedTasks: number;
  memoryUsage: number;
  memoryLimit: number;
  depthDistribution: Record<number, number>;
}

export interface SwarmEvent {
  type: string;
  agentId?: string;
  parentId?: string;
  taskId?: string;
  depth?: number;
  dataSize?: number;
  reason?: string;
  memoryFreed?: number;
  timestamp: number;
}
