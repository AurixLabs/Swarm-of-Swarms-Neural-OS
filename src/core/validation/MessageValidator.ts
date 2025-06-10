
/**
 * Message Validator
 * 
 * Validates messages between kernels to ensure they follow
 * the correct structure and contain required fields.
 */
export interface KernelMessage {
  type: string;
  source: string;
  target?: string;
  payload: any;
  timestamp: number;
  id: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  authenticated?: boolean;
}

export class MessageValidator {
  private static requiredFields = ['type', 'source', 'payload', 'timestamp', 'id'];
  
  /**
   * Validate a message structure
   */
  public static validateMessage(message: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for required fields
    for (const field of this.requiredFields) {
      if (message[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Check timestamp is a valid number
    if (typeof message.timestamp !== 'number') {
      errors.push('Timestamp must be a number');
    }
    
    // Verify payload exists
    if (message.payload === null) {
      errors.push('Payload cannot be null');
    }
    
    // Verify type format (namespace:action)
    if (typeof message.type === 'string' && !message.type.includes(':')) {
      errors.push('Message type should follow format "namespace:action"');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Create a valid message from partial data
   */
  public static createMessage(partial: Partial<KernelMessage>): KernelMessage {
    return {
      type: partial.type || 'unknown:event',
      source: partial.source || 'unknown',
      target: partial.target,
      payload: partial.payload || {},
      timestamp: partial.timestamp || Date.now(),
      id: partial.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      priority: partial.priority || 'normal',
      authenticated: partial.authenticated || false
    };
  }
}
