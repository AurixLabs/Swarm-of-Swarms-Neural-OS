
import React, { createContext, useContext, ReactNode } from 'react';
import { systemKernel } from '../SystemKernel';
import { aiKernel } from '../ai/AIKernel';
import { memoryKernel } from '../memory/MemoryKernel';
import { securityKernel } from '../security/SecurityKernel';
import { uiKernel } from '../ui/UIKernel';
import { regulatoryKernel } from '../regulatory/RegulatoryKernel';
import { collaborativeKernel } from '../collaborative/CollaborativeKernel';
import { knowledgeDomainRegistry } from '../knowledge/KnowledgeDomainRegistry';

interface KernelRegistry {
  system: typeof systemKernel;
  ai: typeof aiKernel;
  memory: typeof memoryKernel;
  security: typeof securityKernel;
  ui: typeof uiKernel;
  collaborative: typeof collaborativeKernel;
  getRegulatoryKernel: () => typeof regulatoryKernel;
  getDomainRegistry: () => typeof knowledgeDomainRegistry;
}

const kernelRegistry: KernelRegistry = {
  system: systemKernel,
  ai: aiKernel,
  memory: memoryKernel,
  security: securityKernel,
  ui: uiKernel,
  collaborative: collaborativeKernel,
  getRegulatoryKernel: () => regulatoryKernel,
  getDomainRegistry: () => knowledgeDomainRegistry,
};

const KernelRegistryContext = createContext<KernelRegistry | null>(null);

export const KernelRegistryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <KernelRegistryContext.Provider value={kernelRegistry}>
      {children}
    </KernelRegistryContext.Provider>
  );
};

export const useKernelRegistry = () => {
  const context = useContext(KernelRegistryContext);
  if (!context) {
    throw new Error('useKernelRegistry must be used within a KernelRegistryProvider');
  }
  return context;
};
