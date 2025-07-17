import React from 'react';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import WasmCleanupManager from '../components/feature/WasmCleanupManager';
import ReasoningEngineInterface from '../components/feature/ReasoningEngineInterface';
import RealESP32Integration from '../components/feature/RealESP32Integration';
import ComprehensiveWasmTester from '../components/feature/ComprehensiveWasmTester';
import RealWasmBuildStatus from '../components/feature/RealWasmBuildStatus';
import AgentSwarmSpawner from '../components/feature/AgentSwarmSpawner';

const DeveloperPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">Development Environment</h1>
            <Badge variant="secondary">Research & Testing</Badge>
          </div>
          <p className="text-muted-foreground">
            Development tools and testing environment for CMA Neural OS research
          </p>
        </div>

        <div className="space-y-6">
          <ReasoningEngineInterface />
          <RealESP32Integration />
          <ComprehensiveWasmTester />
          <WasmCleanupManager />
          <RealWasmBuildStatus />
          <AgentSwarmSpawner />
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;