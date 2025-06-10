
import { UniversalKernel } from './UniversalKernel';
import { SystemEvent } from '../events/SystemEvents';
import { resourceManager } from '../resources/ResourceManager';

export interface StorageAllocation {
  id: string;
  size: number;
  priority: number;
  kernelId: string;
  timestamp: number;
  replicas: number;
  location: 'local' | 'distributed' | 'cache';
}

export interface StorageMetrics {
  totalStorage: number;
  usedStorage: number;
  availableStorage: number;
  fragmentationLevel: number;
  replicationHealth: number;
  accessLatency: number;
}

export class StorageKernel extends UniversalKernel {
  private allocations: Map<string, StorageAllocation> = new Map();
  private storageCache: Map<string, any> = new Map();
  private replicationMap: Map<string, string[]> = new Map();
  private metrics: StorageMetrics = {
    totalStorage: 1024, // 1GB simulation
    usedStorage: 0,
    availableStorage: 1024,
    fragmentationLevel: 0,
    replicationHealth: 100,
    accessLatency: 2
  };

  constructor() {
    super('storage', 'Storage Kernel', 'distributed_storage');
    this.initialize();
  }

  async initialize(): Promise<void> {
    console.log('🗄️ Initializing Storage Kernel for distributed data management');
    
    // Allocate resources for storage operations
    const allocated = resourceManager.allocateResources('storage', 8, 96, 15);
    if (!allocated) {
      console.warn('⚠️ Storage Kernel: Resource allocation failed');
    }

    // Set up storage monitoring
    this.setupStorageMonitoring();
    
    // Initialize default storage pools
    this.initializeStoragePools();
    
    this.setStatus('healthy');
    console.log('✅ Storage Kernel initialized successfully');
  }

