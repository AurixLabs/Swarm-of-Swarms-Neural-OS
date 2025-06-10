
// CMA Neural OS - Enhanced System Initializer with Loop Prevention
import { SystemKernel } from './kernels/SystemKernel';
import { AIKernel } from './kernels/AIKernel';
import { SecurityKernel } from './kernels/SecurityKernel';
import { NetworkKernel } from './kernels/NetworkKernel';
import { EthicsKernel } from './kernels/EthicsKernel';

// Enhanced initialization state tracking
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 2;
let lastInitTime = 0;
const MIN_INIT_INTERVAL = 1000; // Minimum time between initialization attempts

export async function initializeSystemKernels() {
  const now = Date.now();
  
  // Prevent rapid re-initialization
  if (now - lastInitTime < MIN_INIT_INTERVAL) {
    console.warn('⚠️ Initialization called too quickly, blocking to prevent loop');
    throw new Error('Initialization rate limited to prevent loops');
  }
  
  initializationAttempts++;
  lastInitTime = now;
  
  console.log(`🔧 SystemInitializer: Attempt ${initializationAttempts}/${MAX_INIT_ATTEMPTS}`);
  
  if (initializationAttempts > MAX_INIT_ATTEMPTS) {
    console.error('💥 Too many initialization attempts, preventing loop');
    throw new Error('Maximum initialization attempts exceeded');
  }
  
  try {
    console.log('🚀 Initializing CMA Neural OS Core Kernels...');
    
    // Initialize kernels with timeout protection
    const kernels = [];
    
    // System Kernel - Core coordinator
    console.log('📡 Initializing System Kernel...');
    const systemKernel = new SystemKernel();
    await Promise.race([
      systemKernel.initialize(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SystemKernel timeout')), 2000))
    ]);
    kernels.push(systemKernel);
    
    // AI Kernel - Intelligence processing
    console.log('🧠 Initializing AI Kernel...');
    const aiKernel = new AIKernel();
    await Promise.race([
      aiKernel.initialize(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AIKernel timeout')), 2000))
    ]);
    kernels.push(aiKernel);
    
    // Security Kernel - Protection and validation
    console.log('🛡️ Initializing Security Kernel...');
    const securityKernel = new SecurityKernel();
    await Promise.race([
      securityKernel.initialize(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SecurityKernel timeout')), 2000))
    ]);
    kernels.push(securityKernel);
    
    // Network Kernel - Communication
    console.log('🌐 Initializing Network Kernel...');
    const networkKernel = new NetworkKernel();
    await Promise.race([
      networkKernel.initialize(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('NetworkKernel timeout')), 2000))
    ]);
    kernels.push(networkKernel);
    
    // Ethics Kernel - Moral constraints
    console.log('⚖️ Initializing Ethics Kernel...');
    const ethicsKernel = new EthicsKernel();
    await Promise.race([
      ethicsKernel.initialize(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('EthicsKernel timeout')), 2000))
    ]);
    kernels.push(ethicsKernel);
    
    console.log('✅ All kernels initialized successfully');
    console.log(`📊 System Status: ${kernels.length} kernels active`);
    
    // Log kernel health
    for (const kernel of kernels) {
      const health = kernel.getHealth();
      console.log(`💚 ${kernel.constructor.name}: ${health.status}`);
    }
    
    return {
      status: 'active',
      kernelCount: kernels.length,
      timestamp: Date.now(),
      initializationAttempts
    };
    
  } catch (error) {
    console.error('💥 SystemInitializer ERROR:', error);
    throw error;
  }
}

export function resetInitializationState() {
  console.log('🔄 Resetting initialization state...');
  initializationAttempts = 0;
  lastInitTime = 0;
}
