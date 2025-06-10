
import { SystemEventBus, SystemEvent } from './SystemEventBus';
import { systemKernel } from '@/core/SystemKernel';
import * as crypto from 'crypto-js';

/**
 * Event middleware for processing events
 */
export interface EventMiddleware {
  id: string;
  priority: number; // Lower number = higher priority
  process(event: SystemEvent, next: (event: SystemEvent) => void): void;
}

/**
 * Event subscription with filters
 */
export interface EventSubscription {
  id: string;
  eventTypes: string[];
  filter?: (event: SystemEvent) => boolean;
  handler: (event: SystemEvent) => void;
}

/**
 * Event Manager
 * 
 * Advanced event handling with middleware support, filtering, and
 * priority-based event processing. Provides a robust event system
 * for complex applications.
 */
export class EventManager {
  private static instance: EventManager;
  private readonly eventBus: SystemEventBus;
  private readonly middlewares: EventMiddleware[] = [];
  private readonly subscriptions = new Map<string, EventSubscription>();
  private readonly listeners = new Map<string, Set<string>>();
  
  private constructor() {
    this.eventBus = systemKernel.events;
    
    // Set up eventBus listener for all events
    this.eventBus.on('*', (event) => {
      this.processEvent(event);
    });
  }
  
  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }
  
  /**
   * Register middleware for event processing
   */
  public registerMiddleware(middleware: EventMiddleware): void {
    // Check if middleware already exists
    const existingIndex = this.middlewares.findIndex(m => m.id === middleware.id);
    if (existingIndex !== -1) {
      this.middlewares[existingIndex] = middleware;
    } else {
      this.middlewares.push(middleware);
    }
    
    // Sort middlewares by priority
    this.middlewares.sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Remove middleware by ID
   */
  public removeMiddleware(id: string): boolean {
    const index = this.middlewares.findIndex(m => m.id === id);
    if (index !== -1) {
      this.middlewares.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * Subscribe to events with optional filtering
   */
  public subscribe(subscription: Omit<EventSubscription, 'id'>): string {
    const id = crypto.lib.WordArray.random(16).toString();
    const fullSubscription: EventSubscription = {
      ...subscription,
      id
    };
    
    this.subscriptions.set(id, fullSubscription);
    
    // Track event type to subscription mapping for faster lookup
    for (const eventType of subscription.eventTypes) {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, new Set());
      }
      this.listeners.get(eventType)?.add(id);
    }
    
    return id;
  }
  
  /**
   * Unsubscribe from events by subscription ID
   */
  public unsubscribe(id: string): boolean {
    const subscription = this.subscriptions.get(id);
    if (!subscription) {
      return false;
    }
    
    // Remove from event type mapping
    for (const eventType of subscription.eventTypes) {
      this.listeners.get(eventType)?.delete(id);
    }
    
    // Remove subscription
    this.subscriptions.delete(id);
    return true;
  }
  
  /**
   * Emit an event through the event bus
   */
  public emit(eventType: string, payload: any): void {
    this.eventBus.emit(eventType, payload);
  }
  
  /**
   * Process an event through middleware chain
   */
  private processEvent(event: SystemEvent): void {
    // Create middleware chain
    let index = 0;
    
    const next = (processedEvent: SystemEvent) => {
      // If we're at the end of the middleware chain, notify subscribers
      if (index === this.middlewares.length) {
        this.notifySubscribers(processedEvent);
        return;
      }
      
      // Get current middleware
      const middleware = this.middlewares[index++];
      middleware.process(processedEvent, next);
    };
    
    // Start processing
    if (this.middlewares.length > 0) {
      next(event);
    } else {
      // No middleware, directly notify subscribers
      this.notifySubscribers(event);
    }
  }
  
  /**
   * Notify subscribers of an event
   */
  private notifySubscribers(event: SystemEvent): void {
    // Find subscribers for this event type
    const subscriberIds = this.listeners.get(event.type) || new Set();
    
    // Notify each subscriber
    for (const id of subscriberIds) {
      const subscription = this.subscriptions.get(id);
      if (!subscription) continue;
      
      // Apply filter if present
      if (subscription.filter && !subscription.filter(event)) {
        continue;
      }
      
      try {
        subscription.handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }
  }
  
  /**
   * Create a type-safe event emitter
   */
  public createTypedEmitter<T extends Record<string, any>>() {
    return {
      emit: <K extends keyof T>(type: K, payload: T[K]) => {
        this.emit(type as string, payload);
      }
    };
  }
  
  /**
   * List all registered event types with subscriber counts
   */
  public getEventStats(): { eventType: string; subscriberCount: number }[] {
    return Array.from(this.listeners.entries()).map(([eventType, subscribers]) => ({
      eventType,
      subscriberCount: subscribers.size
    }));
  }
}

// Export singleton instance
export const eventManager = EventManager.getInstance();

// Common middleware implementations

/**
 * Logging middleware
 */
export const createLoggingMiddleware = (options: { 
  level: 'debug' | 'info' | 'warn' | 'error';
  includePayload?: boolean;
}): EventMiddleware => {
  return {
    id: 'logging-middleware',
    priority: 100, // Low priority, runs early
    process(event, next) {
      const { level, includePayload } = options;
      
      const logMethod = console[level] || console.log;
      
      if (includePayload) {
        logMethod(`[Event: ${event.type}]`, event.payload);
      } else {
        logMethod(`[Event: ${event.type}]`);
      }
      
      next(event);
    }
  };
};

/**
 * Validation middleware
 */
export const createValidationMiddleware = (
  schemas: Record<string, (payload: any) => boolean>
): EventMiddleware => {
  return {
    id: 'validation-middleware',
    priority: 10, // High priority, runs very early
    process(event, next) {
      const schema = schemas[event.type];
      
      // If no schema for this event type, pass through
      if (!schema) {
        next(event);
        return;
      }
      
      // Validate payload against schema
      const isValid = schema(event.payload);
      
      if (isValid) {
        next(event);
      } else {
        console.error(`Event validation failed for ${event.type}`, event.payload);
        // Optionally emit validation error event
        systemKernel.events.emit('VALIDATION_ERROR', {
          type: event.type,
          payload: event.payload,
          timestamp: Date.now()
        });
      }
    }
  };
};

/**
 * Throttling middleware
 */
export const createThrottlingMiddleware = (
  options: { interval: number; eventTypes?: string[] }
): EventMiddleware => {
  const lastEmitted = new Map<string, number>();
  
  return {
    id: 'throttling-middleware',
    priority: 20, // High priority, runs early
    process(event, next) {
      // If not in the list of throttled events, pass through
      if (options.eventTypes && !options.eventTypes.includes(event.type)) {
        next(event);
        return;
      }
      
      const now = Date.now();
      const last = lastEmitted.get(event.type) || 0;
      
      // Check if we should throttle
      if (now - last < options.interval) {
        return; // Throttled, don't pass to next
      }
      
      // Update last emitted time
      lastEmitted.set(event.type, now);
      next(event);
    }
  };
};
