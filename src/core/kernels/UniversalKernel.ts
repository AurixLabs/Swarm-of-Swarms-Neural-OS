
import { EventEmitter } from 'events';

export interface KernelState {
  id: string;
  status: 'active' | 'inactive' | 'error';
  load: number;
  responseTime: number;
  lastUpdate: Date;
}

export abstract class UniversalKernel extends EventEmitter {
  protected state: KernelState;

  constructor(id: string) {
    super();
    this.state = {
      id,
      status: 'inactive',
      load: 0,
      responseTime: 0,
      lastUpdate: new Date()
    };
  }

  abstract initialize(): Promise<void>;
  abstract process(data: any): Promise<any>;
  abstract shutdown(): Promise<void>;

  getState(): KernelState {
    return { ...this.state };
  }

  protected updateState(updates: Partial<KernelState>) {
    this.state = { ...this.state, ...updates, lastUpdate: new Date() };
    this.emit('stateChanged', this.state);
  }
}
