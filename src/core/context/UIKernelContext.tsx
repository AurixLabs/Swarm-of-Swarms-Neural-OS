
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UIKernel, uiKernel } from '../ui/UIKernel';

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
  uiKernel: UIKernel; // Add uiKernel directly to the context
}>({
  state: initialState,
  updateState: () => {},
  uiKernel // Reference the uiKernel instance
});

// Provider Component
export const UIKernelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UIState>(initialState);

  const updateState = (updates: Partial<UIState>) => {
    setState(prev => ({ ...prev, ...updates }));
    
    // Also sync with uiKernel
    if (updates.cognitiveUIEnabled !== undefined) {
      try {
        uiKernel.setCognitiveUIEnabled(updates.cognitiveUIEnabled);
      } catch (error) {
        console.error('Error updating cognitive UI state:', error);
      }
    }
  };

  return (
    <UIKernelContext.Provider value={{ 
      state, 
      updateState,
      uiKernel // Provide the uiKernel instance
    }}>
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
      updateState: () => {},
      uiKernel
    };
  }
  return context;
};

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
