/**
 * SystemModificationGuard
 * 
 * Provides a security layer that prevents unauthorized system modifications.
 */

import { securityBridge } from './SecurityBridge';
import { isAuthorizedUser, getAuthorizedUser } from './AuthorizedUsers';

class SystemModificationGuard {
  private isInitialized: boolean = false;
  private currentUserId: string | null = null;
  private modificationAttempts: Array<{timestamp: number, userId: string | null, action: string, allowed: boolean}> = [];
  
  constructor() {
    this.initialize();
  }
  
  private initialize(): void {
    if (this.isInitialized) return;
    
    // Register with security bridge
    securityBridge.registerComponent('system-modification-guard', 'security');
    
    // Report initialization
    securityBridge.report({
      severity: 'info',
      source: 'SystemModificationGuard',
      message: 'System modification guard initialized'
    });
    
    this.isInitialized = true;
  }
  
  /**
   * Set the current user ID
   */
  public setCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
    
    const userInfo = userId ? getAuthorizedUser(userId) : null;
    
    securityBridge.report({
      severity: 'info',
      source: 'SystemModificationGuard',
      message: userInfo 
        ? `User set to ${userInfo.name} (${userInfo.accessLevel})`
        : 'User cleared'
    });
  }
  
  /**
   * Check if the current user can modify the system
   */
  public canModifySystem(): boolean {
    // If no user is set, deny by default
    if (!this.currentUserId) {
      this.recordAttempt('check-modification-permission', false);
      return false;
    }
    
    const isAuthorized = isAuthorizedUser(this.currentUserId);
    this.recordAttempt('check-modification-permission', isAuthorized);
    
    return isAuthorized;
  }
  
  /**
   * Request permission to perform a system modification
   */
  public requestModificationPermission(action: string): boolean {
    const isAuthorized = this.canModifySystem();
    
    if (!isAuthorized) {
      securityBridge.report({
        severity: 'warning',
        source: 'SystemModificationGuard',
        message: `Unauthorized modification attempt: ${action}`,
        context: { userId: this.currentUserId }
      });
    }
    
    this.recordAttempt(action, isAuthorized);
    return isAuthorized;
  }
  
  /**
   * Record a modification attempt
   */
  private recordAttempt(action: string, allowed: boolean): void {
    this.modificationAttempts.push({
      timestamp: Date.now(),
      userId: this.currentUserId,
      action,
      allowed
    });
    
    // Keep only the last 1000 attempts
    if (this.modificationAttempts.length > 1000) {
      this.modificationAttempts = this.modificationAttempts.slice(-1000);
    }
  }
  
  /**
   * Get recent modification attempts
   */
  public getModificationAttempts(count: number = 100): Array<{timestamp: number, userId: string | null, action: string, allowed: boolean}> {
    return this.modificationAttempts.slice(-count);
  }
  
  /**
   * Report unauthorized access attempt
   */
  public reportUnauthorizedAttempt(action: string, details: any): void {
    securityBridge.report({
      severity: 'critical',
      source: 'SystemModificationGuard',
      message: `SECURITY ALERT: Unauthorized system modification attempt: ${action}`,
      context: { details, userId: this.currentUserId }
    });
    
    this.recordAttempt(action, false);
  }
}

// Export a singleton instance
export const systemModificationGuard = new SystemModificationGuard();
