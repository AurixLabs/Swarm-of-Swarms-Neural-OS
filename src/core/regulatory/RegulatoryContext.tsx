
import React, { createContext, useContext, ReactNode } from 'react';
import { RegulatoryKernel } from './RegulatoryKernel';
import { regulatoryKernel } from '../RegulatoryKernel';

// React context for regulatory kernel access
const RegulatoryContext = createContext<RegulatoryKernel | null>(null);

export const RegulatoryProvider = ({ children }: { children: ReactNode }) => (
  <RegulatoryContext.Provider value={regulatoryKernel}>
    {children}
  </RegulatoryContext.Provider>
);

export const useRegulatory = () => {
  const context = useContext(RegulatoryContext);
  if (!context) {
    throw new Error('useRegulatory must be used within a RegulatoryProvider');
  }
  return context;
};
