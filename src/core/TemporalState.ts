
// Temporal State - The core glue that binds all modules (Requirement 5)
export class TemporalState {
  private static instance: TemporalState;
  private state = new Map<string, any>();
  private modules = new Map<string, any>();
  private listeners = new Map<string, Set<Function>>();
  private isInitialized = false;

  static getInstance(): TemporalState {
    if (!TemporalState.instance) {
      TemporalState.instance = new TemporalState();
    }
    return TemporalState.instance;
  }

  initialize() {
    this.isInitialized = true;
    console.log('🕰️ Temporal State initialized as system glue');
  }

  isActive(): boolean {
    return this.isInitialized;
  }

  // Module management without bridges (Requirements 2 & 4)
  addModule(moduleId: string, module: any) {
    this.modules.set(moduleId, module);
    this.emit('module:added', { moduleId, module });
  }

  removeModule(moduleId: string) {
    this.modules.delete(moduleId);
    this.emit('module:removed', { moduleId });
  }

  // State synchronization across all modules
  setState(key: string, value: any) {
    this.state.set(key, value);
    this.emit('state:changed', { key, value });
  }

  getState(key?: string) {
    if (key) {
      return this.state.get(key);
    }
    return Object.fromEntries(this.state);
  }

  // Event system for temporal synchronization
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Temporal state event error:', error);
      }
    });
  }
}