  allocateStorage(
    kernelId: string, 
    size: number, 
    priority: number = 5,
    replicas: number = 2
  ): string | null {
    if (this.metrics.availableStorage < size) {
      console.warn(`❌ Storage allocation failed: Insufficient space (${size}MB requested, ${this.metrics.availableStorage}MB available)`);
      return null;
    }

    const allocationId = `storage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const allocation: StorageAllocation = {
      id: allocationId,
      size,
      priority,
      kernelId,
      timestamp: Date.now(),
      replicas,
      location: size > 100 ? 'distributed' : 'local'
    };

    this.allocations.set(allocationId, allocation);
    this.updateStorageMetrics();
    
    // Create replicas for fault tolerance
    this.createReplicas(allocationId, replicas);
    
    console.log(`✅ Storage allocated: ${size}MB for ${kernelId} (ID: ${allocationId})`);
    
    this.emit({
      id: `storage_allocated_${Date.now()}`,
      type: 'STORAGE_ALLOCATED',
      payload: { allocationId, kernelId, size, priority },
      timestamp: Date.now(),
      priority: 6
    });

    return allocationId;
  }

  releaseStorage(allocationId: string): boolean {
    const allocation = this.allocations.get(allocationId);
    if (!allocation) {
      console.warn(`❌ Storage release failed: Allocation ${allocationId} not found`);
      return false;
    }

    // Clean up replicas
    const replicas = this.replicationMap.get(allocationId);
    if (replicas) {
      replicas.forEach(replicaId => this.storageCache.delete(replicaId));
      this.replicationMap.delete(allocationId);
    }

    // Remove from cache and allocations
    this.storageCache.delete(allocationId);
    this.allocations.delete(allocationId);
    this.updateStorageMetrics();

    console.log(`✅ Storage released: ${allocation.size}MB for ${allocation.kernelId}`);
    
    this.emit({
      id: `storage_released_${Date.now()}`,
      type: 'STORAGE_RELEASED',
      payload: { allocationId, kernelId: allocation.kernelId, size: allocation.size },
      timestamp: Date.now(),
      priority: 6
    });

    return true;
  }

  storeData(allocationId: string, key: string, data: any): boolean {
    const allocation = this.allocations.get(allocationId);
    if (!allocation) {
      console.warn(`❌ Data store failed: Allocation ${allocationId} not found`);
      return false;
    }

    const storageKey = `${allocationId}:${key}`;
    this.storageCache.set(storageKey, {
      data,
      timestamp: Date.now(),
      kernelId: allocation.kernelId,
      checksum: this.calculateChecksum(data)
    });

    // Replicate data
    this.replicateData(allocationId, key, data);
    
    console.log(`✅ Data stored: ${key} in allocation ${allocationId}`);
    return true;
  }

  retrieveData(allocationId: string, key: string): any {
    const storageKey = `${allocationId}:${key}`;
    const stored = this.storageCache.get(storageKey);
    
    if (!stored) {
      // Try to retrieve from replicas
      return this.retrieveFromReplicas(allocationId, key);
    }

    // Verify data integrity
    if (this.calculateChecksum(stored.data) !== stored.checksum) {
      console.warn(`⚠️ Data corruption detected for ${key}, attempting replica recovery`);
      return this.retrieveFromReplicas(allocationId, key);
    }

    return stored.data;
  }

  getStorageMetrics(): StorageMetrics {
    return { ...this.metrics };
  }

  getAllocations(): StorageAllocation[] {
    return Array.from(this.allocations.values());
  }

  optimizeStorage(): void {
    console.log('🔧 Storage Kernel: Running optimization...');
    
    // Defragmentation simulation
    this.defragmentStorage();
    
    // Cleanup unused allocations
    this.cleanupExpiredAllocations();
    
    // Optimize replica distribution
    this.optimizeReplicas();
    
    this.updateStorageMetrics();
    console.log('✅ Storage optimization complete');
  }

  private setupStorageMonitoring(): void {
    setInterval(() => {
      this.updateStorageMetrics();
      this.checkStorageHealth();
    }, 5000);
  }

  private initializeStoragePools(): void {
    // Initialize storage pools for different data types
    const defaultPools = [
      { name: 'system_pool', size: 256, priority: 10 },
      { name: 'kernel_pool', size: 512, priority: 8 },
      { name: 'cache_pool', size: 256, priority: 6 }
    ];

    defaultPools.forEach(pool => {
      this.allocateStorage('system', pool.size, pool.priority, 3);
    });
  }

  private createReplicas(allocationId: string, replicaCount: number): void {
    const replicas: string[] = [];
    
    for (let i = 0; i < replicaCount; i++) {
      const replicaId = `${allocationId}_replica_${i}`;
      replicas.push(replicaId);
    }
    
    this.replicationMap.set(allocationId, replicas);
  }

  private replicateData(allocationId: string, key: string, data: any): void {
    const replicas = this.replicationMap.get(allocationId);
    if (!replicas) return;

    replicas.forEach(replicaId => {
      const replicaKey = `${replicaId}:${key}`;
      this.storageCache.set(replicaKey, {
        data,
        timestamp: Date.now(),
        isReplica: true,
        parentAllocation: allocationId,
        checksum: this.calculateChecksum(data)
      });
    });
  }

  private retrieveFromReplicas(allocationId: string, key: string): any {
    const replicas = this.replicationMap.get(allocationId);
    if (!replicas) return null;

    for (const replicaId of replicas) {
      const replicaKey = `${replicaId}:${key}`;
      const replica = this.storageCache.get(replicaKey);
      
      if (replica && this.calculateChecksum(replica.data) === replica.checksum) {
        console.log(`✅ Data recovered from replica: ${replicaId}`);
        return replica.data;
      }
    }

    console.warn(`❌ Data recovery failed for ${key} in allocation ${allocationId}`);
    return null;
  }

  private updateStorageMetrics(): void {
    let usedStorage = 0;
    
    this.allocations.forEach(allocation => {
      usedStorage += allocation.size;
    });

    this.metrics.usedStorage = usedStorage;
    this.metrics.availableStorage = this.metrics.totalStorage - usedStorage;
    
    // Calculate fragmentation (simplified)
    this.metrics.fragmentationLevel = Math.min(
      (this.allocations.size / 100) * 20, 
      50
    );
    
    // Calculate replication health
    let healthyReplicas = 0;
    let totalReplicas = 0;
    
    this.replicationMap.forEach(replicas => {
      totalReplicas += replicas.length;
      replicas.forEach(replicaId => {
        if (this.storageCache.has(`${replicaId}:health_check`)) {
          healthyReplicas++;
        } else {
          healthyReplicas++; // Assume healthy if no explicit check
        }
      });
    });
    
    this.metrics.replicationHealth = totalReplicas > 0 
      ? (healthyReplicas / totalReplicas) * 100 
      : 100;
  }

  private checkStorageHealth(): void {
    const usagePercentage = (this.metrics.usedStorage / this.metrics.totalStorage) * 100;
    
    if (usagePercentage > 90) {
      this.setStatus('critical');
      console.warn('🚨 Storage Kernel: Critical storage usage (>90%)');
    } else if (usagePercentage > 75) {
      this.setStatus('warning');
      console.warn('⚠️ Storage Kernel: High storage usage (>75%)');
    } else {
      this.setStatus('healthy');
    }
  }

  private defragmentStorage(): void {
    // Simulate defragmentation by reducing fragmentation level
    this.metrics.fragmentationLevel = Math.max(0, this.metrics.fragmentationLevel - 5);
  }

  private cleanupExpiredAllocations(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    this.allocations.forEach((allocation, id) => {
      if (now - allocation.timestamp > maxAge && allocation.priority < 7) {
        console.log(`🧹 Cleaning up expired allocation: ${id}`);
        this.releaseStorage(id);
      }
    });
  }

  private optimizeReplicas(): void {
    // Optimize replica distribution for better performance
    this.replicationMap.forEach((replicas, allocationId) => {
      const allocation = this.allocations.get(allocationId);
      if (allocation && allocation.priority > 8) {
        // High priority allocations get more replicas
        if (replicas.length < 3) {
          const newReplicaId = `${allocationId}_replica_${replicas.length}`;
          replicas.push(newReplicaId);
        }
      }
    });
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation (in production, use proper hashing)
    return btoa(JSON.stringify(data)).slice(0, 16);
  }
}

export const storageKernel = new StorageKernel();
