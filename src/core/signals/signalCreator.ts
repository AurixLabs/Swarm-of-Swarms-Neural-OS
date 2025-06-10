
/**
 * Signal Creator - Creates typed system signals for kernel communication
 */

export interface SystemSignal {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  source: string;
}

/**
 * Creates a system signal with proper structure and metadata
 */
export function createSystemSignal(type: string, payload: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): SystemSignal {
  return {
    id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    payload,
    timestamp: Date.now(),
    priority,
    source: 'system'
  };
}

/**
 * Creates a memory-specific signal with enhanced metadata
 */
export function createMemorySignal(type: string, payload: any): SystemSignal {
  return createSystemSignal(type, payload, 'normal');
}

/**
 * Creates a security-specific signal with high priority
 */
export function createSecuritySignal(type: string, payload: any): SystemSignal {
  return createSystemSignal(type, payload, 'high');
}

/**
 * Creates a critical system signal for urgent notifications
 */
export function createCriticalSignal(type: string, payload: any): SystemSignal {
  return createSystemSignal(type, payload, 'critical');
}
