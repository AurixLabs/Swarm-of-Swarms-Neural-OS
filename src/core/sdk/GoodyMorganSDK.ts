
// Re-export types and registry for easy importing
export { SDKAppRegistry, type SDKAppManifest, type GoodyMorganSDKApp } from './SDKAppRegistry';

// Hook for using the SDK
import { useState, useEffect } from 'react';
import { SDKAppRegistry, type GoodyMorganSDKApp } from './SDKAppRegistry';

export function useGoodyMorganSDK() {
  const [registry] = useState(() => new SDKAppRegistry());
  const [apps, setApps] = useState<GoodyMorganSDKApp[]>([]);

  useEffect(() => {
    setApps(registry.getInstalledApps());
  }, [registry]);

  const installApp = (app: GoodyMorganSDKApp) => {
    if (registry.installApp(app)) {
      setApps(registry.getInstalledApps());
      return true;
    }
    return false;
  };

  const uninstallApp = (appId: string) => {
    if (registry.uninstallApp(appId)) {
      setApps(registry.getInstalledApps());
      return true;
    }
    return false;
  };

  return {
    apps,
    installApp,
    uninstallApp,
    registry
  };
}
