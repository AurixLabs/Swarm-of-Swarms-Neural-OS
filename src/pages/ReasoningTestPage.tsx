
import React from 'react';
import ReasoningEngineTest from '../components/feature/ReasoningEngineTest';
import RealWasmBuildStatus from '../components/feature/RealWasmBuildStatus';
import ComprehensiveWasmTester from '../components/feature/ComprehensiveWasmTester';
import RealHardwareChipDetector from '../components/feature/RealHardwareChipDetector';
import RealESP32Integration from '../components/feature/RealESP32Integration';
import AgentSwarmSpawner from '../components/feature/AgentSwarmSpawner';
import WasmModuleTester from '../components/feature/WasmModuleTester';

const ReasoningTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 CMA Neural OS Development Test Suite
          </h1>
          <p className="text-gray-600">
            Development environment for testing system components and architecture
          </p>
        </div>
        
        <div className="space-y-6">
          <WasmModuleTester />
          <AgentSwarmSpawner />
          <RealESP32Integration />
          <RealHardwareChipDetector />
          <ComprehensiveWasmTester />
          <RealWasmBuildStatus />
          <ReasoningEngineTest />
        </div>
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">🔧 Development Testing Pipeline</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div>• <strong>WASM Module Testing:</strong> Module loading diagnostics and validation</div>
            <div>• <strong>Agent System Testing:</strong> Multi-agent architecture testing environment</div>
            <div>• <strong>Hardware Integration:</strong> ESP32 hardware detection capabilities</div>
            <div>• <strong>Network Scanner:</strong> Device discovery functionality</div>
            <div>• <strong>Function Testing:</strong> Software function validation tools</div>
            <div>• <strong>Build Monitoring:</strong> Development compilation status</div>
            <div>• <strong>Reasoning Engine:</strong> Cognitive architecture testing</div>
            <div>• <strong>Development Focus:</strong> Architecture validation and system testing</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReasoningTestPage;
