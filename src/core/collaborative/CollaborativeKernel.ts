
import { UniversalKernel, KernelConfig } from '../kernels/UniversalKernel';

export interface CollaborativeSession {
  id: string;
  participants: string[];
  createdAt: number;
  lastActivity: number;
}

export interface CollaborativeState {
  activeSessions: CollaborativeSession[];
  connectedUsers: number;
  sharedWorkspaces: string[];
}

/**
 * Collaborative Kernel for managing multi-user interactions
 */
export class CollaborativeKernel extends UniversalKernel {
  private collaborativeState: CollaborativeState;
  private sessions: Map<string, CollaborativeSession> = new Map();

  constructor(config?: Partial<KernelConfig>) {
    super({
      id: 'collaborative',
      name: 'Collaborative Kernel',
      priority: 6,
      memoryLimit: 64,
      cpuLimit: 15,
      ...config
    });

    this.collaborativeState = {
      activeSessions: [],
      connectedUsers: 0,
      sharedWorkspaces: []
    };
  }

  protected async onInitialize(): Promise<void> {
    console.log('🤝 Collaborative Kernel initializing...');
    // Initialize collaborative services
    this.setupEventHandlers();
  }

  protected async onStop(): Promise<void> {
    console.log('🤝 Collaborative Kernel stopping...');
    // Clean up sessions
    this.sessions.clear();
  }

  private setupEventHandlers(): void {
    this.on('user:connected', this.handleUserConnected.bind(this));
    this.on('user:disconnected', this.handleUserDisconnected.bind(this));
    this.on('session:created', this.handleSessionCreated.bind(this));
  }

  private handleUserConnected(data: { userId: string }): void {
    this.collaborativeState.connectedUsers++;
    this.emit('collaborative:user_connected', data);
  }

  private handleUserDisconnected(data: { userId: string }): void {
    this.collaborativeState.connectedUsers = Math.max(0, this.collaborativeState.connectedUsers - 1);
    this.emit('collaborative:user_disconnected', data);
  }

  private handleSessionCreated(data: { session: CollaborativeSession }): void {
    this.sessions.set(data.session.id, data.session);
    this.collaborativeState.activeSessions = Array.from(this.sessions.values());
    this.emit('collaborative:session_created', data);
  }

  /**
   * Create a new collaborative session
   */
  createSession(participants: string[]): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: CollaborativeSession = {
      id: sessionId,
      participants,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    this.emit('session:created', { session });
    return sessionId;
  }

  /**
   * Join an existing session
   */
  joinSession(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session && !session.participants.includes(userId)) {
      session.participants.push(userId);
      session.lastActivity = Date.now();
      this.emit('collaborative:user_joined_session', { sessionId, userId });
      return true;
    }
    return false;
  }

  /**
   * Get collaborative state
   */
  getCollaborativeState(): CollaborativeState {
    return { ...this.collaborativeState };
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): CollaborativeSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): CollaborativeSession[] {
    return Array.from(this.sessions.values());
  }
}

// Export singleton instance
export const collaborativeKernel = new CollaborativeKernel();
export default collaborativeKernel;
