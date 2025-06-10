
import { UniversalKernel } from '../UniversalKernel';
import { EventData } from '../events/EventSystem';

export interface SecurityThreat {
  id: string;
  type: 'unauthorized_access' | 'data_breach' | 'malware' | 'phishing' | 'ddos';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: number;
  description: string;
  mitigated: boolean;
}

export interface SecurityMetrics {
  threatsDetected: number;
  threatsMitigated: number;
  securityScore: number;
  lastScan: number;
  activeThreats: SecurityThreat[];
}

export class SecurityKernel extends UniversalKernel {
  private threats: SecurityThreat[] = [];
  private securityScore = 100;
  private lastScan = Date.now();

  constructor() {
    super('security', 'Security Kernel', 'Manages system security and threat detection');
    this.initialize();
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🛡️ SecurityKernel: Initializing security systems...');
      
      // Initialize security monitoring
      this.setState('security_enabled', 'true');
      this.setState('threat_monitoring', 'active');
      this.setState('last_security_scan', Date.now().toString());
      
      // Start periodic security scans
      this.startSecurityMonitoring();
      
      console.log('✅ SecurityKernel: Security systems operational');
      return true;
    } catch (error) {
      console.error('❌ SecurityKernel: Failed to initialize', error);
      return false;
    }
  }

  detectThreat(type: SecurityThreat['type'], source: string, description: string, severity: SecurityThreat['severity'] = 'medium'): void {
    const threat: SecurityThreat = {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      source,
      timestamp: Date.now(),
      description,
      mitigated: false
    };

    this.threats.push(threat);
    this.updateSecurityScore();
    
    console.log(`🚨 SecurityKernel: Threat detected - ${severity.toUpperCase()}: ${description}`);
    
    // Emit security event
    this.emit('security:threat:detected', { threat });
    
    // Auto-mitigate low severity threats
    if (severity === 'low') {
      this.mitigateThreat(threat.id);
    }
  }

  mitigateThreat(threatId: string): boolean {
    const threat = this.threats.find(t => t.id === threatId);
    if (!threat) return false;

    threat.mitigated = true;
    this.updateSecurityScore();
    
    console.log(`✅ SecurityKernel: Threat mitigated - ${threat.description}`);
    this.emit('security:threat:mitigated', { threat });
    
    return true;
  }

  getSecurityMetrics(): SecurityMetrics {
    const activeThreats = this.threats.filter(t => !t.mitigated);
    
    return {
      threatsDetected: this.threats.length,
      threatsMitigated: this.threats.filter(t => t.mitigated).length,
      securityScore: this.securityScore,
      lastScan: this.lastScan,
      activeThreats
    };
  }

  performSecurityScan(): void {
    console.log('🔍 SecurityKernel: Performing security scan...');
    this.lastScan = Date.now();
    this.setState('last_security_scan', this.lastScan.toString());
    
    // Simulate threat detection during scan
    const randomCheck = Math.random();
    if (randomCheck < 0.1) { // 10% chance of detecting a threat
      this.detectThreat(
        'unauthorized_access',
        'system_scan',
        'Suspicious access pattern detected during security scan',
        'low'
      );
    }
    
    this.emit('security:scan:completed', { 
      timestamp: this.lastScan,
      threatsFound: randomCheck < 0.1 ? 1 : 0
    });
  }

  private startSecurityMonitoring(): void {
    // Perform security scans every 30 seconds
    setInterval(() => {
      this.performSecurityScan();
    }, 30000);
  }

  private updateSecurityScore(): void {
    const activeThreats = this.threats.filter(t => !t.mitigated);
    const criticalThreats = activeThreats.filter(t => t.severity === 'critical').length;
    const highThreats = activeThreats.filter(t => t.severity === 'high').length;
    const mediumThreats = activeThreats.filter(t => t.severity === 'medium').length;
    
    // Calculate security score based on active threats
    let score = 100;
    score -= criticalThreats * 30;
    score -= highThreats * 20;
    score -= mediumThreats * 10;
    
    this.securityScore = Math.max(0, score);
    this.setState('security_score', this.securityScore.toString());
  }

  protected handleEvent(event: EventData): void {
    // Handle security-related events from other kernels
    switch (event.type) {
      case 'system:error':
        this.detectThreat('malware', 'system_kernel', 'System error detected - potential security issue', 'medium');
        break;
      case 'unauthorized_access_attempt':
        this.detectThreat('unauthorized_access', event.source || 'unknown', 'Unauthorized access attempt', 'high');
        break;
      default:
        break;
    }
  }

  getKernelHealth() {
    const metrics = this.getSecurityMetrics();
    const status = metrics.securityScore >= 80 ? 'healthy' : 
                  metrics.securityScore >= 60 ? 'degraded' : 'critical';
    
    return {
      status,
      score: metrics.securityScore,
      activeThreats: metrics.activeThreats.length,
      lastScan: metrics.lastScan
    };
  }
}

// Export singleton instance
export const securityKernel = new SecurityKernel();
export default securityKernel;
