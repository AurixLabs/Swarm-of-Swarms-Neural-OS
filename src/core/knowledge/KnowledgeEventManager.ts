
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { KnowledgeEngineEvent, EngineEventHandler } from './types/engineTypes';

export class KnowledgeEventManager {
  private events: BrowserEventEmitter;

  constructor() {
    this.events = new BrowserEventEmitter();
  }

  public emit(event: KnowledgeEngineEvent): void {
    this.events.emit(event.type, {
      ...event.payload,
      timestamp: Date.now()
    });
  }

  public on(event: string, handler: EngineEventHandler): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }

  public off(event: string, handler: EngineEventHandler): void {
    this.events.off(event, handler);
  }

  public removeAllListeners(): void {
    this.events.removeAllListeners();
  }
}
