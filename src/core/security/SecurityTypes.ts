
/**
 * Security Types Extension
 * 
 * This file extends the existing security types with authorization-specific types.
 */

// Authorization event types
export type AuthorizationEventType = 
  | 'AUTHORIZATION_ATTEMPTED'
  | 'AUTHORIZATION_GRANTED'
  | 'AUTHORIZATION_DENIED'
  | 'AUTHORIZATION_REVOKED'
  | 'UNAUTHORIZED_MODIFICATION_ATTEMPTED';

// Authorization event
export interface AuthorizationEvent {
  type: AuthorizationEventType;
  userId: string | null;
  action: string;
  timestamp: number;
  result: boolean;
  details?: any;
}

// Authorized action types
export type SystemAction =
  | 'modify-system-settings'
  | 'update-security-policy'
  | 'manage-users'
  | 'access-logs'
  | 'deploy-code'
  | 'modify-kernel'
  | 'change-system-state'
  | string; // Allow for extensibility
