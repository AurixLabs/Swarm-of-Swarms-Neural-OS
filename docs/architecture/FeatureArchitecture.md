# Feature Architecture

## Overview

The feature architecture of the Multi-Cognitive Modular Architecture (MCMA) defines how application features are structured, implemented, and integrated. This document describes the feature architecture, component structure, and best practices for feature development.

## Feature Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Feature Architecture                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Feature Module                       │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                 Feature Components                  │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌───────────┐   ┌───────────┐   ┌───────────┐     │  │  │
│  │  │  │ Container │   │ View      │   │ SubComp   │     │  │  │
│  │  │  └───────────┘   └───────────┘   └───────────┘     │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                            │                               │  │
│  │  ┌─────────────────────────▼─────────────────────────────┐│  │
│  │  │                   Feature Hooks                       ││  │
│  │  │                                                       ││  │
│  │  │  ┌───────────┐   ┌───────────┐   ┌───────────┐       ││  │
│  │  │  │ useFeature│   │useFeatureUI│  │useSubFeature     ││  │
│  │  │  └───────────┘   └───────────┘   └───────────┘       ││  │
│  │  └───────────────────────────────────────────────────────┘│  │
│  │                            │                               │  │
│  │  ┌─────────────────────────▼─────────────────────────────┐│  │
│  │  │                  Feature Context                      ││  │
│  │  │                                                       ││  │
│  │  │  ┌───────────────────────────────────────┐           ││  │
│  │  │  │           FeatureProvider              │           ││  │
│  │  │  └───────────────────────────────────────┘           ││  │
│  │  └───────────────────────────────────────────────────────┘│  │
│  │                            │                               │  │
│  │  ┌─────────────────────────▼─────────────────────────────┐│  │
│  │  │                   Feature Logic                       ││  │
│  │  │                                                       ││  │
│  │  │  ┌───────────┐   ┌───────────┐   ┌───────────┐       ││  │
│  │  │  │ Actions   │   │ Reducers  │   │ Selectors │       ││  │
│  │  │  └───────────┘   └───────────┘   └───────────┘       ││  │
│  │  └───────────────────────────────────────────────────────┘│  │
│  │                            │                               │  │
│  │  ┌─────────────────────────▼─────────────────────────────┐│  │
│  │  │                  Feature Services                     ││  │
│  │  │                                                       ││  │
│  │  │  ┌───────────┐   ┌───────────┐   ┌───────────┐       ││  │
│  │  │  │ API       │   │ Utils     │   │ Models    │       ││  │
│  │  │  └───────────┘   └───────────┘   └───────────┘       ││  │
│  │  └───────────────────────────────────────────────────────┘│  │
│  └─────────────────────────────────────────────────────────────────┘
```

## Feature Module Structure

A feature module is a self-contained unit of functionality with the following structure:

```
/features
  /workspace
    /components       # UI components
    /hooks            # React hooks
    /context          # React context
    /api              # API clients
    /utils            # Utilities
    /models           # Type definitions
    /constants        # Constants
    index.ts          # Public API
```

## Feature Components

### 1. Container Components

Container components connect to feature logic and pass props to view components.

**Characteristics:**
- Connect to feature hooks and context
- Handle data fetching and state management
- Pass data and callbacks to view components
- Implement error boundaries and loading states

**Example:**
```tsx
// WorkspaceContainer.tsx
import { useWorkspace } from '../hooks/useWorkspace';
import { WorkspaceView } from './WorkspaceView';

export function WorkspaceContainer() {
  const { workspace, loading, error, updateWorkspace } = useWorkspace();
  
  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorBoundary error={error} />;
  
  return (
    <WorkspaceView
      workspace={workspace}
      onUpdate={updateWorkspace}
    />
  );
}
```

### 2. View Components

View components focus on presentation and delegate logic to container components.

**Characteristics:**
- Receive data and callbacks via props
- Focus on UI presentation
- Have minimal logic
- May use UI-specific hooks for animations, etc.

**Example:**
```tsx
// WorkspaceView.tsx
import { Workspace } from '../models/workspace';

interface WorkspaceViewProps {
  workspace: Workspace;
  onUpdate: (workspace: Workspace) => void;
}

