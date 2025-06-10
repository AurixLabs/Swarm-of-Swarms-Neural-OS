
// Pure kernel system - no UI dependencies
export class KernelSystem {
  private kernels: Map<string, any> = new Map();
  
  constructor() {
    console.log('⚡ CMA Kernel System initialized - UI-free');
  }
  
  registerKernel(id: string, kernel: any) {
    this.kernels.set(id, kernel);
    console.log(`✅ Kernel ${id} registered`);
  }
  
  getKernel(id: string) {
    return this.kernels.get(id);
  }
  
  getAllKernels() {
    return Array.from(this.kernels.values());
  }
  
  executeKernelOperation(kernelId: string, operation: string): any {
    const kernel = this.kernels.get(kernelId);
    if (kernel) {
      console.log(`⚡ Executing ${operation} on kernel ${kernelId}`);
      return `Operation ${operation} executed`;
    }
    return null;
  }
}

export const kernelSystem = new KernelSystem();
