import { systemKernel } from '../SystemKernel';
import { aiKernel } from '../AIKernel';
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { EventManager } from '../EventManager';

/**
 * AdaptiveSelfModifier - Enables dynamic reconfiguration of the system architecture
 * 
 * This component allows the system to autonomously reorganize based on usage patterns,
 * performance metrics, and context shifts.
 */
export class AdaptiveSelfModifier {
  private static instance: AdaptiveSelfModifier;
  private events = new BrowserEventEmitter();
  private usagePatterns: Record<string, number> = {};
  private performanceMetrics: Record<string, number[]> = {};
  private reconfigurationThreshold = 0.75; // Threshold for triggering reconfiguration
  private isEnabled = false;
  private lastReconfiguration = 0;
  private cooldownPeriod = 5000; // 5 seconds cooldown between reconfigurations
  
  // Private constructor to enforce singleton
  private constructor() {
    this.initializeListeners();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): AdaptiveSelfModifier {
    if (!AdaptiveSelfModifier.instance) {
      AdaptiveSelfModifier.instance = new AdaptiveSelfModifier();
    }
    return AdaptiveSelfModifier.instance;
  }
  
  /**
   * Initialize event listeners for adaptation
   */
  private initializeListeners(): void {
    // Listen to system events
    systemKernel.events.onEvent('DATA_UPDATED', this.handleDataUpdated);
    aiKernel.events.onEvent('CONTEXT_UPDATED', this.handleContextUpdated);
    
    // Set up periodic optimization check
    setInterval(() => {
      if (this.isEnabled) {
        this.evaluateAdaptationOpportunities();
      }
    }, 10000); // Check every 10 seconds
  }
  
  /**
   * Enable adaptive self-modification
   */
  public enable(): void {
    this.isEnabled = true;
    console.log('Adaptive self-modification enabled');
    this.events.emit('adaptive:enabled', { timestamp: Date.now() });
  }
  
  /**
   * Disable adaptive self-modification
   */
  public disable(): void {
    this.isEnabled = false;
    console.log('Adaptive self-modification disabled');
    this.events.emit('adaptive:disabled', { timestamp: Date.now() });
  }
  
  /**
   * Track module usage to identify patterns
   */
  public trackModuleUsage(moduleId: string): void {
    if (!this.usagePatterns[moduleId]) {
      this.usagePatterns[moduleId] = 0;
    }
    this.usagePatterns[moduleId]++;
  }
  
  /**
   * Record performance metric for a module
   */
  public recordPerformanceMetric(moduleId: string, metric: number): void {
    if (!this.performanceMetrics[moduleId]) {
      this.performanceMetrics[moduleId] = [];
    }
    this.performanceMetrics[moduleId].push(metric);
    
    // Keep only the last 10 metrics
    if (this.performanceMetrics[moduleId].length > 10) {
      this.performanceMetrics[moduleId].shift();
    }
  }
  
  /**
   * Evaluate if the system should adapt based on current state
   */
  private evaluateAdaptationOpportunities(): void {
    if (Date.now() - this.lastReconfiguration < this.cooldownPeriod) {
      return; // Still in cooldown period
    }
    
    // Calculate adaptation score based on performance metrics and usage patterns
    let adaptationScore = 0;
    
    // Check for performance issues
    for (const [moduleId, metrics] of Object.entries(this.performanceMetrics)) {
      if (metrics.length >= 3) {
        // Check if performance is degrading
        const average = metrics.reduce((sum, m) => sum + m, 0) / metrics.length;
        if (average > 100) { // Arbitrary threshold for slow performance (100ms)
          adaptationScore += 0.2;
        }
      }
    }
    
    // Check for usage pattern shifts
    const totalUsage = Object.values(this.usagePatterns).reduce((sum, count) => sum + count, 0);
    const activeModules = Object.keys(this.usagePatterns).length;
    
    if (totalUsage > 50 && activeModules > 3) {
      // High usage with multiple active modules
      adaptationScore += 0.3;
    }
    
    // If adaptation score exceeds threshold, trigger reconfiguration
    if (adaptationScore >= this.reconfigurationThreshold) {
      this.reconfigureSystem();
    }
  }
  
  /**
   * Reconfigure the system based on current state
   */
  private reconfigureSystem(): void {
    console.log('Reconfiguring system based on adaptation analysis');
    this.lastReconfiguration = Date.now();
    
    // Find most and least used modules
    const sortedModules = Object.entries(this.usagePatterns)
      .sort(([, countA], [, countB]) => countB - countA);
    
    const mostUsedModules = sortedModules.slice(0, 3).map(([id]) => id);
    const leastUsedModules = sortedModules.slice(-3).map(([id]) => id);
    
    // Prioritize most used modules (e.g., preload them)
    if (mostUsedModules.length > 0) {
      systemKernel.setState('system:prioritizedModules', mostUsedModules);
      this.events.emit('adaptive:prioritized', { modules: mostUsedModules });
    }
    
    // Deprioritize least used modules (e.g., lazy load them)
    if (leastUsedModules.length > 0) {
      systemKernel.setState('system:deprioritizedModules', leastUsedModules);
      this.events.emit('adaptive:deprioritized', { modules: leastUsedModules });
    }
    
    // Reset performance tracking after reconfiguration
    this.performanceMetrics = {};
    
    // Emit reconfiguration event
    this.events.emit('adaptive:reconfigured', {
      timestamp: Date.now(),
      adaptationScore: this.reconfigurationThreshold
    });
  }
  
  /**
   * Handle data updated events from system kernel
   */
  private handleDataUpdated = (payload: any): void => {
    if (!this.isEnabled) return;
    
    // Track module usage if related to a module
    if (payload.key && payload.key.startsWith('module:')) {
      const moduleId = payload.key.replace('module:', '');
      this.trackModuleUsage(moduleId);
    }
  };
  
  /**
   * Handle context updated events from AI kernel
   */
  private handleContextUpdated = (payload: any): void => {
    if (!this.isEnabled) return;
    
    // Track context changes that might trigger adaptation
    if (payload.key === 'search:results' || payload.key === 'intent:detected') {
      this.evaluateAdaptationOpportunities();
    }
  };
  
  /**
   * Subscribe to adaptation events
   */
  public on(event: string, handler: (data: any) => void): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }
}

export const adaptiveSelfModifier = AdaptiveSelfModifier.getInstance();
export default adaptiveSelfModifier;
