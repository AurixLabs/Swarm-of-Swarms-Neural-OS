
export interface SystemEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  priority: number;
  source?: string;
  target?: string;
}

export interface SwarmEvent extends SystemEvent {
  swarmId?: string;
  nodeId?: string;
  capabilities?: string[];
}

export interface KernelEvent extends SystemEvent {
  kernelId: string;
  kernelType: string;
}

export interface EthicsEvent extends SystemEvent {
  validationResult?: boolean;
  constraint?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface NeuromorphicEvent extends SystemEvent {
  spikesCount?: number;
  energyUsed?: number;
  networkState?: any;
}

// System event types
export const SYSTEM_EVENT_TYPES = {
  // Core system events
  SYSTEM_INITIALIZED: 'SYSTEM_INITIALIZED',
  SYSTEM_SHUTDOWN: 'SYSTEM_SHUTDOWN',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  
  // Kernel events
  KERNEL_LOADED: 'KERNEL_LOADED',
  KERNEL_UNLOADED: 'KERNEL_UNLOADED',
  KERNEL_ERROR: 'KERNEL_ERROR',
  
  // Swarm events
  SWARM_NODE_JOINED: 'SWARM_NODE_JOINED',
  SWARM_NODE_LEFT: 'SWARM_NODE_LEFT',
  SWARM_CONSENSUS_REACHED: 'SWARM_CONSENSUS_REACHED',
  SWARM_FUNCTION_EXECUTED: 'SWARM_FUNCTION_EXECUTED',
  SWARM_EXECUTION_ERROR: 'SWARM_EXECUTION_ERROR',
  SWARM_RECOVERY_INITIATED: 'SWARM_RECOVERY_INITIATED',
  
  // Ethics events
  ETHICS_VALIDATION_PASSED: 'ETHICS_VALIDATION_PASSED',
  ETHICS_VALIDATION_FAILED: 'ETHICS_VALIDATION_FAILED',
  ETHICS_CONSTRAINT_VIOLATED: 'ETHICS_CONSTRAINT_VIOLATED',
  ETHICS_FALLBACK_ACTIVATED: 'ETHICS_FALLBACK_ACTIVATED',
  ETHICS_RECOVERY_COMPLETED: 'ETHICS_RECOVERY_COMPLETED',
  ETHICS_KERNEL_INITIALIZED: 'ETHICS_KERNEL_INITIALIZED',
  
  // Neuromorphic events
  NEUROMORPHIC_SPIKE_PROCESSED: 'NEUROMORPHIC_SPIKE_PROCESSED',
  NEUROMORPHIC_LEARNING_UPDATED: 'NEUROMORPHIC_LEARNING_UPDATED',
  NEUROMORPHIC_NETWORK_RESET: 'NEUROMORPHIC_NETWORK_RESET'
} as const;

export type SystemEventType = typeof SYSTEM_EVENT_TYPES[keyof typeof SYSTEM_EVENT_TYPES];

export function createSystemEvent(
  type: SystemEventType,
  payload: any,
  priority: number = 5
): SystemEvent {
  return {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    payload,
    timestamp: Date.now(),
    priority
  };
}

export function createSwarmEvent(
  type: SystemEventType,
  payload: any,
  priority: number = 5,
  swarmId?: string,
  nodeId?: string
): SwarmEvent {
  return {
    ...createSystemEvent(type, payload, priority),
    swarmId,
    nodeId
  };
}

export function createKernelEvent(
  type: SystemEventType,
  payload: any,
  kernelId: string,
  kernelType: string,
  priority: number = 5
): KernelEvent {
  return {
    ...createSystemEvent(type, payload, priority),
    kernelId,
    kernelType
  };
}
