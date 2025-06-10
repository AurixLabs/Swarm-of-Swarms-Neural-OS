
import { unifiedEthicsEngine } from './UnifiedEthicsEngine';
import { unifiedEvents } from '../unified/UnifiedEventSystem';

export class EthicsBootstrap {
  private isRunning: boolean = false;
  private registeredKernels: Set<any> = new Set();
  private ethicsMode: string = 'balanced';
  private frameworks: string[] = ['utilitarian', 'deontological', 'virtue_ethics'];
  private rules: any[] = [
    { id: 'no_harm', description: 'Do not cause harm to humans' },
    { id: 'respect_autonomy', description: 'Respect human autonomy and choice' },
    { id: 'fairness', description: 'Treat all beings fairly and without discrimination' }
  ];
  
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    unifiedEvents.emitUnified('KERNEL_INITIALIZED', {
      kernel: 'ethics-bootstrap',
      status: 'started'
    }, 'ethics');
  }
  
  public registerKernel(kernel: any): void {
    this.registeredKernels.add(kernel);
    unifiedEthicsEngine.registerKernelWithEmbeddedEthics(kernel);
  }
  
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    unifiedEthicsEngine.stop();
    this.registeredKernels.clear();
  }
  
  public isActive(): boolean {
    return this.isRunning;
  }
  
  public getEthicsMode(): string {
    return this.ethicsMode;
  }
  
  public setEthicsMode(mode: string): void {
    this.ethicsMode = mode;
  }
  
  public getFrameworks(): string[] {
    return [...this.frameworks];
  }
  
  public getRules(): any[] {
    return [...this.rules];
  }
}

export const ethicsBootstrap = new EthicsBootstrap();
