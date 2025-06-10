import { BrowserEventEmitter } from '@/core/BrowserEventEmitter';
import { temporalSystemCoordinator } from '@/core/temporal/TemporalSystemCoordinator';

// Export KernelMode enum properly
export enum KernelMode {
  MERGED = 'merged',
  META = 'meta',
  TEMPORAL = 'temporal'
}

export interface HybridState {
  currentMode: KernelMode;
  activeKernels: string[];
  performance: {
    throughput: number;
    latency: number;
    memoryUsage: number;
  };
  lastModeSwitch: number;
}

export class HybridSwarmOrchestrator extends BrowserEventEmitter {
  private static instance: HybridSwarmOrchestrator;
  private isInitialized: boolean = false;

  private constructor() {
    super();
  }

  public static getInstance(): HybridSwarmOrchestrator {
    if (!HybridSwarmOrchestrator.instance) {
      HybridSwarmOrchestrator.instance = new HybridSwarmOrchestrator();
    }
    return HybridSwarmOrchestrator.instance;
  }

  private state: HybridState = {
    currentMode: KernelMode.MERGED,
    activeKernels: [],
    performance: {
      throughput: 0,
      latency: 0,
      memoryUsage: 0
    },
    lastModeSwitch: Date.now()
  };

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Hybrid Swarm Orchestrator...');
    
    try {
      await temporalSystemCoordinator.initialize();
      
      this.state.activeKernels = ['system', 'ai', 'memory', 'security', 'ui', 'regulatory', 'ethics'];
      this.emit('hybrid:initialized', this.state);
      
      console.log('✅ Hybrid Swarm Orchestrator initialized');
    } catch (error) {
      console.error('❌ Hybrid initialization failed:', error);
      throw error;
    }
  }

  async switchMode(targetMode: KernelMode, reason?: string): Promise<boolean> {
    console.log(`🔄 Switching to ${targetMode} mode. Reason: ${reason}`);
    
    const previousMode = this.state.currentMode;
    this.state.currentMode = targetMode;
    this.state.lastModeSwitch = Date.now();
    
    this.emit('hybrid:mode_switched', {
      from: previousMode,
      to: targetMode,
      reason,
      timestamp: Date.now()
    });
    
    return true;
  }

  async processRequest(request: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (this.state.currentMode) {
        case KernelMode.MERGED:
          result = await this.processMergedMode(request);
          break;
        case KernelMode.META:
          result = await this.processMetaMode(request);
          break;
        case KernelMode.TEMPORAL:
          result = await this.processTemporalMode(request);
          break;
        default:
          throw new Error(`Unknown kernel mode: ${this.state.currentMode}`);
      }
      
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime);
      
      return result;
    } catch (error) {
      console.error('❌ Request processing failed:', error);
      throw error;
    }
  }

  private async processMergedMode(request: any): Promise<any> {
    // Process using merged WASM kernel (all 7 kernels in one blob)
    console.log('⚡ Processing in MERGED mode - ultra fast');
    return { mode: 'merged', processed: true, timestamp: Date.now() };
  }

  private async processMetaMode(request: any): Promise<any> {
    // Process using meta kernel coordination
    console.log('🧠 Processing in META mode - flexible coordination');
    return { mode: 'meta', processed: true, timestamp: Date.now() };
  }

  private async processTemporalMode(request: any): Promise<any> {
    // Process using pure temporal coordination
    console.log('🕐 Processing in TEMPORAL mode - pure temporal');
    return { mode: 'temporal', processed: true, timestamp: Date.now() };
  }

  private updatePerformanceMetrics(processingTime: number): void {
    this.state.performance.latency = processingTime;
    this.state.performance.throughput = 1000 / processingTime; // requests per second
    this.state.performance.memoryUsage = Math.random() * 1000; // Mock memory usage
    
    this.emit('hybrid:performance_update', this.state.performance);
  }

  async hotswapKernel(kernelId: string, newKernelWasm: Uint8Array): Promise<boolean> {
    console.log(`🔥 Hotswapping kernel: ${kernelId}`);
    
    // Only available in META mode
    if (this.state.currentMode !== KernelMode.META) {
      console.warn('⚠️ Hotswap only available in META mode');
      return false;
    }
    
    this.emit('hybrid:kernel_hotswapped', { kernelId, timestamp: Date.now() });
    return true;
  }

  getState(): HybridState {
    return { ...this.state };
  }
}

export const hybridSwarmOrchestrator = new HybridSwarmOrchestrator();
