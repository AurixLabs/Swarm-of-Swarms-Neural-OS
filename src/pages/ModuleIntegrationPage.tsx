import React, { useState, useEffect } from 'react';
import { unifiedWasmLoader } from '../core/wasm/UnifiedWasmLoader';
import ReasoningEngineInterface from '../components/feature/ReasoningEngineInterface';
import NeuromorphicInterface from '../components/feature/NeuromorphicInterface';
import ModuleStatusPanel from '../components/feature/ModuleStatusPanel';
import WasmFileManager from '../components/feature/WasmFileManager';
import WasmCleanupManager from '../components/feature/WasmCleanupManager';

const ModuleIntegrationPage = () => {
  const [moduleStatuses, setModuleStatuses] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeModules();
  }, []);

  const initializeModules = async () => {
    setIsLoading(true);
    console.log('🚀 Initializing REAL WASM modules - NO FALLBACKS, NO SIMULATIONS...');
    
    const modules = ['reasoning_engine', 'neuromorphic', 'cma_neural_os', 'llama_bridge'];
    const statuses: Record<string, boolean> = {};
    
    for (const moduleId of modules) {
      try {
        const result = await unifiedWasmLoader.loadModule(moduleId);
        statuses[moduleId] = result.success;
        
        if (result.success) {
          console.log(`✅ REAL MODULE LOADED: ${moduleId} (${result.size} bytes)`);
        } else {
          console.log(`❌ REAL MODULE FAILED: ${moduleId} - ${result.error}`);
        }
      } catch (error) {
        statuses[moduleId] = false;
        console.error(`❌ REAL MODULE ERROR: ${moduleId}:`, error);
      }
    }
    
    setModuleStatuses(statuses);
    setIsLoading(false);
    
    // Check if ANY modules loaded
    const loadedCount = Object.values(statuses).filter(Boolean).length;
    if (loadedCount === 0) {
      console.error('🚨 ZERO REAL MODULES LOADED - POSSIBLE DUPLICATE FILE CHAOS');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading REAL WASM Modules (NO FALLBACKS)...</h2>
        </div>
      </div>
    );
  }

  const loadedModules = Object.values(moduleStatuses).filter(Boolean).length;
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧠 CMA REAL Module Integration Dashboard
          </h1>
          <p className="text-gray-600">
            REAL WASM modules integrated with NO FALLBACKS, NO SIMULATIONS
          </p>
          {loadedModules === 0 && (
            <div className="mt-4 p-4 bg-red-100 border border-red-500 rounded-lg">
              <p className="text-red-800 font-bold">
                🚨 ZERO REAL MODULES LOADED - POSSIBLE DUPLICATE FILE CHAOS
              </p>
              <p className="text-red-700 mt-2">
                Use the cleanup manager below to establish single source of truth
              </p>
            </div>
          )}
        </div>
        
        {/* NEW: WASM Cleanup Manager */}
        <div className="mb-8">
          <WasmCleanupManager />
        </div>
        
        {/* File Manager */}
        <div className="mb-8">
          <WasmFileManager />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ModuleStatusPanel moduleStatuses={moduleStatuses} onRefresh={initializeModules} />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ReasoningEngineInterface />
          <NeuromorphicInterface />
        </div>
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🔥 REAL Module Integration Status (NO FALLBACKS)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(moduleStatuses).map(([moduleId, status]) => (
              <div key={moduleId} className={`p-3 rounded ${status ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="font-medium">{moduleId.replace('_', ' ')}</div>
                <div className={`text-sm ${status ? 'text-green-600' : 'text-red-600'}`}>
                  {status ? '✅ REAL LOADED' : '❌ FAILED'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleIntegrationPage;
