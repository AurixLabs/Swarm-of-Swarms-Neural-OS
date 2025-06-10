
// Import from correct relative paths:
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { useState, useEffect } from 'react';
import { systemKernel } from '../SystemKernel';
import { ErrorSeverity, ErrorRecord, RecoveryStrategy } from './types';
import { commonRecoveryStrategies } from './RecoveryStrategies';

/**
 * SafetyNet provides error handling, recovery strategies,
 * and system-wide protection against crashes
 */
export class SafetyNet {
  private static instance: SafetyNet;
  private errorLog: ErrorRecord[] = [];
  private strategies: RecoveryStrategy[] = [];
  private eventEmitter = new BrowserEventEmitter();
  private isRecovering = false;
  private maxErrorLogSize = 100;
  private autoHealEnabled = true;
  
  private constructor() {
    // Setup global error handlers
    this.setupGlobalHandlers();
    
    // Register default recovery strategies
    this.registerDefaultStrategies();
    
    // Connect to system kernel events
    this.connectToSystemKernel();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): SafetyNet {
    if (!this.instance) {
      this.instance = new SafetyNet();
    }
    return this.instance;
  }
  
  /**
   * Register a new recovery strategy
   */
  public registerStrategy(strategy: RecoveryStrategy): void {
    // Check for duplicate IDs
    const existingIndex = this.strategies.findIndex(s => s.id === strategy.id);
    if (existingIndex >= 0) {
      this.strategies[existingIndex] = strategy;
    } else {
      this.strategies.push(strategy);
    }
    
    // Sort strategies by priority (higher numbers first)
    this.strategies.sort((a, b) => b.priority - a.priority);
    
    console.log(`Recovery strategy registered: ${strategy.id}`);
  }
  
  /**
   * Unregister a recovery strategy
   */
  public unregisterStrategy(id: string): boolean {
    const initialLength = this.strategies.length;
    this.strategies = this.strategies.filter(s => s.id !== id);
    return this.strategies.length !== initialLength;
  }
  
  /**
   * Capture an error for processing
   */
  public captureError(
    error: Error | string,
    component?: string,
    severity: ErrorSeverity = 'MEDIUM'
  ): void {
    const errorRecord: ErrorRecord = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: Date.now(),
      component,
      handled: false,
      severity
    };
    
    // Add to log
    this.errorLog.unshift(errorRecord);
    
