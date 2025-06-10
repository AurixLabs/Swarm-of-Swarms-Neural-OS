
import { FailoverEvent, KernelHealthEvent, FailoverMap } from './types';
import { BrowserEventEmitter } from '../BrowserEventEmitter';

export class FailoverManager {
  private failoverMap: FailoverMap = new Map();
  private events = new BrowserEventEmitter();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.events.on('kernel:health', (event: KernelHealthEvent) => {
      if (!event.healthy) {
        this.handleKernelFailure(event.kernelId, event.reason || 'unknown');
      }
    });
  }

  public registerFailoverPair(primaryId: string, backupId: string): void {
    if (!this.failoverMap.has(primaryId)) {
      this.failoverMap.set(primaryId, []);
    }
    
    this.failoverMap.get(primaryId)?.push(backupId);
    console.log(`Registered failover pair: ${primaryId} -> ${backupId}`);
  }

  private handleKernelFailure(failedKernelId: string, reason: string): void {
    const backups = this.failoverMap.get(failedKernelId);
    
    if (!backups || backups.length === 0) {
      console.error(`No backup kernels registered for ${failedKernelId}`);
      return;
    }

    const backupKernelId = backups[0]; // Use first available backup
    
    const failoverEvent: FailoverEvent = {
      failedKernelId,
      backupKernelId,
      timestamp: Date.now()
    };

    this.events.emit('failover:initiated', failoverEvent);
    console.log(`Initiating failover: ${failedKernelId} -> ${backupKernelId}`);
  }

  public getFailoverMap(): FailoverMap {
    return new Map(this.failoverMap);
  }

  public on(event: string, handler: (data: any) => void): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }
}

export const failoverManager = new FailoverManager();
