
import React from 'react';
import WasmInspectionPanel from '../components/feature/WasmInspectionPanel';
import WasmPathAnalyzer from '../components/feature/WasmPathAnalyzer';

const WasmInspectionPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            WASM Module Inspection & Analysis
          </h1>
          <p className="text-gray-600">
            Comprehensive analysis of WebAssembly modules and path resolution
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">📊 Module Analysis</h2>
            <WasmInspectionPanel />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">🔍 Path Analysis</h2>
            <WasmPathAnalyzer />
          </div>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">🛠️ Debugging Guide</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div>• <strong>Module Analysis</strong>: Shows WASM file validity, imports, and exports</div>
            <div>• <strong>Path Analysis</strong>: Tests all possible paths and shows what content is actually served</div>
            <div>• <strong>Console Logs</strong>: Check browser console for detailed fetch information</div>
            <div>• <strong>Magic Bytes</strong>: Valid WASM starts with <code className="bg-gray-100 px-1">00 61 73 6d</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasmInspectionPage;
