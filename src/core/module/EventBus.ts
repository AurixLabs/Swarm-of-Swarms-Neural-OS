import { EventEmitter } from 'events';

export type EventPriority = 'critical' | 'high' | 'medium' | 'low';

export interface BusEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  sourceModule: string;
  targetModule?: string;
  priority: EventPriority;
  ttl?: number; // Time to live in milliseconds
}

export interface EventSubscription {
  id: string;
  moduleId: string;
  eventType: string;
  handler: (event: BusEvent) => void | Promise<void>;
  priority: EventPriority;
}

export class EventBus extends EventEmitter {
  private subscriptions = new Map<string, EventSubscription[]>();
  private eventHistory: BusEvent[] = [];
  private eventMetrics = {
    totalEvents: 0,
    eventsPerSecond: 0,
    lastSecondCount: 0,
    lastSecondTimestamp: Date.now()
  };

  constructor() {
    super();
    this.setMaxListeners(1000); // Allow many module subscriptions
    this.startMetricsCollection();
  }

  subscribe(moduleId: string, eventType: string, handler: (event: BusEvent) => void | Promise<void>, priority: EventPriority = 'medium'): string {
    const subscriptionId = `${moduleId}-${eventType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      moduleId,
      eventType,
      handler,
      priority
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subs = this.subscriptions.get(eventType)!;
    subs.push(subscription);
    
    // Sort by priority (critical first)
    subs.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    console.log(`📡 Module ${moduleId} subscribed to ${eventType} with priority ${priority}`);
    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    for (const [eventType, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        const subscription = subs[index];
        subs.splice(index, 1);
        console.log(`📡 Module ${subscription.moduleId} unsubscribed from ${eventType}`);
        
        if (subs.length === 0) {
          this.subscriptions.delete(eventType);
        }
        return;
      }
    }
  }

  async publish(event: Omit<BusEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: BusEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    // Check TTL
    if (fullEvent.ttl && (Date.now() - fullEvent.timestamp) > fullEvent.ttl) {
      console.warn(`⚠️ Event ${fullEvent.id} expired before processing`);
      return;
    }

    this.recordEvent(fullEvent);
    
    const subscriptions = this.subscriptions.get(fullEvent.type) || [];
    
    if (subscriptions.length === 0) {
      console.log(`📡 No subscribers for event type: ${fullEvent.type}`);
      return;
    }

    // Filter by target module if specified
    const targetSubs = fullEvent.targetModule 
      ? subscriptions.filter(sub => sub.moduleId === fullEvent.targetModule)
      : subscriptions;

    console.log(`📡 Publishing ${fullEvent.type} to ${targetSubs.length} subscribers`);

    // Process subscriptions by priority
    const criticalSubs = targetSubs.filter(sub => sub.priority === 'critical');
    const highSubs = targetSubs.filter(sub => sub.priority === 'high');
    const mediumSubs = targetSubs.filter(sub => sub.priority === 'medium');
    const lowSubs = targetSubs.filter(sub => sub.priority === 'low');

    // Execute critical and high priority synchronously
    for (const sub of [...criticalSubs, ...highSubs]) {
      try {
        await sub.handler(fullEvent);
      } catch (error) {
        console.error(`❌ Error in ${sub.moduleId} handling ${fullEvent.type}:`, error);
        this.emit('handler:error', { subscription: sub, event: fullEvent, error });
      }
    }

    // Execute medium and low priority asynchronously
    [...mediumSubs, ...lowSubs].forEach(sub => {
      Promise.resolve().then(async () => {
        try {
          await sub.handler(fullEvent);
        } catch (error) {
          console.error(`❌ Error in ${sub.moduleId} handling ${fullEvent.type}:`, error);
          this.emit('handler:error', { subscription: sub, event: fullEvent, error });
        }
      });
    });

    this.emit('event:published', fullEvent);
  }

  private recordEvent(event: BusEvent): void {
    this.eventHistory.push(event);
    this.eventMetrics.totalEvents++;
    
    // Keep only last 10000 events for memory efficiency
    if (this.eventHistory.length > 10000) {
      this.eventHistory = this.eventHistory.slice(-10000);
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      const now = Date.now();
      const timeDiff = now - this.eventMetrics.lastSecondTimestamp;
      
      if (timeDiff >= 1000) {
        this.eventMetrics.eventsPerSecond = this.eventMetrics.lastSecondCount;
        this.eventMetrics.lastSecondCount = 0;
        this.eventMetrics.lastSecondTimestamp = now;
      }
    }, 1000);
  }

  getMetrics() {
    return { ...this.eventMetrics };
  }

  getEventHistory(timeRange?: { start: number; end: number }): BusEvent[] {
    if (!timeRange) return [...this.eventHistory];
    
    return this.eventHistory.filter(event => 
      event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );
  }

  getSubscriptions(): Map<string, EventSubscription[]> {
    return new Map(this.subscriptions);
  }
}

// Global singleton event bus
export const globalEventBus = new EventBus();
