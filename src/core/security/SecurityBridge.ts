
import { BrowserEventEmitter } from '../BrowserEventEmitter';

export class SecurityBridge extends BrowserEventEmitter {
  private registeredKernels: Set<string> = new Set();
  private registeredComponents: Map<string, string> = new Map();
  private registeredBridges: Set<string> = new Set();
  private currentUser: string | null = null;
  
  constructor() {
    super();
  }
  
  public registerKernel(kernelId: string): void {
    this.registeredKernels.add(kernelId);
  }
  
  public unregisterKernel(kernelId: string): void {
    this.registeredKernels.delete(kernelId);
  }
  
  public isKernelRegistered(kernelId: string): boolean {
    return this.registeredKernels.has(kernelId);
  }
  
  public registerComponent(componentId: string, componentType: string): void {
    this.registeredComponents.set(componentId, componentType);
  }
  
  public registerBridge(bridgeId: string): void {
    this.registeredBridges.add(bridgeId);
  }
  
  public updateKernelStatus(kernelId: string, status: string): void {
    this.emit('kernel:status', { kernelId, status });
  }
  
  public report(data: { 
    severity: 'info' | 'warning' | 'critical', 
    source: string, 
    message: string, 
    context?: any 
  }): void {
    this.emit('security:report', data);
  }
  
  public reportSecurityEvent(event: string, data: any): void {
    this.emit(event, data);
  }
  
  public setCurrentUser(user: string | null): void {
    this.currentUser = user;
    this.emit('user:changed', { user });
  }
  
  public getCurrentUser(): string | null {
    return this.currentUser;
  }
}

export const securityBridge = new SecurityBridge();
