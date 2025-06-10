
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Simplified UI State Interface
interface UIState {
  cognitiveUIEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  mode: 'personal' | 'business' | 'supplier';
}

// Initialize with default values
const initialState: UIState = {
  cognitiveUIEnabled: true,
  theme: 'system',
  mode: 'personal'
};

// Create a context with a default value
const UIKernelContext = createContext<{
  state: UIState;
  updateState: (updates: Partial<UIState>) => void;
}>({
  state: initialState,
  updateState: () => {}
});

// Provider Component
export const UIKernelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UIState>(initialState);

  const updateState = (updates: Partial<UIState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <UIKernelContext.Provider value={{ state, updateState }}>
      {children}
    </UIKernelContext.Provider>
  );
};

// Custom Hook for using UI Kernel - with added error handling
export const useUIKernel = () => {
  const context = useContext(UIKernelContext);
  if (!context) {
    console.error("useUIKernel must be used within a UIKernelProvider");
    // Return default value instead of throwing to prevent app crashes
    return {
      state: initialState,
      updateState: () => {}
    };
  }
  return context;
};

// Import UIKernel here, after defining the context to avoid circular dependencies
import { uiKernel } from './UIKernel';

// Backwards compatibility for old code
export const useUI = () => {
  console.warn('useUI is deprecated, please use useUIKernel instead');
  try {
    return uiKernel;
  } catch (error) {
    console.error('Error in useUI:', error);
    return null;
  }
};

// Export the uiKernel instance
export { uiKernel };
