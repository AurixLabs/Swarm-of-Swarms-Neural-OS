
# Cognitive Modular Architecture: Implementation Guide

This guide provides practical steps for implementing applications using the Cognitive Modular Architecture (CMA). It bridges the gap between architectural theory and practical implementation.

## Getting Started

### Prerequisites
- Understanding of React, TypeScript, and event-driven architecture
- Familiarity with the [CMA architectural principles](./ARCHITECTURE.md)
- Node.js 18+ and npm/yarn/pnpm installed

### Project Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-project.git
   cd your-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Copy the `.env.example` file to `.env.local` and fill in the required values:
   ```bash
   cp .env.example .env.local
   ```

## Development Workflow

### 1. Initialize the Architecture

The first step in any CMA application is initializing the cognitive architecture:

```typescript
import { multiCognitiveModularArchitecture } from '@/core/CognitiveArchitecture';

// In your application entry point
useEffect(() => {
  if (!multiCognitiveModularArchitecture.isInitialized()) {
    multiCognitiveModularArchitecture.initialize();
  }
}, []);
```

### 2. Register Required Adapters

Before using any services, register the necessary adapters:

```typescript
import { adapterRegistry } from '@/core/adapters/AdapterRegistry';
import { SupabaseDatabaseAdapter } from '@/core/adapters/supabase/SupabaseDatabaseAdapter';
import { SupabaseEdgeFunctionProvider } from '@/core/adapters/supabase/SupabaseEdgeFunctionProvider';

// Register database adapter
adapterRegistry.registerDatabaseAdapter(new SupabaseDatabaseAdapter());

// Register edge function adapter
adapterRegistry.registerFunctionAdapter(new SupabaseEdgeFunctionProvider());
```

### 3. Create and Register Modules

Modules are the building blocks of the CMA. Here's how to create and register a module:

```typescript
import { SystemModule } from '@/core/SystemModule';
import { systemKernel } from '@/core/SystemKernel';

// Create a module
class YourModule extends SystemModule {
  id = 'your-module-id';
  
  initialize() {
    // Initialize your module
    console.log('Module initialized');
  }
  
  // Module methods
  doSomething() {
    // Implement functionality
  }
  
  destroy() {
    // Clean up resources
    console.log('Module destroyed');
  }
}

// Register the module
const yourModule = new YourModule();
systemKernel.registerModule(yourModule);
```

### 4. Working with Events

The CMA is event-driven. Here's how to work with events:

```typescript
import { systemKernel } from '@/core/SystemKernel';

// Listen for events
const unsubscribe = systemKernel.events.onEvent('DATA_UPDATED', (payload) => {
  console.log('Data updated:', payload);
});

// Emit events
systemKernel.events.emitEvent({
  type: 'USER_ACTION',
  payload: { action: 'click', element: 'button' }
});

// Clean up event listeners
unsubscribe();
```

### 5. Creating a Feature

Features in CMA should be isolated in their own directories with their own hooks and components:

```
/src
  /features
    /your-feature
      /components
        YourComponent.tsx
      /hooks
        useYourFeature.ts
      index.ts
```

Example feature hook:

```typescript
// src/features/your-feature/hooks/useYourFeature.ts
import { useState, useEffect } from 'react';
import { systemKernel } from '@/core/SystemKernel';
import { aiKernel } from '@/core/AIKernel';

export function useYourFeature() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Initialize feature
    const handleDataUpdate = (payload) => {
      if (payload.key === 'your-feature:data') {
        setData(payload.value);
      }
    };
    
    // Subscribe to relevant events
    const unsubscribe = systemKernel.events.onEvent('DATA_UPDATED', handleDataUpdate);
    
    return () => {
      // Clean up
      unsubscribe();
    };
  }, []);
  
  const processData = async (input) => {
    // Process data using AI kernel
    const module = aiKernel.getModule('intent-analyzer');
    if (module) {
      return await module.analyze(input);
    }
    return null;
  };
  
  return {
    data,
    processData
  };
}
```

Example feature component:

```typescript
// src/features/your-feature/components/YourComponent.tsx
import React from 'react';
import { useYourFeature } from '../hooks/useYourFeature';
import { FeatureBoundary } from '@/components/common/FeatureBoundary';

export const YourComponent = () => {
  const { data, processData } = useYourFeature();
  
  const handleInput = async (e) => {
    const result = await processData(e.target.value);
    console.log('Processing result:', result);
  };
  
  return (
    <FeatureBoundary>
      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Your Feature</h2>
        <input 
          type="text" 
          onChange={handleInput} 
          className="w-full p-2 border rounded"
          placeholder="Enter text to process"
        />
        {data && (
          <div className="mt-4">
            <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </FeatureBoundary>
  );
};
```

