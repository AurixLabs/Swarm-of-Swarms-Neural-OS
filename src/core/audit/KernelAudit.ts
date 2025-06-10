import { kernelRegistry } from '../KernelRegistry';
import { systemKernel } from '../SystemKernel';
import { securityKernel } from '../SecurityKernel';
import { emergentBehaviorManager } from '../emergence/EmergentBehaviorManager';
import { integrityChainVerifier } from '../security/IntegrityChainVerifier';

export interface KernelAuditResult {
  kernelId: string;
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  checks: {
    name: string;
    passed: boolean;
    details?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  metrics: {
    messageCount?: number;
    errorRate?: number;
    integrityScore?: number;
    responsiveness?: number;
    resourceUsage?: number;
  };
  integrityVerified: boolean;
  lastUpdated: number;
  recommendations: string[];
}

/**
 * KernelAudit provides a comprehensive analysis of all kernels
 * in the system, checking their health, integrity, and providing
 * recommendations for improvements.
 */
export class KernelAudit {
  private auditResults: Map<string, KernelAuditResult> = new Map();
  private lastFullAuditTime: number = 0;
  
  /**
   * Audit a specific kernel
   */
  public auditKernel(kernelId: string): KernelAuditResult {
    console.log(`Auditing kernel: ${kernelId}`);
    
    const kernel = kernelRegistry.get(kernelId);
    
    if (!kernel) {
      return {
        kernelId,
        status: 'unknown',
        checks: [{
          name: 'existence',
          passed: false,
          details: 'Kernel not found in registry',
          severity: 'critical'
        }],
        metrics: {},
        integrityVerified: false,
        lastUpdated: Date.now(),
        recommendations: ['Register kernel with the KernelRegistry']
      };
    }
    
    // Run basic health checks
    const healthChecks = this.performHealthChecks(kernelId, kernel);
    
    // Verify integrity
    const integrityResult = integrityChainVerifier.verifyComponent(kernelId);
    
    // Calculate overall status based on check results
    const criticalFailures = healthChecks.filter(c => !c.passed && c.severity === 'critical').length;
    const highFailures = healthChecks.filter(c => !c.passed && c.severity === 'high').length;
    
    let status: 'healthy' | 'degraded' | 'critical' | 'unknown' = 'healthy';
    
    if (criticalFailures > 0) {
      status = 'critical';
    } else if (highFailures > 0) {
      status = 'degraded';
    }
    
    // Generate recommendations based on failed checks
    const recommendations = this.generateRecommendations(kernelId, healthChecks);
    
    // Create final result
    const result: KernelAuditResult = {
      kernelId,
      status,
      checks: healthChecks,
      metrics: this.collectMetrics(kernelId, kernel),
      integrityVerified: integrityResult.success,
      lastUpdated: Date.now(),
      recommendations
    };
    
    // Store result
    this.auditResults.set(kernelId, result);
    
    return result;
  }
  
  /**
   * Audit all kernels in the system
   */
  public auditAllKernels(): Map<string, KernelAuditResult> {
    this.lastFullAuditTime = Date.now();
    
    // Get all kernel IDs
    const kernelIds = kernelRegistry.listKernels();
    
    // Audit each kernel
    kernelIds.forEach(id => {
      this.auditKernel(id);
    });
    
    // Also record this as an emergent pattern
    emergentBehaviorManager.analyzePattern({
      name: 'system-wide-audit',
      metrics: {
        totalKernels: kernelIds.length,
        auditDuration: Date.now() - this.lastFullAuditTime
      },
      timestamp: Date.now()
    });
    
    return this.auditResults;
  }
  
  /**
   * Get the result of the last audit for a kernel
   */
  public getLastAuditResult(kernelId: string): KernelAuditResult | undefined {
    return this.auditResults.get(kernelId);
  }
  
  /**
   * Get all audit results
   */
  public getAllAuditResults(): Map<string, KernelAuditResult> {
    return new Map(this.auditResults);
  }
  
  /**
   * Get system-wide health status summary
   */
  public getSystemHealthSummary(): {
    overallStatus: 'healthy' | 'degraded' | 'critical' | 'unknown';
    kernelCount: number;
    healthyCount: number;
    degradedCount: number;
    criticalCount: number;
    unknownCount: number;
    lastAuditTime: number;
  } {
    const kernelIds = kernelRegistry.listKernels();
    const results = Array.from(this.auditResults.values());
    
    const healthyCount = results.filter(r => r.status === 'healthy').length;
    const degradedCount = results.filter(r => r.status === 'degraded').length;
    const criticalCount = results.filter(r => r.status === 'critical').length;
    const unknownCount = kernelIds.length - results.length;
    
    let overallStatus: 'healthy' | 'degraded' | 'critical' | 'unknown' = 'healthy';
    
    if (criticalCount > 0) {
      overallStatus = 'critical';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    } else if (unknownCount > 0) {
      overallStatus = 'unknown';
    }
    
    return {
      overallStatus,
      kernelCount: kernelIds.length,
      healthyCount,
      degradedCount,
      criticalCount,
      unknownCount,
      lastAuditTime: this.lastFullAuditTime
    };
  }
  
