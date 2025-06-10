
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { multiKernelConnector } from '../MultiKernelConnector';
import { failoverConfig } from './FailoverConfigProvider';
import { FailoverEvent, KernelHealthEvent } from './types';

export class KernelFailoverCoordinator {
  private static instance: KernelFailoverCoordinator;
  private events = new BrowserEventEmitter();

  private constructor() {
    multiKernelConnector.on('kernel:health', this.handleKernelHealth);
  }

  public static getInstance(): KernelFailoverCoordinator {
    if (!this.instance) {
      this.instance = new KernelFailoverCoordinator();
    }
    return this.instance;
  }

  private handleKernelHealth = (event: KernelHealthEvent) => {
    if (!event.healthy) {
      console.log(`Kernel ${event.kernelId} is unhealthy, initiating failover`);
      this.initiateFailover(event.kernelId);
    }
  };

  private async initiateFailover(failedKernelId: string): Promise<void> {
    const backupKernels = failoverConfig.getBackupKernels(failedKernelId);
    
    for (const backupId of backupKernels) {
      if (multiKernelConnector.isConnected(backupId)) {
        console.log(`Activating ${backupId} kernel as backup for ${failedKernelId}`);
        
        multiKernelConnector.sendToKernel(backupId, 'TAKE_OVER', {
          failedKernelId,
          timestamp: Date.now()
        });
        
        this.events.emit('failover:activated', {
          failedKernelId,
          backupKernelId: backupId,
          timestamp: Date.now()
        } as FailoverEvent);
        
        break;
      }
    }
  }

  public on(event: string, handler: (data: any) => void): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }
}

export const kernelFailoverCoordinator = KernelFailoverCoordinator.getInstance();
