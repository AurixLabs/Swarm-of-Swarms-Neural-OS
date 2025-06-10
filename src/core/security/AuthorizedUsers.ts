
/**
 * Authorized Users
 * 
 * This file manages the list of users authorized to make system modifications.
 */

export enum AccessLevel {
  OWNER = 'owner',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  VIEWER = 'viewer'
}

export enum SystemPermission {
  ALL = '*',
  MODIFY_SYSTEM = 'modify-system',
  ACCESS_SECURITY = 'access-security',
  MONITOR_INTEGRITY = 'monitor-integrity',
  VIEW_AUDIT = 'view-audit',
  MODIFY_ETHICS = 'modify-ethics'
}

export interface AuthorizedUser {
  id: string;
  name: string;
  accessLevel: AccessLevel;
  permissions: SystemPermission[];
}

// In a real application, this would be stored securely
// and managed through an access control system
const authorizedUsers: Record<string, AuthorizedUser> = {
  [AccessLevel.OWNER]: {
    id: AccessLevel.OWNER,
    name: 'System Owner',
    accessLevel: AccessLevel.OWNER,
    permissions: [SystemPermission.ALL] // All permissions
  },
  'system': {
    id: 'system',
    name: 'System Process',
    accessLevel: AccessLevel.ADMIN,
    permissions: [
      SystemPermission.MODIFY_SYSTEM, 
      SystemPermission.ACCESS_SECURITY,
      SystemPermission.MONITOR_INTEGRITY
    ]
  }
};

/**
 * Check if a user is authorized
 */
export const isAuthorizedUser = (userId: string): boolean => {
  return !!authorizedUsers[userId];
};

/**
 * Get authorized user information
 */
export const getAuthorizedUser = (userId: string): AuthorizedUser | null => {
  return authorizedUsers[userId] || null;
};

/**
 * Check if a user has specific permission
 */
export const hasPermission = (userId: string, permission: SystemPermission): boolean => {
  const user = authorizedUsers[userId];
  if (!user) return false;
  
  // Owner has all permissions
  if (user.accessLevel === AccessLevel.OWNER) return true;
  
  // Check specific permission
  return user.permissions.includes(permission) || user.permissions.includes(SystemPermission.ALL);
};
