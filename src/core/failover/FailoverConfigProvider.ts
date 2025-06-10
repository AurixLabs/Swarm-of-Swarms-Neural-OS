
export class FailoverConfigProvider {
  private static instance: FailoverConfigProvider;
  private failoverMap = new Map<string, string[]>();

  private constructor() {
    this.initializeFailoverMap();
  }

  public static getInstance(): FailoverConfigProvider {
    if (!this.instance) {
      this.instance = new FailoverConfigProvider();
    }
    return this.instance;
  }

  private initializeFailoverMap(): void {
    this.failoverMap.set('ai', ['system', 'memory']);
    this.failoverMap.set('memory', ['ai', 'system']);
    this.failoverMap.set('system', ['ai']);
  }

  public getBackupKernels(kernelId: string): string[] {
    return this.failoverMap.get(kernelId) || [];
  }
}

export const failoverConfig = FailoverConfigProvider.getInstance();
