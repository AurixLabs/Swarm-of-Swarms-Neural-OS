
/**
 * Utility functions for creating system events
 */

export function createSystemEvent(type: string, payload: any) {
  return {
    type,
    payload: {
      ...payload,
      timestamp: Date.now()
    }
  };
}

/**
 * Ensures that an event has a timestamp
 * If no timestamp exists, adds the current timestamp
 */
export function ensureEventTimestamp(event: Partial<{ type: string, payload: any, timestamp?: number }>) {
  return {
    ...event,
    timestamp: event.timestamp || Date.now()
  };
}

/**
 * Creates metadata for memory events
 */
export function createMemoryMetadata(source: string, confidence: number = 85) {
  return {
    source,
    confidence,
    timestamp: Date.now(),
    encoding: { format: 'json', version: '1.0' }
  };
}
