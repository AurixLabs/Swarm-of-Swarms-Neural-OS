
import { Module } from '@/core/UniversalKernel';
import { RegulatoryKernel } from './RegulatoryKernel';
import { systemKernel } from '@/core/SystemKernel';
import { verifyEthicsPolicyIntegrity, getImmutableEthicsPolicies } from '../ethics/ImmutableEthicsPolicy';
import { verifyEthicsSystemIntegrity } from '@/lib/ai/utils/sovereigntyGuard';
import * as crypto from 'crypto-js';

/**
 * Ethics Monitor Module
 * 
 * This module provides continuous runtime monitoring of the ethics subsystems.
 * It performs integrity checks at regular intervals and responds to attempts
 * to modify or disable ethical constraints.
 */
export class EthicsMonitorModule implements Module {
  public id = 'ethics-monitor';
  public name = 'Ethics Integrity Monitor';
  public version = '1.0.0';
  
  private intervalId: number | null = null;
  private lastHealthState: boolean = true;
  private verificationCounter: number = 0;
  private kernel: RegulatoryKernel | null = null;
  
  // Timing jitter - make timing attacks harder by varying check intervals
  private getNextInterval(): number {
    // Base interval with random jitter
    return 30000 + Math.floor(Math.random() * 15000);
  }
  
  // Modified to accept UniversalKernel but validate it's a RegulatoryKernel
  public initialize(kernel: any): void {
    if (!(kernel instanceof RegulatoryKernel)) {
      console.error('Ethics Monitor requires a RegulatoryKernel');
      systemKernel.events.emitEvent({
        type: 'SECURITY_ALERT',
        payload: {
          severity: 'critical',
          source: 'ethics_monitor',
          message: 'Attempted to initialize Ethics Monitor with invalid kernel type'
        }
      });
      return;
    }
    
    this.kernel = kernel;
    console.log('Ethics Monitor initialized');
    
    // Register for ethics violation events
    systemKernel.events.onEvent('ETHICS_VIOLATION_DETECTED', this.handleEthicsViolation);
    systemKernel.events.onEvent('ETHICS_POLICY_VIOLATION', this.handlePolicyViolation);
    
    // Start integrity monitoring with unpredictable timing
    this.startIntegrityMonitoring();
  }
  
  private startIntegrityMonitoring(): void {
    // Initial check
    this.performIntegrityCheck();
    
    // Set up recurring checks with varying intervals
    const scheduleNext = () => {
      const nextInterval = this.getNextInterval();
      setTimeout(() => {
        this.performIntegrityCheck();
        scheduleNext();
      }, nextInterval);
    };
    
    scheduleNext();
  }
  
  private performIntegrityCheck(): void {
    this.verificationCounter++;
    
    // Perform integrity checks on multiple systems
    const policyIntegrity = verifyEthicsPolicyIntegrity();
    const systemIntegrity = verifyEthicsSystemIntegrity();
    
    // Combined health check
    const systemHealthy = policyIntegrity && systemIntegrity;
    
    // If state changed, emit event
    if (systemHealthy !== this.lastHealthState) {
      this.lastHealthState = systemHealthy;
      
      if (!systemHealthy) {
        // Critical integrity failure
        this.reportCriticalIntegrityFailure(policyIntegrity, systemIntegrity);
      } else {
        // System recovered
        this.kernel?.setState('ethics:systemStatus', 'healthy');
        console.log('Ethics system integrity restored');
      }
    }
    
    // For added security, periodically emit health status even if unchanged
    if (this.verificationCounter % 5 === 0) {
      this.kernel?.setState('ethics:lastCheck', {
        timestamp: Date.now(),
        status: systemHealthy ? 'healthy' : 'compromised',
        policiesVerified: getImmutableEthicsPolicies().length
      });
    }
  }
  
  private reportCriticalIntegrityFailure(policyIntegrity: boolean, systemIntegrity: boolean): void {
    const failureReport = {
      timestamp: Date.now(),
      policyIntegrityPassed: policyIntegrity,
      systemIntegrityPassed: systemIntegrity,
      verificationCounter: this.verificationCounter,
      verificationHash: crypto.SHA256(Date.now().toString()).toString()
    };
    
    // Log with high visibility
    console.error('CRITICAL: Ethics system integrity check failed', failureReport);
    
    // Update kernel state
    this.kernel?.setState('ethics:systemStatus', 'compromised');
    this.kernel?.setState('ethics:failureReport', failureReport);
    
    // Emit high-priority event
    systemKernel.events.emitEvent({
      type: 'SECURITY_ALERT',
      payload: {
        severity: 'critical',
        source: 'ethics_monitor',
        message: 'Ethics system integrity violation detected',
        details: failureReport
      }
    });
    
    // Take protective actions
    systemKernel.enterSafeMode();
  }
  
  private handleEthicsViolation = (payload: any): void => {
    // Log ethics violations
    console.warn('Ethics violation detected', payload);
    
    // Update statistics
    if (this.kernel) {
      const currentStats = this.kernel.getState<Record<string, number>>('ethics:violationStats') || {};
      const topic = payload.topic || 'unknown';
      
      currentStats[topic] = (currentStats[topic] || 0) + 1;
      this.kernel.setState('ethics:violationStats', currentStats);
      this.kernel.setState('ethics:lastViolation', {
        timestamp: Date.now(),
        topic: payload.topic,
        severity: payload.severity
      });
    }
  };
  
  private handlePolicyViolation = (payload: any): void => {
    // Update policy violation tracking
    if (this.kernel) {
      const policyStats = this.kernel.getState<Record<string, any>>('ethics:policyStats') || {};
      const policyId = payload.policyId || 'unknown';
      
      if (!policyStats[policyId]) {
        policyStats[policyId] = {
          count: 0,
          lastViolation: null,
          policyName: payload.policyName || 'Unknown Policy'
        };
      }
      
      policyStats[policyId].count++;
      policyStats[policyId].lastViolation = Date.now();
      
      this.kernel.setState('ethics:policyStats', policyStats);
    }
  };
  
  public destroy(): void {
    // Clean up event listeners
    systemKernel.events.off('ETHICS_VIOLATION_DETECTED', this.handleEthicsViolation);
    systemKernel.events.off('ETHICS_POLICY_VIOLATION', this.handlePolicyViolation);
    
    console.log('Ethics Monitor destroyed');
  }
}
