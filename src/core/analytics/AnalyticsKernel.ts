import { BrowserEventEmitter, createSystemEvent } from '@/core/events';

export interface AnalyticsEvent {
  id: string;
  type: string;
  data: any;
  userId?: string;
  sessionId: string;
  timestamp: number;
}

export class AnalyticsKernel extends BrowserEventEmitter {
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, { id: string; startTime: number; events: number }> = new Map();
  private isTracking = true;

  constructor() {
    super();
    this.initializeTracking();
  }

  startSession(userId?: string): string {
    const sessionId = `session-${Date.now()}`;
    this.sessions.set(sessionId, {
      id: sessionId,
      startTime: Date.now(),
      events: 0
    });

    this.emit('analytics_session_started', { sessionId, userId });
    return sessionId;
  }

  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.emit('analytics_session_ended', { sessionId, duration: Date.now() - session.startTime });
    }
  }

  recordEvent(type: string, data: any, userId?: string, sessionId?: string): void {
    if (!this.isTracking) return;

    const currentSessionId = sessionId || this.startSession(userId);

    const event: AnalyticsEvent = {
      id: `event-${Date.now()}`,
      type,
      data,
      userId,
      sessionId: currentSessionId,
      timestamp: Date.now()
    };

    this.events.push(event);
    const session = this.sessions.get(currentSessionId);
    if (session) {
      session.events++;
    }

    this.emit('analytics_event_recorded', event);
  }

  pauseTracking(): void {
    this.isTracking = false;
    this.emit('analytics_tracking_paused');
  }

  resumeTracking(): void {
    this.isTracking = true;
    this.emit('analytics_tracking_resumed');
  }

  getEventCount(): number {
    return this.events.length;
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  getEventsByType(type: string): AnalyticsEvent[] {
    return this.events.filter(event => event.type === type);
  }

  private initializeTracking(): void {
    console.log('📊 Analytics Kernel initializing...');
    this.emit('analytics_initialized');
  }
}
