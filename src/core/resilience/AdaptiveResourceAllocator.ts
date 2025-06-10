
import { BrowserEventEmitter } from '../events/BrowserEventEmitter';

export interface ResourceAllocation {
  kernelId: string;
  cpu: number;
  memory: number;
  priority: number;
  lastUpdated: number;
}

export interface ResourceDemand {
  kernelId: string;
  requestedCpu: number;
  requestedMemory: number;
  urgency: number;
}

export interface ResourceMetrics {
  totalCpu: number;
  totalMemory: number;
  availableCpu: number;
  availableMemory: number;
  allocations: ResourceAllocation[];
  efficiency: number;
}

export class AdaptiveResourceAllocator extends BrowserEventEmitter {
  private allocations: Map<string, ResourceAllocation> = new Map();
  private demands: Map<string, ResourceDemand> = new Map();
  private totalResources = {
    cpu: 100,
    memory: 8192 // 8GB in MB
  };

  constructor() {
    super();
    this.startAdaptiveReallocation();
  }

  private startAdaptiveReallocation(): void {
    setInterval(() => {
      this.optimizeAllocations();
    }, 3000); // Rebalance every 3 seconds
  }

  allocateResources(kernelId: string, priority: number, memoryMB: number, cpuPercent: number): boolean {
    const allocation: ResourceAllocation = {
      kernelId,
      cpu: cpuPercent,
      memory: memoryMB,
      priority,
      lastUpdated: Date.now()
    };

    const currentUsage = this.calculateCurrentUsage();
    
    if (currentUsage.cpu + cpuPercent > this.totalResources.cpu ||
        currentUsage.memory + memoryMB > this.totalResources.memory) {
      
      // Try to free up resources by deallocating lower priority kernels
      if (!this.freeResourcesForAllocation(allocation)) {
        console.warn(`❌ Cannot allocate resources for ${kernelId}: insufficient resources`);
        return false;
      }
    }

    this.allocations.set(kernelId, allocation);
    this.emit('allocation-updated', allocation);
    console.log(`✅ Allocated resources for ${kernelId}: ${cpuPercent}% CPU, ${memoryMB}MB RAM`);
    return true;
  }

  requestResources(kernelId: string, cpuPercent: number, memoryMB: number, urgency: number = 1): void {
    const demand: ResourceDemand = {
      kernelId,
      requestedCpu: cpuPercent,
      requestedMemory: memoryMB,
      urgency
    };

    this.demands.set(kernelId, demand);
    this.emit('demand-registered', demand);
    
    // Try immediate allocation for high urgency requests
    if (urgency > 2) {
      this.processUrgentDemand(demand);
    }
  }

  private processUrgentDemand(demand: ResourceDemand): void {
    const current = this.allocations.get(demand.kernelId);
    if (current) {
      // Scale up existing allocation
      current.cpu = Math.max(current.cpu, demand.requestedCpu);
      current.memory = Math.max(current.memory, demand.requestedMemory);
      current.lastUpdated = Date.now();
      this.emit('allocation-scaled', current);
    } else {
      // Create new high-priority allocation
      this.allocateResources(demand.kernelId, 8, demand.requestedMemory, demand.requestedCpu);
    }
  }

  private optimizeAllocations(): void {
    const allocations = Array.from(this.allocations.values());
    const currentUsage = this.calculateCurrentUsage();
    
    // If we're over-allocated, scale down less critical kernels
    if (currentUsage.cpu > this.totalResources.cpu * 0.9 || 
        currentUsage.memory > this.totalResources.memory * 0.9) {
      this.scaleDownLowPriority();
    }

    // Process pending demands
    this.processPendingDemands();

    // Calculate and emit efficiency metrics
    const efficiency = this.calculateEfficiency();
    this.emit('efficiency-updated', efficiency);
  }

  private scaleDownLowPriority(): void {
    const sortedAllocations = Array.from(this.allocations.values())
      .sort((a, b) => a.priority - b.priority); // Lower priority first

    for (const allocation of sortedAllocations) {
      if (allocation.priority < 7) { // Don't touch high priority (7+) kernels
        allocation.cpu = Math.max(allocation.cpu * 0.8, 5); // Scale down by 20%, min 5%
        allocation.memory = Math.max(allocation.memory * 0.9, 32); // Scale down by 10%, min 32MB
        allocation.lastUpdated = Date.now();
        this.emit('allocation-scaled-down', allocation);
      }
    }
  }

  private processPendingDemands(): void {
    const sortedDemands = Array.from(this.demands.values())
      .sort((a, b) => b.urgency - a.urgency);

    for (const demand of sortedDemands) {
      const currentUsage = this.calculateCurrentUsage();
      if (currentUsage.cpu + demand.requestedCpu <= this.totalResources.cpu &&
          currentUsage.memory + demand.requestedMemory <= this.totalResources.memory) {
        
        this.allocateResources(demand.kernelId, Math.ceil(demand.urgency * 3), 
                             demand.requestedMemory, demand.requestedCpu);
        this.demands.delete(demand.kernelId);
      }
    }
  }

  private freeResourcesForAllocation(newAllocation: ResourceAllocation): boolean {
    const currentUsage = this.calculateCurrentUsage();
    const neededCpu = newAllocation.cpu;
    const neededMemory = newAllocation.memory;

    // Find kernels we can deallocate (lower priority than new allocation)
    const candidates = Array.from(this.allocations.values())
      .filter(alloc => alloc.priority < newAllocation.priority)
      .sort((a, b) => a.priority - b.priority);

    let freedCpu = 0;
    let freedMemory = 0;

    for (const candidate of candidates) {
      if (freedCpu >= neededCpu && freedMemory >= neededMemory) {
        break;
      }

      freedCpu += candidate.cpu;
      freedMemory += candidate.memory;
      this.allocations.delete(candidate.kernelId);
      this.emit('allocation-deallocated', candidate);
    }

    return (currentUsage.cpu - freedCpu + neededCpu <= this.totalResources.cpu) &&
           (currentUsage.memory - freedMemory + neededMemory <= this.totalResources.memory);
  }

  private calculateCurrentUsage(): { cpu: number; memory: number } {
    const allocations = Array.from(this.allocations.values());
    return allocations.reduce((usage, alloc) => ({
      cpu: usage.cpu + alloc.cpu,
      memory: usage.memory + alloc.memory
    }), { cpu: 0, memory: 0 });
  }

  private calculateEfficiency(): number {
    const usage = this.calculateCurrentUsage();
    const cpuEfficiency = usage.cpu / this.totalResources.cpu;
    const memoryEfficiency = usage.memory / this.totalResources.memory;
    return Math.round((cpuEfficiency + memoryEfficiency) / 2 * 100);
  }

  getResourceMetrics(): ResourceMetrics {
    const usage = this.calculateCurrentUsage();
    return {
      totalCpu: this.totalResources.cpu,
      totalMemory: this.totalResources.memory,
      availableCpu: this.totalResources.cpu - usage.cpu,
      availableMemory: this.totalResources.memory - usage.memory,
      allocations: Array.from(this.allocations.values()),
      efficiency: this.calculateEfficiency()
    };
  }

  deallocateResources(kernelId: string): void {
    const allocation = this.allocations.get(kernelId);
    if (allocation) {
      this.allocations.delete(kernelId);
      this.emit('allocation-deallocated', allocation);
      console.log(`🔄 Deallocated resources for ${kernelId}`);
    }
  }

  getPendingDemands(): ResourceDemand[] {
    return Array.from(this.demands.values());
  }
}

export const adaptiveResourceAllocator = new AdaptiveResourceAllocator();
