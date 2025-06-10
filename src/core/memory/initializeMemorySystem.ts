
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { initializeMemoryIntegration } from './MemoryIntegration';
import { PersistentMemoryManager } from './PersistentMemoryManager';
import { cognitiveCache } from '../intelligence/CognitiveCache';
import { memoryKernel } from '../MemoryKernel';
import { systemKernel } from '../SystemKernel';
import { AgentMemoryManager } from './AgentMemoryManager';

// Global shared event emitter for the memory system
const memoryEvents = new BrowserEventEmitter();

/**
 * Initialize the entire memory system
 * This ensures all memory components are properly connected
 */
export function initializeMemorySystem(): void {
  console.log('Initializing Memory System...');
  
  try {
    // Initialize the persistent memory manager
    const memoryManager = PersistentMemoryManager.getInstance(memoryEvents);
    
    // Initialize the agent memory manager
    const agentMemoryManager = AgentMemoryManager.getInstance(memoryEvents);
    
    // Setup the cognitive cache for faster access
    cognitiveCache.setMaxSize(5000);  // Allow more items in cache for lifelong memories
    cognitiveCache.setDefaultTtl(7 * 24 * 3600000);  // Longer TTL (7 days) for memory persistence
    
    // Initialize the kernel integration
    const integration = initializeMemoryIntegration(memoryEvents);
    
    // Register the memory kernel with the system kernel
    systemKernel.registerModule('memoryKernel', {
      id: 'memoryKernel',
      name: 'Memory Kernel',
      version: '1.0.0',
      initialize: () => {
        console.log('Memory kernel registered with system kernel');
        return true;
      }
    });
    
    // Add support for hybrid memory loading strategy for lifetime memory operations
    checkForAdvancedMemorySupport();
    
    // Signal that the memory system is ready
    systemKernel.setState('memory:system:ready', true);
    memoryEvents.emit('memory:system:initialized', { timestamp: Date.now() });
    
    console.log('Memory System initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Memory System:', error);
    systemKernel.setState('memory:system:error', error);
    systemKernel.enterSafeMode();
  }
}

// Check for advanced memory support and load appropriate modules
async function checkForAdvancedMemorySupport(): Promise<void> {
  try {
    // Check if browser supports SharedArrayBuffer (needed for thread-safe memory)
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    
    // Check for WASM memory features
    const hasWasmMemoryGrowth = WebAssembly && await testWasmMemoryGrowth();
    
    // Detect device capabilities
    const isLowEndDevice = navigator.hardwareConcurrency <= 4;
    const isBatteryLow = await checkBatteryStatus();
    const isOffline = !navigator.onLine;
    const availableStorage = await checkAvailableStorage();
    
    // Set appropriate flags for memory strategy
    systemKernel.setState('memory:capabilities', {
      hasSharedArrayBuffer,
      hasWasmMemoryGrowth,
      isLowEndDevice,
      isBatteryLow,
      isOffline,
      availableStorage,
      timestamp: Date.now()
    });
    
    // Log capabilities for debugging
    console.log('Memory system capabilities detected:', {
      hasSharedArrayBuffer,
      hasWasmMemoryGrowth,
      isLowEndDevice,
      isBatteryLow,
      isOffline,
      availableStorage
    });
    
    // Schedule WASM memory modules loading based on device capabilities
    if (hasWasmMemoryGrowth && !isLowEndDevice) {
      // Schedule advanced memory features to load
      queueMicrotask(() => {
        import('../planetary/services/WasmMemoryService')
          .then(module => {
            const wasmMemoryService = module.createWasmMemoryService(memoryEvents);
            console.log('WASM Memory service initialized:', wasmMemoryService.isWasmSyncAvailable());
          })
          .catch(err => console.warn('Optional WASM memory service could not be loaded:', err));
      });
    }
  } catch (error) {
    console.warn('Error detecting memory capabilities:', error);
  }
}

// Test if browser supports WASM memory growth
async function testWasmMemoryGrowth(): Promise<boolean> {
  try {
    const memory = new WebAssembly.Memory({ initial: 1, maximum: 10, shared: false });
    const bytes = memory.buffer.byteLength;
    memory.grow(1);
    return memory.buffer.byteLength > bytes;
  } catch (error) {
    console.warn('WASM memory growth test failed:', error);
    return false;
  }
}

// Check battery status if available
async function checkBatteryStatus(): Promise<boolean> {
  if ('getBattery' in navigator) {
    try {
      const battery: any = await (navigator as any).getBattery();
      return battery.level < 0.2;
    } catch (error) {
      console.warn('Battery status check failed:', error);
    }
  }
  return false;
}

// Check available storage for memory persistence
async function checkAvailableStorage(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const availableMB = Math.floor((estimate.quota! - estimate.usage!) / (1024 * 1024));
      return availableMB;
    } catch (error) {
      console.warn('Storage estimate failed:', error);
    }
  }
  
  // Default to a conservative estimate
  return 50; // 50MB
}

// Export the shared events object for components that need it
export const getMemoryEvents = (): BrowserEventEmitter => memoryEvents;