  /**
   * Perform health checks on a kernel
   */
  private performHealthChecks(kernelId: string, kernel: any): {
    name: string;
    passed: boolean;
    details?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[] {
    const checks = [];
    
    // Check for events property (most kernels have this)
    checks.push({
      name: 'events-subsystem',
      passed: !!kernel.events,
      details: kernel.events ? 'Events subsystem present' : 'Events subsystem missing',
      severity: 'high'
    });
    
    // Check for getState/setState methods (common in system kernels)
    const hasStateAPI = typeof kernel.getState === 'function' && typeof kernel.setState === 'function';
    checks.push({
      name: 'state-management',
      passed: hasStateAPI,
      details: hasStateAPI ? 'State API available' : 'State API missing',
      severity: 'medium'
    });
    
    // Check for broadcast/subscribe methods (from UniversalKernel)
    const hasCommunicationAPI = typeof kernel.broadcast === 'function' && typeof kernel.subscribe === 'function';
    checks.push({
      name: 'communication-api',
      passed: hasCommunicationAPI,
      details: hasCommunicationAPI ? 'Communication API available' : 'Communication API missing',
      severity: 'medium'
    });
    
    // Special checks for specific kernels
    switch (kernelId) {
      case 'system':
        // Check for critical system kernel features
        checks.push({
          name: 'plugin-registry',
          passed: !!kernel.pluginRegistry,
          details: kernel.pluginRegistry ? 'Plugin registry available' : 'Plugin registry missing',
          severity: 'high'
        });
        break;
        
      case 'security':
        // Check security kernel specific features
        checks.push({
          name: 'integrity-verification',
          passed: typeof kernel.verifySystemIntegrity === 'function',
          details: typeof kernel.verifySystemIntegrity === 'function' 
            ? 'Integrity verification available' 
            : 'Integrity verification missing',
          severity: 'critical'
        });
        break;
        
      case 'ai':
        // Check AI kernel specific features
        checks.push({
          name: 'intent-detection',
          passed: typeof kernel.detectIntent === 'function',
          details: typeof kernel.detectIntent === 'function'
            ? 'Intent detection available'
            : 'Intent detection missing',
          severity: 'high'
        });
        break;
        
      case 'memory':
        // Check memory kernel specific features
        checks.push({
          name: 'memory-storage',
          passed: typeof kernel.storeMemory === 'function',
          details: typeof kernel.storeMemory === 'function'
            ? 'Memory storage available'
            : 'Memory storage missing',
          severity: 'high'
        });
        break;
    }
    
    return checks;
  }
  
  /**
   * Collect metrics for a kernel
   */
  private collectMetrics(kernelId: string, kernel: any): {
    messageCount?: number;
    errorRate?: number;
    integrityScore?: number;
    responsiveness?: number;
    resourceUsage?: number;
  } {
    // In a real implementation, this would collect actual metrics
    // For now, we'll return placeholder values
    
    // Try to get metrics from kernel if available
    let metrics = {};
    if (typeof kernel.getMetrics === 'function') {
      try {
        metrics = kernel.getMetrics() || {};
      } catch (error) {
        console.warn(`Failed to get metrics from kernel ${kernelId}:`, error);
      }
    }
    
    // Default metrics
    return {
      integrityScore: 100, // placeholder
      responsiveness: 100, // placeholder
      resourceUsage: 10,   // placeholder
      ...metrics
    };
  }
  
  /**
   * Generate recommendations based on health check results
   */
  private generateRecommendations(kernelId: string, checks: {
    name: string;
    passed: boolean;
    details?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[]): string[] {
    const recommendations: string[] = [];
    const failedChecks = checks.filter(c => !c.passed);
    
    if (failedChecks.length === 0) {
      recommendations.push(`${kernelId} kernel is healthy. No immediate actions needed.`);
      return recommendations;
    }
    
    // Generate recommendations based on failed checks
    failedChecks.forEach(check => {
      switch (check.name) {
        case 'events-subsystem':
          recommendations.push(`Implement an event system in the ${kernelId} kernel.`);
          break;
          
        case 'state-management':
          recommendations.push(`Add getState/setState methods to the ${kernelId} kernel.`);
          break;
          
        case 'communication-api':
          recommendations.push(`Implement broadcast/subscribe methods in the ${kernelId} kernel.`);
          break;
          
        case 'plugin-registry':
          recommendations.push('Implement a plugin registry for extensibility.');
          break;
          
        case 'integrity-verification':
          recommendations.push('Add system integrity verification capabilities.');
          break;
          
        case 'intent-detection':
          recommendations.push('Implement intent detection in the AI kernel.');
          break;
          
        case 'memory-storage':
          recommendations.push('Add memory storage capabilities to the memory kernel.');
          break;
          
        default:
          recommendations.push(`Address the failed check: ${check.name}`);
      }
    });
    
    // Add kernel-specific recommendations
    switch (kernelId) {
      case 'system':
        recommendations.push('Consider implementing a health monitoring system.');
        break;
        
      case 'security':
        recommendations.push('Enhance security policies and access control.');
        break;
        
      case 'ai':
        recommendations.push('Improve intent recognition accuracy and response generation.');
        break;
        
      case 'ui':
        recommendations.push('Add support for dynamic UI components and layouts.');
        break;
        
      case 'memory':
        recommendations.push('Implement advanced memory retrieval capabilities with semantic search.');
        break;
        
      case 'philosophical':
        recommendations.push('Enhance ethical reasoning capabilities and cognitive frameworks.');
        break;
    }
    
    return recommendations;
  }
}

// Create a singleton instance
export const kernelAudit = new KernelAudit();
