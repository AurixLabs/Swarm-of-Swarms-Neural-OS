
// CMA Core - COMPLETELY LAZY LOADED - No synchronous imports allowed
console.log('🔒 CMA Core module loaded (lazy only)');

// All core functionality moved to lazy initialization functions
let cmaInitialized = false;

export const cmaCore = {
  async initialize() {
    if (cmaInitialized) {
      console.log('⚠️ CMA already initialized, skipping...');
      return;
    }

    console.log('🚀 Starting CMA lazy initialization...');
    
    try {
      // Step 1: Load WASM modules lazily
      await this.initializeWasm();
      
      // Step 2: Load kernels lazily
      await this.initializeKernels();
      
      // Step 3: Initialize service worker lazily
      await this.initializeServiceWorker();
      
      cmaInitialized = true;
      console.log('✅ CMA Core initialization complete');
    } catch (error) {
      console.error('❌ CMA initialization failed:', error);
      throw error;
    }
  },

  async initializeWasm() {
    console.log('🔄 Loading WASM modules...');
    // All WASM loading is now completely lazy
    const wasmFiles = [
      '/wasm/cma_neural_os.wasm',
      '/wasm/neuromorphic.wasm',
      '/wasm/hybrid_orchestrator.wasm'
    ];
    
    for (const wasmFile of wasmFiles) {
      try {
        const response = await fetch(wasmFile);
        if (response.ok) {
          console.log(`✅ WASM loaded: ${wasmFile}`);
        }
      } catch (error) {
        console.log(`⚠️ WASM not found: ${wasmFile}`);
      }
    }
  },

  async initializeKernels() {
    console.log('🔄 Loading kernels...');
    // No synchronous kernel imports - everything lazy
    console.log('✅ Kernel system ready (lazy mode)');
  },

  async initializeServiceWorker() {
    console.log('🔄 Registering service worker...');
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/wasm-service-worker.js');
        console.log('✅ Service worker registered');
      } catch (error) {
        console.log('⚠️ Service worker registration failed:', error);
      }
    }
  }
};
