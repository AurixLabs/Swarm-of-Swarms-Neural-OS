import React from 'react';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import LovableGitHubSyncChecker from '../components/feature/LovableGitHubSyncChecker';
import WasmCleanupManager from '../components/feature/WasmCleanupManager';
import LovableFileSystemDiagnostic from '../components/feature/LovableFileSystemDiagnostic';

const DeveloperPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">Developer Tools</h1>
            <Badge variant="secondary">Internal Use</Badge>
          </div>
          <p className="text-muted-foreground">
            Diagnostic and development tools for CMA Neural OS contributors
          </p>
        </div>

        <Tabs defaultValue="sync" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sync">GitHub Sync</TabsTrigger>
            <TabsTrigger value="wasm">WASM Files</TabsTrigger>
            <TabsTrigger value="filesystem">File System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sync">
            <LovableGitHubSyncChecker />
          </TabsContent>
          
          <TabsContent value="wasm">
            <WasmCleanupManager />
          </TabsContent>
          
          <TabsContent value="filesystem">
            <LovableFileSystemDiagnostic />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeveloperPage;