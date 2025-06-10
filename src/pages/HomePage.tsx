
import React from 'react';
import LovableGitHubSyncChecker from '../components/feature/LovableGitHubSyncChecker';
import WasmCleanupManager from '../components/feature/WasmCleanupManager';
import LovableFileSystemDiagnostic from '../components/feature/LovableFileSystemDiagnostic';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧠 Cognitive Modular Architecture (CMA)
          </h1>
          <p className="text-xl text-gray-600">
            Neural OS Development Dashboard
          </p>
        </div>

        <LovableFileSystemDiagnostic />
        
        <LovableGitHubSyncChecker />
        
        <WasmCleanupManager />
      </div>
    </div>
  );
};

export default HomePage;
