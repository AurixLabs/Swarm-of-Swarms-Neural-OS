
import { SecurityManager } from './SecurityManager';

/**
 * Security validator for regulatory kernel
 */
export class SecurityValidator {
  private securityManager: SecurityManager;
  
  constructor(securityManager: SecurityManager) {
    this.securityManager = securityManager;
  }
  
  /**
   * Validate operation
   */
  validateOperation(operation: any): boolean {
    return this.securityManager.isOperationAllowed(operation);
  }
}
