
import { UniversalKernel } from './UniversalKernel';

class KernelRegistryService {
  private kernels: Map<string, UniversalKernel> = new Map();

  register(kernel: UniversalKernel): void {
    this.kernels.set(kernel.getState().id, kernel);
  }

  get(id: string): UniversalKernel | undefined {
    return this.kernels.get(id);
  }

  getAll(): UniversalKernel[] {
    return Array.from(this.kernels.values());
  }

  getAllStates() {
    return Array.from(this.kernels.values()).map(kernel => kernel.getState());
  }
}

export const KernelRegistry = new KernelRegistryService();
