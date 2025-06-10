
// Core SDK App Registry - centralized app management
export interface SDKAppManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    email?: string;
  };
  capabilities: string[];
  tags: string[];
  icon?: string;
  primaryColor?: string;
}

export interface GoodyMorganSDKApp {
  manifest: SDKAppManifest;
  isInstalled: boolean;
  installDate?: Date;
}

export class SDKAppRegistry {
  private installedApps: GoodyMorganSDKApp[] = [];

  constructor() {
    // Initialize with some sample apps for demo
    this.installedApps = [
      {
        manifest: {
          id: 'neural-enhancer',
          name: 'Neural Enhancer',
          version: '1.0.0',
          description: 'Advanced neural processing for the AI Kernel',
          author: { name: 'CognitiveApps Inc.' },
          capabilities: ['ai-enhancement', 'neural-processing'],
          tags: ['ai', 'intelligence', 'neural'],
          primaryColor: '#3B82F6'
        },
        isInstalled: true,
        installDate: new Date()
      },
      {
        manifest: {
          id: 'secure-vault',
          name: 'Secure Vault',
          version: '2.1.0',
          description: 'Enhanced security protocols for sensitive data',
          author: { name: 'SecureAI Solutions' },
          capabilities: ['security-enhancement', 'data-encryption'],
          tags: ['security', 'encryption', 'protection'],
          primaryColor: '#10B981'
        },
        isInstalled: true,
        installDate: new Date()
      }
    ];
  }

  getInstalledApps(): GoodyMorganSDKApp[] {
    return this.installedApps;
  }

  installApp(app: GoodyMorganSDKApp): boolean {
    if (!this.installedApps.find(installed => installed.manifest.id === app.manifest.id)) {
      this.installedApps.push({ ...app, isInstalled: true, installDate: new Date() });
      return true;
    }
    return false;
  }

  uninstallApp(appId: string): boolean {
    const index = this.installedApps.findIndex(app => app.manifest.id === appId);
    if (index > -1) {
      this.installedApps.splice(index, 1);
      return true;
    }
    return false;
  }
}
