
// Basic Resource Manager for CMA Neural OS

export interface ResourceAllocation {
  kernelId: string;
  priority: number;
  memoryMB: number;
  cpuPercent: number;
  allocatedAt: number;
}

export interface ResourceMetrics {
  totalMemoryMB: number;
  usedMemoryMB: number;
  totalCpuPercent: number;
  usedCpuPercent: number;
  kernelCount: number;
}

export class ResourceManager {
  private static instance: ResourceManager;
  private allocations: Map<string, ResourceAllocation> = new Map();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🔧 Resource Manager - Initializing for CMA Neural OS...');
    this.isInitialized = true;
    console.log('✅ Resource Manager - Ready');
  }

  allocateResources(
    kernelId: string, 
    priority: number, 
    memoryMB: number, 
    cpuPercent: number
  ): boolean {
    try {
      const allocation: ResourceAllocation = {
        kernelId,
        priority,
        memoryMB,
        cpuPercent,
        allocatedAt: Date.now()
      };

      this.allocations.set(kernelId, allocation);
      console.log(`✅ Resources allocated for ${kernelId}: ${memoryMB}MB, ${cpuPercent}% CPU`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to allocate resources for ${kernelId}:`, error);
      return false;
    }
  }

  getAllocations(): ResourceAllocation[] {
    return Array.from(this.allocations.values());
  }

  getMetrics(): ResourceMetrics {
    const allocations = this.getAllocations();
    
    return {
      totalMemoryMB: 1024, // Mock total
      usedMemoryMB: allocations.reduce((sum, alloc) => sum + alloc.memoryMB, 0),
      totalCpuPercent: 100,
      usedCpuPercent: allocations.reduce((sum, alloc) => sum + alloc.cpuPercent, 0),
      kernelCount: allocations.length
    };
  }

  isKernelOverloaded(kernelId: string): boolean {
    const allocation = this.allocations.get(kernelId);
    if (!allocation) return false;
    
    // Simple overload check
    return allocation.memoryMB > 256 || allocation.cpuPercent > 80;
  }

  deallocateResources(kernelId: string): void {
    this.allocations.delete(kernelId);
    console.log(`🗑️ Resources deallocated for ${kernelId}`);
  }

  clearAll(): void {
    this.allocations.clear();
    console.log('🧹 All resource allocations cleared');
  }
}

export const resourceManager = ResourceManager.getInstance();

console.log('⚡ Resource Manager - CMA Neural OS ready');
