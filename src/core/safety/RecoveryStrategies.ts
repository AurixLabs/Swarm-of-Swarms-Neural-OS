
import { ErrorRecord, RecoveryStrategy } from './types';
import { systemKernel } from '../SystemKernel';

/**
 * Registry of recovery strategies for common error conditions
 */
export class RecoveryStrategies {
  private static strategies: Map<string, RecoveryStrategy> = new Map();
  
  /**
   * Initialize default recovery strategies
   */
  public static initialize(): void {
    // Add default strategies
    this.register(this.pageReload);
    this.register(this.clearLocalStorage);
    this.register(this.resetKernelState);
    this.register(this.restartModule);
    this.register(this.reconnectEvents);
    this.register(this.resetUI);
    this.register(this.clearCache);
    this.register(this.suggestCodeFix);
  }
  
  /**
   * Register a strategy
   */
  public static register(strategy: RecoveryStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }
  
  /**
   * Get a strategy by ID
   */
  public static get(id: string): RecoveryStrategy | undefined {
    return this.strategies.get(id);
  }
  
  /**
   * Get all strategies
   */
  public static getAll(): RecoveryStrategy[] {
    return Array.from(this.strategies.values());
  }
  
  /**
   * Get strategies applicable to an error
   */
  public static getApplicable(error: ErrorRecord): RecoveryStrategy[] {
    return this.getAll().filter(strategy => strategy.condition(error))
      .sort((a, b) => b.priority - a.priority);
  }
  
  // Page reload strategy
  public static pageReload: RecoveryStrategy = {
    id: 'system:page-reload',
    condition: (error: ErrorRecord) => error.severity === 'CRITICAL',
    action: async () => {
      console.log('Executing page reload recovery strategy');
      await new Promise(resolve => setTimeout(resolve, 3000));
      window.location.reload();
      return true;
    },
    priority: 10
  };
  
  // Clear local storage strategy
  public static clearLocalStorage: RecoveryStrategy = {
    id: 'system:clear-storage',
    condition: (error: ErrorRecord) => 
      error.message.includes('storage') || 
      error.message.includes('JSON') ||
      error.message.includes('parse'),
    action: async () => {
      console.log('Executing clear local storage recovery strategy');
      localStorage.clear();
      return true;
    },
    priority: 20
  };
  
  // Reset kernel state strategy
  public static resetKernelState: RecoveryStrategy = {
    id: 'system:reset-kernel-state',
    condition: (error: ErrorRecord) => 
      error.component?.includes('kernel') || 
      error.message.includes('kernel'),
    action: async (error) => {
      console.log('Executing reset kernel state recovery strategy');
      const kernelId = error.component?.split(':')[0] || 'system';
      systemKernel.events.emit('KERNEL_RESET_REQUEST', {
        kernelId,
        reason: error.message
      });
      return true;
    },
    priority: 15
  };
  
  // Restart module strategy
  public static restartModule: RecoveryStrategy = {
    id: 'system:restart-module',
    condition: (error: ErrorRecord) => 
      error.component?.includes('module:') || 
      error.message.includes('module'),
    action: async (error) => {
      console.log('Executing restart module recovery strategy');
      const moduleId = error.component?.split(':')[1] || 
                     error.message.match(/module\s+(\w+)/)?.[1];
      
      if (moduleId) {
        systemKernel.events.emit('MODULE_RESTART_REQUEST', {
          moduleId,
          reason: error.message
        });
        return true;
      }
      return false;
    },
    priority: 25
  };
  
  // Reconnect events strategy
  public static reconnectEvents: RecoveryStrategy = {
    id: 'system:reconnect-events',
    condition: (error: ErrorRecord) => 
      error.message.includes('event') || 
      error.message.includes('listener') ||
      error.message.includes('subscribe'),
    action: async () => {
      console.log('Executing reconnect events recovery strategy');
      
      // Signal system to reconnect event handlers
      systemKernel.events.emit('EVENTS_RECONNECT_REQUEST', {
        timestamp: Date.now()
      });
      
      return true;
    },
    priority: 30
  };
  
  // Reset UI strategy
  public static resetUI: RecoveryStrategy = {
    id: 'system:reset-ui',
    condition: (error: ErrorRecord) => 
      error.component?.includes('ui:') || 
      error.message.includes('render') ||
      error.message.includes('component'),
    action: async () => {
      console.log('Executing reset UI recovery strategy');
      
      // Signal UI kernel to reset component state
      systemKernel.events.emit('UI_RESET_REQUEST', {
        timestamp: Date.now()
      });
      
      return true;
    },
    priority: 35
  };
  
  // Clear cache strategy
  public static clearCache: RecoveryStrategy = {
    id: 'system:clear-cache',
    condition: (error: ErrorRecord) => 
      error.message.includes('cache') || 
      error.message.includes('stale'),
    action: async () => {
      console.log('Executing clear cache recovery strategy');
      
      // Clear application caches
      try {
        systemKernel.events.emit('CACHE_CLEAR_REQUEST', {
          timestamp: Date.now()
        });
        
        // Clear memory cache
        if ('caches' in window) {
          const keys = await window.caches.keys();
          await Promise.all(keys.map(key => window.caches.delete(key)));
        }
        
        return true;
      } catch (e) {
        console.error('Cache clearing error:', e);
        return false;
      }
    },
    priority: 40
  };
  
  // Code suggestion strategy
  public static suggestCodeFix: RecoveryStrategy = {
    id: 'system:suggest-code-fix',
    condition: (error: ErrorRecord) => 
      error.component !== undefined && 
      error.severity !== 'LOW' &&
      !error.handled,
    action: async (error) => {
      console.log('Executing code suggestion recovery strategy');
      
      // Get the CodeSuggestionHealer - dynamic import to avoid circular dependency
      const { codeSuggestionHealer } = await import('./CodeSuggestionHealer');
      
      // Signal that we'll attempt to generate a code suggestion
      systemKernel.events.emit('CODE_SUGGESTION_REQUESTED', {
        error,
        timestamp: Date.now()
      });
      
      // We consider this strategy successful if the healer is enabled
      return codeSuggestionHealer.isHealerEnabled();
    },
    priority: 100 // Lowest priority, runs as a last resort
  };
}

// Initialize strategies
RecoveryStrategies.initialize();

// Export the registry
export default RecoveryStrategies;

// For backward compatibility and to avoid circular imports
export const commonRecoveryStrategies = {
  pageReload: RecoveryStrategies.pageReload,
  clearLocalStorage: RecoveryStrategies.clearLocalStorage,
  resetKernelState: RecoveryStrategies.resetKernelState,
  restartModule: RecoveryStrategies.restartModule,
  reconnectEvents: RecoveryStrategies.reconnectEvents,
  resetUI: RecoveryStrategies.resetUI,
  clearCache: RecoveryStrategies.clearCache,
  // Note: suggestCodeFix is intentionally not exported here to avoid circular dependencies
};
