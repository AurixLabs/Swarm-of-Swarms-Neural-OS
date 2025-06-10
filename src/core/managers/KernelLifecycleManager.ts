import { BrowserEventEmitter } from '@/core/events/BrowserEventEmitter';
import { SystemKernel } from '../kernels/SystemKernel';
import { AIKernel } from '../kernels/AIKernel';
import { MemoryKernel } from '../kernels/MemoryKernel';
import { SecurityKernel } from '../kernels/SecurityKernel';
import { EthicsKernel } from '../kernels/EthicsKernel';
import { UIKernel } from '../kernels/UIKernel';
import { RegulatoryKernel } from '../kernels/RegulatoryKernel';
import { NetworkKernel } from '../kernels/NetworkKernel';
import { CognitiveKernel } from '../kernels/CognitiveKernel';
import { UniversalKernel, KernelStatus } from '../kernels/UniversalKernel';

export interface KernelInfo {
  id: string;
  name: string;
  type: string;
  status: KernelStatus;
  priority: number;
  isInitialized: boolean;
  lastHealthCheck: number;
  dependencies: string[];
}

export interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  totalKernels: number;
  healthyKernels: number;
  degradedKernels: number;
  criticalKernels: number;
  offlineKernels: number;
}

class KernelLifecycleManagerImpl extends BrowserEventEmitter {
  private kernels: Map<string, UniversalKernel> = new Map();
  private initializationOrder: string[] = [
    'ethics', 'security', 'system', 'memory', 'ai', 
    'regulatory', 'ui', 'network', 'cognitive'
  ];

  constructor() {
    super();
    this.initializeKernelInstances();
  }

  private initializeKernelInstances(): void {
    // Create kernel instances
    this.kernels.set('ethics', new EthicsKernel());
    this.kernels.set('security', new SecurityKernel());
    this.kernels.set('system', new SystemKernel({
      priority: 9,
      dependencies: ['ethics', 'security']
    }));
    this.kernels.set('memory', new MemoryKernel());
    this.kernels.set('ai', new AIKernel({
      priority: 8,
      dependencies: ['system', 'memory'],
      aiProviders: ['openai', 'anthropic']
    }));
    this.kernels.set('regulatory', new RegulatoryKernel());
    this.kernels.set('ui', new UIKernel());
    this.kernels.set('network', new NetworkKernel());
    this.kernels.set('cognitive', new CognitiveKernel());
  }

  async initializeAllKernels(): Promise<void> {
    console.log('🔥 Initializing all kernels...');
    
    for (const kernelId of this.initializationOrder) {
      const kernel = this.kernels.get(kernelId);
      if (kernel) {
        try {
          await kernel.initialize();
          this.emit('kernel_status_changed', this.getKernelInfo(kernelId));
        } catch (error) {
          console.error(`❌ Failed to initialize kernel ${kernelId}:`, error);
          this.emit('kernel_status_changed', this.getKernelInfo(kernelId));
        }
      }
    }
    
    this.emit('system_health_changed', this.getSystemHealth());
    console.log('✅ All kernels initialized');
  }

  async shutdownAllKernels(): Promise<void> {
    console.log('🔥 Shutting down all kernels...');
    
    for (const kernelId of this.initializationOrder.slice().reverse()) {
      const kernel = this.kernels.get(kernelId);
      if (kernel) {
        try {
          await kernel.shutdown();
          this.emit('kernel_status_changed', this.getKernelInfo(kernelId));
        } catch (error) {
          console.error(`❌ Failed to shutdown kernel ${kernelId}:`, error);
          this.emit('kernel_status_changed', this.getKernelInfo(kernelId));
        }
      }
    }

    this.emit('system_health_changed', this.getSystemHealth());
    console.log('✅ All kernels shutdown');
  }

  async restartKernel(kernelId: string): Promise<void> {
    const kernel = this.kernels.get(kernelId);
    if (!kernel) {
      console.warn(`Kernel ${kernelId} not found`);
      return;
    }

    console.log(`🔥 Restarting kernel ${kernelId}...`);
    try {
      await kernel.restart();
      this.emit('kernel_status_changed', this.getKernelInfo(kernelId));
    } catch (error) {
      console.error(`❌ Failed to restart kernel ${kernelId}:`, error);
      this.emit('kernel_status_changed', this.getKernelInfo(kernelId));
    }
    
    this.emit('system_health_changed', this.getSystemHealth());
  }

  getKernelInfo(kernelId: string): KernelInfo {
    const kernel = this.kernels.get(kernelId);
    if (!kernel) {
      throw new Error(`Kernel ${kernelId} not found`);
    }

    return {
      id: kernel.getId(),
      name: kernel.getName(),
      type: kernel.getType(),
      status: kernel.getStatus(),
      priority: this.getKernelPriority(kernelId),
      isInitialized: kernel.getIsInitialized(),
      lastHealthCheck: kernel.getLastHealthCheck(),
      dependencies: this.getKernelDependencies(kernelId)
    };
  }

  getAllKernels(): KernelInfo[] {
    return Array.from(this.kernels.keys()).map(kernelId => this.getKernelInfo(kernelId));
  }

  getSystemHealth(): SystemHealth {
    let healthyKernels = 0;
    let degradedKernels = 0;
    let criticalKernels = 0;
    let offlineKernels = 0;

    for (const kernelId of this.kernels.keys()) {
      const kernel = this.kernels.get(kernelId);
      if (!kernel) continue;

      switch (kernel.getStatus()) {
        case 'healthy':
          healthyKernels++;
          break;
        case 'degraded':
          degradedKernels++;
          break;
        case 'critical':
          criticalKernels++;
          break;
        default:
          offlineKernels++;
          break;
      }
    }

    const totalKernels = this.kernels.size;
    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';

    if (criticalKernels > 0) {
      overallStatus = 'critical';
    } else if (degradedKernels > 0) {
      overallStatus = 'degraded';
    }

    return {
      overallStatus,
      totalKernels,
      healthyKernels,
      degradedKernels,
      criticalKernels,
      offlineKernels
    };
  }

  private getKernelPriority(kernelId: string): number {
    const kernel = this.kernels.get(kernelId);
    if (kernel && typeof kernel.getPriority === 'function') {
      return kernel.getPriority();
    }
    return 5;
  }

  private getKernelDependencies(kernelId: string): string[] {
    const kernel = this.kernels.get(kernelId);
    if (kernel && typeof kernel.getDependencies === 'function') {
      return kernel.getDependencies();
    }
    return [];
  }
}

export const kernelLifecycleManager = new KernelLifecycleManagerImpl();
export default kernelLifecycleManager;
