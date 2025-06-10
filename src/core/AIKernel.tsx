
import { UniversalKernel, Module, ModuleMetadata } from './UniversalKernel';
import { createContext, useContext, ReactNode } from 'react';
import { BrowserEventEmitter } from './BrowserEventEmitter';
import { resourceMonitor } from './monitoring/ResourceMonitor';
import { aiRateLimiter } from './ai/AIRateLimiter';
import { KernelHealthEvent } from './failover/types';

export interface AIModule extends Module {
  initialize(): Promise<void>;
}

export class AIKernel extends UniversalKernel {
  private _aiModules = new Map<string, AIModule>();
  private _localState = new Map<string, any>();

  constructor() {
    super();
    this.events = new BrowserEventEmitter();
  }

  public async initialize(): Promise<void> {
    try {
      await super.initialize();
      resourceMonitor.startMonitoring();
      this.setState('system:healthy', true);
      
      resourceMonitor.on('resource:warning', (metrics) => {
        console.warn('Resource warning in AI Kernel:', metrics);
        this.setState('system:healthy', false);
      });
    } catch (error) {
      console.error('Failed to initialize AI Kernel:', error);
      this.setState('system:healthy', false);
    }
  }

  public override async registerModule(moduleId: string, module: Module): Promise<boolean> {
    const aiModule = module as AIModule;
    
    if (!this._aiModules.has(aiModule.id)) {
      this._aiModules.set(aiModule.id, aiModule);
      
      if (typeof aiModule.initialize === 'function') {
        try {
          await aiModule.initialize();
          return true;
        } catch (error) {
          console.error(`Failed to initialize AI module ${moduleId}:`, error);
          return false;
        }
      }
      
      return true;
    }
    
    return false;
  }

  public override async unregisterModule(moduleId: string): Promise<boolean> {
    const module = this._aiModules.get(moduleId);
    if (module) {
      if (module.destroy) {
        try {
          await module.destroy();
        } catch (error) {
          console.error(`Error destroying AI module ${moduleId}:`, error);
        }
      }
      this._aiModules.delete(moduleId);
      return true;
    }
    return false;
  }

  public override getModule<T extends Module>(moduleId: string): T | undefined {
    return this._aiModules.get(moduleId) as unknown as T | undefined;
  }

  public override listModules(): Module[] {
    return Array.from(this._aiModules.values());
  }

  public override getState<T>(key: string): T | undefined {
    return this._localState.get(key) as T | undefined;
  }

  public override setState<T>(key: string, value: T): void {
    this._localState.set(key, value);
    this.events.emitEvent({ type: 'CONTEXT_UPDATED', payload: { key, value } });
  }

  public async processRequest(request: any): Promise<any> {
    try {
      const canProcess = await aiRateLimiter.acquireToken();
      
      if (!canProcess) {
        this.events.emitEvent({
          type: 'kernel:health',
          payload: { 
            kernelId: 'ai',
            healthy: false,
            reason: 'overloaded'
          } as KernelHealthEvent
        });
        
        throw new Error('AI system is currently overloaded');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      aiRateLimiter.releaseToken();
      
      return {
        success: true,
        data: {
          message: 'AI processed the request successfully'
        }
      };
    } catch (error) {
      aiRateLimiter.releaseToken();
      throw error;
    }
  }

  public takeOver(failedKernelId: string): void {
    console.log(`AIKernel taking over for ${failedKernelId}`);
    aiRateLimiter.setFailoverMode(true);
    
    this.setState('failover:active', {
      failedKernelId,
      timestamp: Date.now()
    });
  }

  public registerModel(modelName: string): boolean {
    this.setState(`model:${modelName}`, { active: true });
    return true;
  }
}

export const aiKernel = new AIKernel();

export const AIContext = createContext<AIKernel | null>(null);

export const AIProvider = ({ children }: { children: ReactNode }) => (
  <AIContext.Provider value={aiKernel}>
    {children}
  </AIContext.Provider>
);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