export function WorkspaceView({ workspace, onUpdate }: WorkspaceViewProps) {
  return (
    <div className="workspace">
      <h1>{workspace.name}</h1>
      {/* UI elements */}
    </div>
  );
}
```

### 3. Subcomponents

Subcomponents encapsulate specific parts of the feature UI.

**Characteristics:**
- Focused on specific UI elements
- Reusable within the feature
- May use feature-specific hooks
- Maintain single responsibility

**Example:**
```tsx
// WorkspaceToolbar.tsx
interface WorkspaceToolbarProps {
  onShare: () => void;
  onExport: () => void;
}

export function WorkspaceToolbar({ onShare, onExport }: WorkspaceToolbarProps) {
  return (
    <div className="workspace-toolbar">
      <button onClick={onShare}>Share</button>
      <button onClick={onExport}>Export</button>
    </div>
  );
}
```

## Feature Hooks

Feature hooks encapsulate feature logic and provide a clean API for components.

### 1. Primary Feature Hook

The primary feature hook provides the main functionality of the feature.

**Characteristics:**
- Connects to feature services
- Manages feature state
- Handles feature-specific events
- Provides actions for components

**Example:**
```tsx
// useWorkspace.ts
import { useState, useEffect } from 'react';
import { workspaceApi } from '../api/workspaceApi';
import { Workspace } from '../models/workspace';

export function useWorkspace(workspaceId: string) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function loadWorkspace() {
      try {
        setLoading(true);
        const data = await workspaceApi.getWorkspace(workspaceId);
        setWorkspace(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadWorkspace();
  }, [workspaceId]);
  
  const updateWorkspace = async (updatedWorkspace: Workspace) => {
    // Implementation
  };
  
  return { workspace, loading, error, updateWorkspace };
}
```

### 2. UI-Specific Hooks

UI-specific hooks handle UI concerns for the feature.

**Characteristics:**
- Focus on UI-specific logic
- Handle animations, layouts, etc.
- Often built on top of primary feature hook
- Provide simplified API for components

**Example:**
```tsx
// useWorkspaceUI.ts
import { useState } from 'react';
import { useWorkspace } from './useWorkspace';

export function useWorkspaceUI(workspaceId: string) {
  const { workspace, loading, error, updateWorkspace } = useWorkspace(workspaceId);
  const [activeTab, setActiveTab] = useState('overview');
  
  return {
    workspace,
    loading,
    error,
    updateWorkspace,
    activeTab,
    setActiveTab
  };
}
```

### 3. Sub-Feature Hooks

Sub-feature hooks handle specific aspects of the feature.

**Characteristics:**
- Focus on specific functionality
- Often used by the primary feature hook
- Maintain single responsibility
- May connect to specific services

**Example:**
```tsx
// useWorkspaceCollaborators.ts
import { useState, useEffect } from 'react';
import { collaboratorApi } from '../api/collaboratorApi';

export function useWorkspaceCollaborators(workspaceId: string) {
  // Implementation
  
  return { collaborators, addCollaborator, removeCollaborator };
}
```

## Feature Context

Feature context provides state that needs to be accessed by multiple components.

**Characteristics:**
- Defines feature-specific context
- Provides a context provider component
- Often wraps feature-specific state and actions
- Used for deeply nested component trees

**Example:**
```tsx
// WorkspaceContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { Workspace } from '../models/workspace';

