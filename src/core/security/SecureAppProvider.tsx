
import React, { useEffect, ReactNode } from 'react';
import { securityKernel } from '@/core/SecurityKernel';
import { securityBridge } from '@/core/security/SecurityBridge';
import { toast } from 'sonner';

// Add the missing setCurrentUser method to SecurityBridge
// This is a temporary fix until we can properly update SecurityBridge
declare module '@/core/security/SecurityBridge' {
  interface SecurityBridge {
    setCurrentUser(user: string | null): void;
  }
}

interface SecureAppProviderProps {
  children: ReactNode;
}

export function SecureAppProvider({ children }: SecureAppProviderProps) {
  useEffect(() => {
    console.log('Initializing security monitoring...');
    
    // Set current user if the method exists
    if (typeof securityBridge.setCurrentUser === 'function') {
      securityBridge.setCurrentUser('owner');
    } else {
      console.warn('securityBridge.setCurrentUser is not available');
    }
    
    securityKernel.initializeSecurityMonitoring();
    
    toast.success('Security monitoring initialized', {
      description: 'System integrity protection is active',
      duration: 3000,
    });
    
    return () => {
      if (typeof securityBridge.setCurrentUser === 'function') {
        securityBridge.setCurrentUser(null);
      }
      securityKernel.disableIntegrityMonitoring();
    };
  }, []);

  return (
    <div className="secure-app-container">
      {children}
    </div>
  );
}