    // Trim log if needed
    if (this.errorLog.length > this.maxErrorLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxErrorLogSize);
    }
    
    // Emit event
    this.eventEmitter.emit('error:captured', errorRecord);
    
    // Notify system kernel about the error
    systemKernel.events.emit('SAFETY_ERROR_DETECTED', {
      error: errorRecord,
      source: 'safetyNet'
    });
    
    // Attempt recovery if auto-healing is enabled
    if (this.autoHealEnabled) {
      this.attemptRecovery(errorRecord);
    }
  }
  
  /**
   * Get error log
   */
  public getErrorLog(): ErrorRecord[] {
    return [...this.errorLog];
  }
  
  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
    this.eventEmitter.emit('error:log-cleared');
  }
  
  /**
   * Enable or disable auto-healing
   */
  public setAutoHealEnabled(enabled: boolean): void {
    this.autoHealEnabled = enabled;
    console.log(`Auto-healing ${enabled ? 'enabled' : 'disabled'}`);
    
    systemKernel.events.emit('SAFETY_CONFIG_CHANGED', {
      autoHeal: enabled
    });
  }
  
  /**
   * Get the current auto-healing status
   */
  public isAutoHealEnabled(): boolean {
    return this.autoHealEnabled;
  }
  
  /**
   * Listen for safety net events
   */
  public on(event: string, handler: (data: any) => void): () => void {
    this.eventEmitter.on(event, handler);
    return () => this.eventEmitter.off(event, handler);
  }
  
  /**
   * Connect to system kernel events
   */
  private connectToSystemKernel(): void {
    // Listen for system-wide health issues
    const healthStatusOff = systemKernel.events.on('SYSTEM_HEALTH_STATUS', (event) => {
      if (event.payload && event.payload.overallStatus === 'degraded') {
        this.captureError(
          `System health degraded: ${event.payload.modules.filter(m => m.status !== 'healthy').map(m => m.id).join(', ')}`,
          'system:health-monitor',
          'HIGH'
        );
      }
    });
    
    // Listen for kernel module failures
    const serviceHealthOff = systemKernel.events.on('SERVICE_HEALTH_ALERT', (event) => {
      if (event.payload) {
        this.captureError(
          `Service health issue: ${event.payload.serviceId} - ${event.payload.message || 'Unknown issue'}`,
          'system:service-container',
          event.payload.status === 'failed' ? 'HIGH' : 'MEDIUM'
        );
      }
    });
    
    // Listen for self-healing requests
    const recoveryRequestOff = systemKernel.events.on('SAFETY_RECOVERY_REQUEST', (event) => {
      if (event.payload && event.payload.error) {
        this.attemptRecovery(event.payload.error);
      }
    });
  }
  
  /**
   * Set up global error handlers
   */
  private setupGlobalHandlers(): void {
    // Handle uncaught exceptions
    window.addEventListener('error', (event) => {
      this.captureError(
        event.error || event.message, 
        'window', 
        'HIGH'
      );
      
      // Don't prevent default - let the browser handle it too
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.captureError(
        error,
        'promise',
        'MEDIUM'
      );
    });
  }
  
  /**
   * Register default recovery strategies
   */
  private registerDefaultStrategies(): void {
    // Register from external registry for all base strategies
    Object.values(commonRecoveryStrategies).forEach(strategy => {
      this.registerStrategy(strategy);
    });
  }
  
  /**
   * Try to recover from an error using registered strategies
   */
  private async attemptRecovery(error: ErrorRecord): Promise<boolean> {
    if (this.isRecovering) return false;
    
    this.isRecovering = true;
    let recoverySuccessful = false;
    
    try {
      console.log(`Attempting to recover from error: ${error.message}`);
      
      // Find applicable strategies
      const applicableStrategies = this.strategies.filter(
        strategy => strategy.condition(error)
      );
      
      console.log(`Found ${applicableStrategies.length} applicable recovery strategies`);
      
      // Try each strategy in priority order
      for (const strategy of applicableStrategies) {
        try {
          console.log(`Trying recovery strategy: ${strategy.id}`);
          const success = await strategy.action(error);
          if (success) {
            recoverySuccessful = true;
            
            // Mark error as handled
            error.handled = true;
            
            // Emit recovery event
            this.eventEmitter.emit('error:recovered', {
              error,
              strategyId: strategy.id
            });
            
            // Notify system kernel about successful recovery
            systemKernel.events.emit('SAFETY_RECOVERY_SUCCESS', {
              error,
              strategyId: strategy.id,
              timestamp: Date.now()
            });
            
            console.log(`Recovery successful with strategy: ${strategy.id}`);
            break;
          }
        } catch (recoveryError) {
          console.error(`Recovery strategy ${strategy.id} failed:`, recoveryError);
        }
      }
      
      // If no strategy succeeded
      if (!recoverySuccessful) {
        console.warn('No recovery strategy succeeded for error:', error.message);
        this.eventEmitter.emit('error:unrecoverable', error);
        
        // Notify system kernel about failed recovery
        systemKernel.events.emit('SAFETY_RECOVERY_FAILED', {
          error,
          timestamp: Date.now()
        });
      }
      
      return recoverySuccessful;
    } finally {
      this.isRecovering = false;
    }
  }
}

// Export singleton instance
export const safetyNet = SafetyNet.getInstance();

// React hook for using the safety net
export const useSafetyNet = () => {
  const [errorLog, setErrorLog] = useState<ErrorRecord[]>(safetyNet.getErrorLog());
  const [autoHealEnabled, setAutoHealEnabled] = useState<boolean>(safetyNet.isAutoHealEnabled());
  
  useEffect(() => {
    // Update error log when it changes
    const handleErrorCaptured = () => {
      setErrorLog(safetyNet.getErrorLog());
    };
    
    const handleLogCleared = () => {
      setErrorLog([]);
    };
    
    const handleConfigChanged = (data: any) => {
      if (data && data.autoHeal !== undefined) {
        setAutoHealEnabled(data.autoHeal);
      }
    };
    
    // Subscribe to events
    const unsubscribeCapture = safetyNet.on('error:captured', handleErrorCaptured);
    const unsubscribeClear = safetyNet.on('error:log-cleared', handleLogCleared);
    const unsubscribeRecover = safetyNet.on('error:recovered', handleErrorCaptured);
    const unsubscribeConfig = systemKernel.on('SAFETY_CONFIG_CHANGED', handleConfigChanged);
    
    // Clean up subscriptions
    return () => {
      unsubscribeCapture();
      unsubscribeClear();
      unsubscribeRecover();
      unsubscribeConfig();
    };
  }, []);
  
  const captureError = (
    error: Error | string,
    component?: string,
    severity: ErrorSeverity = 'MEDIUM'
  ) => {
    safetyNet.captureError(error, component, severity);
  };
  
  return {
    errorLog,
    captureError,
    clearErrorLog: safetyNet.clearErrorLog.bind(safetyNet),
    registerStrategy: safetyNet.registerStrategy.bind(safetyNet),
    unregisterStrategy: safetyNet.unregisterStrategy.bind(safetyNet),
    autoHealEnabled,
    setAutoHealEnabled: safetyNet.setAutoHealEnabled.bind(safetyNet)
  };
};