interface WorkspaceContextValue {
  workspace: Workspace | null;
  updateWorkspace: (workspace: Workspace) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
  workspaceId
}: {
  children: ReactNode;
  workspaceId: string;
}) {
  const { workspace, updateWorkspace } = useWorkspace(workspaceId);
  
  return (
    <WorkspaceContext.Provider value={{ workspace, updateWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
}
```

## Feature Logic

Feature logic includes the business logic for the feature.

### 1. Actions

Actions are functions that perform operations on feature data.

**Characteristics:**
- Implement feature operations
- May be asynchronous
- Handle error conditions
- Often encapsulate API calls

**Example:**
```tsx
// workspaceActions.ts
import { workspaceApi } from '../api/workspaceApi';
import { Workspace } from '../models/workspace';

export async function createWorkspace(name: string): Promise<Workspace> {
  return workspaceApi.createWorkspace({ name });
}

export async function updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace> {
  return workspaceApi.updateWorkspace(id, data);
}

export async function deleteWorkspace(id: string): Promise<void> {
  return workspaceApi.deleteWorkspace(id);
}
```

### 2. Reducers

Reducers handle state transitions for complex features.

**Characteristics:**
- Pure functions
- Take current state and action
- Return new state
- Handle all state transitions

**Example:**
```tsx
// workspaceReducer.ts
import { Workspace } from '../models/workspace';

type WorkspaceAction =
  | { type: 'SET_WORKSPACE'; payload: Workspace }
  | { type: 'UPDATE_WORKSPACE'; payload: Partial<Workspace> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null };

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {
    case 'SET_WORKSPACE':
      return { ...state, workspace: action.payload, loading: false };
    // Other cases
    default:
      return state;
  }
}
```

### 3. Selectors

Selectors extract and compute derived data from feature state.

**Characteristics:**
- Pure functions
- Take state as input
- Return derived data
- Optimize rendering performance

**Example:**
```tsx
// workspaceSelectors.ts
import { Workspace } from '../models/workspace';

export function selectCollaboratorCount(workspace: Workspace): number {
  return workspace.collaborators?.length || 0;
}

export function selectIsOwner(workspace: Workspace, userId: string): boolean {
  return workspace.ownerId === userId;
}
```

## Feature Services

Feature services connect to external systems and provide an API for feature logic.

### 1. API Clients

API clients handle communication with backend services.

**Characteristics:**
- Implement API endpoints
- Handle request/response formatting
- Implement error handling
- May implement caching

**Example:**
```tsx
// workspaceApi.ts
import { Workspace } from '../models/workspace';

export const workspaceApi = {
  async getWorkspace(id: string): Promise<Workspace> {
    const response = await fetch(`/api/workspaces/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch workspace');
    }
    return response.json();
  },
  
  async createWorkspace(data: Partial<Workspace>): Promise<Workspace> {
    // Implementation
  },
  
  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace> {
    // Implementation
  },
  
  async deleteWorkspace(id: string): Promise<void> {
    // Implementation
  }
};
```

### 2. Utilities

Utilities provide helper functions for feature logic.

**Characteristics:**
- Pure functions
- Handle common operations
- Often reusable across features
- Implement specific algorithms

**Example:**
```tsx
// workspaceUtils.ts
import { Workspace } from '../models/workspace';

export function formatWorkspaceName(workspace: Workspace): string {
  return workspace.name.toUpperCase();
}

export function sortCollaborators(workspace: Workspace): Workspace {
  // Implementation
}
```

### 3. Models

Models define the data structures used by the feature.

**Characteristics:**
- TypeScript interfaces or types
- Define data structures
- May include validation rules
- Document data constraints

**Example:**
```tsx
// workspace.ts
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  collaborators: Collaborator[];
  createdAt: string;
  updatedAt: string;
}

export interface Collaborator {
  id: string;
  name: string;
  role: 'viewer' | 'editor' | 'admin';
}
```

## Feature Integration

Features are integrated into the application through specific patterns:

### 1. Feature Registration

Features are registered with the system through the kernel layer:

```tsx
// App.tsx
import { systemKernel } from '@/core/SystemKernel';
import { workspaceFeature } from '@/features/workspace';

systemKernel.registerModule(workspaceFeature);
```

### 2. Feature Composition

Features can be composed to create higher-level features:

```tsx
// CollaborativeWorkspace.tsx
import { WorkspaceFeature } from '@/features/workspace';
import { MessagingFeature } from '@/features/messaging';

export function CollaborativeWorkspace() {
  return (
    <div className="collaborative-workspace">
      <WorkspaceFeature />
      <MessagingFeature />
    </div>
  );
}
```

### 3. Feature Communication

Features communicate through the event system:

```tsx
// useWorkspace.ts
import { systemKernel } from '@/core/SystemKernel';

export function useWorkspace() {
  // ... implementation

  const createWorkspace = async (name: string) => {
    const workspace = await workspaceApi.createWorkspace({ name });
    
    // Emit event for other features
    systemKernel.events.emitEvent({
      type: 'WORKSPACE_CREATED',
      payload: { workspace }
    });
    
    return workspace;
  };

  // ... rest of implementation
}
```

## Feature Boundaries

Features are wrapped in error boundaries to prevent failures from affecting the entire application:

```tsx
// FeatureBoundary.tsx
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ReactNode } from 'react';

interface FeatureBoundaryProps {
  name: string;
  children: ReactNode;
}

export function FeatureBoundary({ name, children }: FeatureBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={<div>Feature '{name}' failed to load</div>}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Conclusion

The feature architecture of the Multi-Cognitive Modular Architecture provides a structured approach to building complex applications. By organizing features into well-defined components, hooks, and services, the architecture ensures maintainability, testability, and extensibility. The clear separation of concerns and communication patterns enables features to evolve independently while maintaining system integrity.
