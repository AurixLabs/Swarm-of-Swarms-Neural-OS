
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { SystemEvent } from '../types/eventTypes';

export class OptimizedEventSystem extends BrowserEventEmitter {
  private eventQueue: SystemEvent[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private batchSize = 50;
  private processingDelay = 16; // ~60fps

  constructor() {
    super();
    this.startProcessing();
  }

  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processBatch();
    }, this.processingDelay);
  }

  private processBatch(): void {
    const batch = this.eventQueue.splice(0, this.batchSize);
    batch.forEach(event => {
      this.emit(event.type, event);
    });
  }

  public queueEvent(event: SystemEvent): void {
    this.eventQueue.push(event);
  }

  public destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.eventQueue = [];
  }
}

export const optimizedEventSystem = new OptimizedEventSystem();
