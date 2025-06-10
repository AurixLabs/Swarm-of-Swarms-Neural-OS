
import React, { createContext, useContext, ReactNode } from 'react';

export interface DesignContextType {
  cognitiveUIEnabled: boolean;
  toggleCognitiveUI: () => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const DesignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cognitiveUIEnabled, setCognitiveUIEnabled] = React.useState(true);

  const toggleCognitiveUI = () => {
    setCognitiveUIEnabled(prev => !prev);
  };

  return (
    <DesignContext.Provider value={{
      cognitiveUIEnabled,
      toggleCognitiveUI,
    }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = (): DesignContextType => {
  const context = useContext(DesignContext);
  if (!context) {
    console.error('useDesign must be used within a DesignProvider');
    return {
      cognitiveUIEnabled: true,
      toggleCognitiveUI: () => {},
    };
  }
  return context;
};
