
import { SystemKernel } from './SystemKernel';
import { AIKernel } from './AIKernel';
import { MemoryKernel } from './MemoryKernel';
import { SecurityKernel } from './SecurityKernel';
import { UIKernel } from './UIKernel';
import { CollaborativeKernel } from './CollaborativeKernel';
import { RegulatoryKernel } from './regulatory/RegulatoryKernel';
import { KernelConfiguration } from './types/KernelTypes';
import { KnowledgeDomain } from './types/KnowledgeDomainTypes';

export class KernelRegistry {
  private kernels: Map<string, any> = new Map();
  private domainRegistry: Map<string, KnowledgeDomain> = new Map();
  
  // Core system kernels
  public system: SystemKernel | undefined;
  public ai: AIKernel | undefined;
  public memory: MemoryKernel | undefined;
  public security: SecurityKernel | undefined;
  public ui: UIKernel | undefined;
  public collaborative: CollaborativeKernel | undefined;
  public regulatory: RegulatoryKernel | undefined;

  // Get registered kernels as an array of strings
  public get registeredKernels(): string[] {
    return Array.from(this.kernels.keys());
  }

  constructor() {
    // Initialize core kernels
    this.system = new SystemKernel();
    this.ai = new AIKernel();
    this.memory = new MemoryKernel();
    this.security = new SecurityKernel();
    this.ui = new UIKernel();
    this.collaborative = new CollaborativeKernel();
    this.regulatory = new RegulatoryKernel();

    // Register core kernels
    this.registerKernel('system', this.system);
    this.registerKernel('ai', this.ai);
    this.registerKernel('memory', this.memory);
    this.registerKernel('security', this.security);
    this.registerKernel('ui', this.ui);
    this.registerKernel('collaborative', this.collaborative);
    this.registerKernel('regulatory', this.regulatory);
  }

  public registerKernel(id: string, kernel: any): void {
    this.kernels.set(id, kernel);
  }

  public getKernel(id: string): any | undefined {
    return this.kernels.get(id);
  }

  public listKernels(): string[] {
    return Array.from(this.kernels.keys());
  }
  
  public get(id: string): any | undefined {
    return this.kernels.get(id);
  }
  
  public registerDomain(domain: KnowledgeDomain): void {
    this.domainRegistry.set(domain.id, domain);
  }
  
  public getDomain(id: string): KnowledgeDomain | undefined {
    return this.domainRegistry.get(id);
  }
  
  public getDomainRegistry(): Map<string, KnowledgeDomain> {
    return this.domainRegistry;
  }

  public initializeAllKernels() {
    [this.system, this.ai, this.memory, this.security, this.ui, this.collaborative, this.regulatory]
      .forEach(kernel => {
        if (kernel) {
          if ('initialize' in kernel && typeof kernel.initialize === 'function') {
            kernel.initialize();
          }
        }
      });
  }

  public shutdownAllKernels(): void {
    this.kernels.forEach((kernel) => {
      if (typeof kernel.shutdown === 'function') {
        kernel.shutdown();
      }
    });
  }
  
  public getRegulatoryKernel(): RegulatoryKernel | undefined {
    return this.regulatory;
  }
}

// Create a single instance of the KernelRegistry
export const kernelRegistry = new KernelRegistry();