## Working with AI in CMA

### Creating AI Modules

AI capabilities are implemented as modules in the AI kernel:

```typescript
import { AIModule } from '@/core/AIModule';
import { aiKernel } from '@/core/AIKernel';

class IntentAnalyzerModule extends AIModule {
  id = 'intent-analyzer';
  
  initialize(kernel) {
    console.log('Intent analyzer initialized');
  }
  
  async analyze(text) {
    // Implement intent analysis
    // This could call an edge function or use a local model
    return { intent: 'information', confidence: 0.8 };
  }
  
  destroy() {
    console.log('Intent analyzer destroyed');
  }
}

// Register the AI module
const intentAnalyzer = new IntentAnalyzerModule();
aiKernel.registerModule(intentAnalyzer);
```

### Using Edge Functions

For AI capabilities that require server-side execution:

```typescript
import { edgeFunctions } from '@/services/edgeFunctions';

const callAI = async (prompt) => {
  try {
    const response = await edgeFunctions.call('qwen-chat', {
      params: { prompt, max_tokens: 100 }
    });
    return response.result;
  } catch (error) {
    console.error('Error calling AI edge function:', error);
    return null;
  }
};
```

## State Management in CMA

The CMA uses a combination of kernel state and React context/hooks for state management:

### Kernel State

For system-wide state that needs to be accessible to multiple components:

```typescript
// Setting state
systemKernel.setState('user:preferences', { theme: 'dark', fontSize: 'medium' });

// Getting state
const preferences = systemKernel.getState('user:preferences');
```

### React Context/Hooks

For feature-specific state:

```typescript
// src/features/your-feature/context/YourFeatureContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type FeatureContextType = {
  featureState: any;
  updateFeatureState: (state: any) => void;
};

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const YourFeatureProvider = ({ children }: { children: ReactNode }) => {
  const [featureState, setFeatureState] = useState({});
  
  const updateFeatureState = (state: any) => {
    setFeatureState(state);
  };
  
  return (
    <FeatureContext.Provider value={{ featureState, updateFeatureState }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useYourFeatureContext = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useYourFeatureContext must be used within a YourFeatureProvider');
  }
  return context;
};
```

## Error Handling

The CMA provides a fault-tolerant architecture through `FeatureBoundary` components:

```typescript
import { FeatureBoundary } from '@/components/common/FeatureBoundary';

const YourComponent = () => {
  return (
    <FeatureBoundary
      fallback={<div>Something went wrong with this feature</div>}
    >
      {/* Your component content */}
    </FeatureBoundary>
  );
};
```

## Architectural Enhancements

Advanced architectural enhancements can be initialized for projects requiring advanced capabilities:

```typescript
import { architecturalEnhancementRegistry } from '@/core/integration/ArchitecturalEnhancementRegistry';

// Initialize enhancements
useEffect(() => {
  architecturalEnhancementRegistry.initialize();
  
  return () => {
    architecturalEnhancementRegistry.shutdown();
  };
}, []);

// Use specific enhancements
const adaptiveSelfModifier = architecturalEnhancementRegistry.getAdaptiveSelfModifier();
adaptiveSelfModifier.recordPerformanceMetric('your-module', 100);
```

## Deployment

For deploying CMA applications, see the [Deployment Guide](./DEPLOYMENT.md).

## Best Practices

1. **Modularity**: Keep modules focused and single-purpose
2. **Error Boundaries**: Wrap all intelligent components in error boundaries
3. **Event-Driven**: Communicate through events, not direct dependencies
4. **Type Safety**: Use TypeScript consistently for all interfaces
5. **Testing**: Write tests for all modules and components
6. **Documentation**: Document all modules, events, and interfaces

## Common Pitfalls

1. **Circular Dependencies**: Avoid circular dependencies between modules
2. **Direct Kernel Access**: Use hooks and context to access kernels, not direct imports in components
3. **Overengineering**: Start simple and add complexity only when needed
4. **Missing Error Boundaries**: Always wrap AI components in error boundaries
5. **Hardcoded URLs**: Use environment variables for all external URLs

## Next Steps

Now that you understand how to implement the CMA, start by:

1. Exploring the demo in `/pages/kernel-demo.tsx`
2. Creating your first module
3. Implementing a feature that uses the module
4. Contributing to the architecture

Happy building!
