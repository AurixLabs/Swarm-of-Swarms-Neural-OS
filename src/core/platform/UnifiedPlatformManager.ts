import { wasmModuleManager } from '@/core/wasm/WASMModuleManager';

export type PlatformServiceName =
  | 'wasm'
  | 'system_kernel'
  | 'ai_kernel'
  | 'neuromorphic'
  | 'database'
  | 'auth'
  | 'memory_kernel'
  | 'ethics_kernel'
  | 'collaborative_kernel'
  | 'security_kernel'
  | 'regulatory_kernel';

interface ServiceStatus {
  name: PlatformServiceName;
  status: 'online' | 'offline' | 'degraded';
}

class UnifiedPlatformManager {
  private static instance: UnifiedPlatformManager;
  private initialized: boolean = false;
  private serviceStatuses: Map<PlatformServiceName, ServiceStatus> = new Map();

  private constructor() {
    this.CORE_SERVICES.forEach(serviceName => {
      this.serviceStatuses.set(serviceName, { name: serviceName, status: 'offline' });
    });
  }

  public static getInstance(): UnifiedPlatformManager {
    if (!UnifiedPlatformManager.instance) {
      UnifiedPlatformManager.instance = new UnifiedPlatformManager();
    }
    return UnifiedPlatformManager.instance;
  }

  private readonly CORE_SERVICES: PlatformServiceName[] = [
    'wasm',
    'system_kernel',
    'ai_kernel', 
    'memory_kernel',
    'ethics_kernel',
    'collaborative_kernel',
    'security_kernel',
    'regulatory_kernel',
    'neuromorphic',
    'database',
    'auth'
  ];

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('UnifiedPlatformManager already initialized');
      return;
    }

    console.log('⚙️ Initializing Unified Platform Manager...');
    
    try {
      // Initialize WASM module manager first
      await wasmModuleManager.initializeAllModules();
      console.log('✅ WASM Module Manager initialized');
      
      // Check all core services
      await Promise.all(this.CORE_SERVICES.map(service => this.checkService(service)));
      console.log('✅ All core services checked');

      this.initialized = true;
      console.log('✅ Unified Platform Manager initialized successfully');
    } catch (error) {
      console.error('❌ Unified Platform Manager initialization failed:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getAllServiceStatuses(): ServiceStatus[] {
    return Array.from(this.serviceStatuses.values());
  }

  getServiceStatus(serviceName: PlatformServiceName): ServiceStatus | undefined {
    return this.serviceStatuses.get(serviceName);
  }

  private updateServiceStatus(serviceName: PlatformServiceName, status: 'online' | 'offline' | 'degraded'): void {
    const currentStatus = this.serviceStatuses.get(serviceName);
    if (currentStatus) {
      currentStatus.status = status;
      this.serviceStatuses.set(serviceName, currentStatus);
    } else {
      console.warn(`Service ${serviceName} not found in status map`);
    }
  }

  async checkService(serviceName: PlatformServiceName): Promise<boolean> {
    try {
      switch (serviceName) {
        case 'wasm':
          return this.checkWASMService();
        
        case 'system_kernel':
        case 'ai_kernel':
        case 'memory_kernel':
        case 'ethics_kernel':
        case 'collaborative_kernel':
        case 'security_kernel':
        case 'regulatory_kernel':
        case 'neuromorphic':
          return this.checkWASMKernel(serviceName);
          
        case 'database':
          return this.checkDatabaseService();
          
        case 'auth':
          return this.checkAuthService();
          
        default:
          console.warn(`Unknown service: ${serviceName}`);
          return false;
      }
    } catch (error) {
      console.error(`Service check failed for ${serviceName}:`, error);
      this.updateServiceStatus(serviceName, 'offline');
      return false;
    }
  }

  private async checkWASMService(): Promise<boolean> {
    try {
      // Check if WASM modules are generally available
      const wasmTest = await import('@/core/wasm/wasmTest');
      const isWasmAvailable = await wasmTest.testWasm();
      
      this.updateServiceStatus('wasm', isWasmAvailable ? 'online' : 'offline');
      return isWasmAvailable;
    } catch (error) {
      console.error('WASM service check failed:', error);
      this.updateServiceStatus('wasm', 'offline');
      return false;
    }
  }

  private async checkWASMKernel(kernelName: string): Promise<boolean> {
    try {
      const kernelStatuses = wasmModuleManager.getAllKernelStatuses();
      const kernelStatus = kernelStatuses.find(k => 
        k.name === kernelName || 
        k.name.includes(kernelName.replace('_kernel', ''))
      );
      
      const isHealthy = kernelStatus?.loaded || false;
      this.updateServiceStatus(kernelName as PlatformServiceName, isHealthy ? 'online' : 'offline');
      return isHealthy;
    } catch (error) {
      console.error(`WASM kernel check failed for ${kernelName}:`, error);
      this.updateServiceStatus(kernelName as PlatformServiceName, 'offline');
      return false;
    }
  }

  private async checkDatabaseService(): Promise<boolean> {
    // Placeholder for database check logic
    const isDatabaseOnline = true;
    this.updateServiceStatus('database', isDatabaseOnline ? 'online' : 'offline');
    return isDatabaseOnline;
  }

  private async checkAuthService(): Promise<boolean> {
    // Placeholder for auth service check logic
    const isAuthOnline = true;
    this.updateServiceStatus('auth', isAuthOnline ? 'online' : 'offline');
    return isAuthOnline;
  }
}

export const unifiedPlatformManager = UnifiedPlatformManager.getInstance();

console.log('⚙️ Unified Platform Manager - Centralized service coordination');
