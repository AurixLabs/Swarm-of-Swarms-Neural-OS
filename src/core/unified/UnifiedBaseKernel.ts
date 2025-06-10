
import { UniversalKernel } from '../UniversalKernel';
import { unifiedEvents, UnifiedEventType } from './UnifiedEventSystem';

export abstract class UnifiedBaseKernel extends UniversalKernel {
  protected kernelName: string;
  
  constructor(kernelName: string) {
    super();
    this.kernelName = kernelName;
    this.events = unifiedEvents;
  }
  
  protected emitKernelEvent(type: UnifiedEventType, payload: any): void {
    unifiedEvents.emitUnified(type, payload, this.kernelName);
  }
  
  public async validateRequest(request: any): Promise<boolean> {
    // Default implementation - kernels can override
    return true;
  }
  
  public getSecurityStatus(): any {
    // Default implementation - kernels can override
    return { status: 'unknown', timestamp: Date.now() };
  }
  
  public reportViolation(violation: any): void {
    this.emitKernelEvent('SECURITY_ALERT', {
      type: 'violation',
      details: violation,
      kernel: this.kernelName
    });
  }
  
  public initialize(): boolean {
    this.emitKernelEvent('KERNEL_INITIALIZED', { kernel: this.kernelName });
    return true;
  }
  
  public shutdown(): void {
    this.emitKernelEvent('KERNEL_SHUTDOWN', { kernel: this.kernelName });
    this.events.removeAllListeners();
  }
}
