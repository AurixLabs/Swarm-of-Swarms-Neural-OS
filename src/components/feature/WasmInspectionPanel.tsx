import React, { useEffect, useState } from 'react';
import { wasmInspector, WasmAnalysis } from '../../core/wasm/WasmInspector';

const WasmInspectionPanel = () => {
  const [analyses, setAnalyses] = useState<WasmAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runInspection();
  }, []);

  const runInspection = async () => {
    setIsLoading(true);
    try {
      const results = await wasmInspector.inspectAllWasmFiles();
      setAnalyses(results);
      wasmInspector.generateMissingImportsReport(results);
    } catch (error) {
      console.error('Inspection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="text-center">🔍 Inspecting WASM files...</div>
      </div>
    );
  }

  const reasoningEngine = analyses.find(a => a.filename === 'reasoning_engine.wasm');

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">WASM File Analysis</h3>
        <button 
          onClick={runInspection}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Re-inspect
        </button>
      </div>

      {/* Special section for Reasoning Engine */}
      {reasoningEngine && (
        <div className="mb-6 border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-purple-800">🧠 Reasoning Engine (Newly Compiled)</h4>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-xs ${
                reasoningEngine.exists ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {reasoningEngine.exists ? 'EXISTS' : 'MISSING'}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                reasoningEngine.isValidWasm ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
              }`}>
                {reasoningEngine.isValidWasm ? 'VALID WASM' : 'INVALID'}
              </span>
            </div>
          </div>

          {reasoningEngine.size && (
            <div className="text-sm text-gray-600 mb-2">
              Size: {Math.round(reasoningEngine.size / 1024)}KB
            </div>
          )}

          {reasoningEngine.compilationDetails && (
            <div className="text-sm text-purple-700 mb-2 bg-purple-100 p-2 rounded">
              Magic: {reasoningEngine.compilationDetails.magicNumber} | 
              Version: {reasoningEngine.compilationDetails.version} | 
              Memory: {reasoningEngine.compilationDetails.hasMemory ? 'Yes' : 'No'}
            </div>
          )}

          {reasoningEngine.error && (
            <div className="text-sm text-red-600 mb-2 bg-red-50 p-2 rounded">
              ❌ {reasoningEngine.error}
            </div>
          )}

          {reasoningEngine.imports.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium mb-2">📥 Imports ({reasoningEngine.imports.length}):</div>
              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {reasoningEngine.imports.map((imp, idx) => (
                  <div key={idx} className="bg-blue-50 p-1 rounded">
                    {imp.module}.{imp.name} ({imp.kind})
                  </div>
                ))}
              </div>
            </div>
          )}

          {reasoningEngine.exports.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">📤 Exports ({reasoningEngine.exports.length}):</div>
              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {reasoningEngine.exports.map((exp, idx) => (
                  <div key={idx} className="bg-green-50 p-1 rounded">
                    {exp.name} ({exp.kind})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other modules */}
      <div className="space-y-4">
        {analyses.filter(a => a.filename !== 'reasoning_engine.wasm').map((analysis) => (
          <div key={analysis.filename} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{analysis.filename}</h4>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  analysis.exists ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {analysis.exists ? 'EXISTS' : 'MISSING'}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  analysis.isValidWasm ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {analysis.isValidWasm ? 'VALID WASM' : 'INVALID'}
                </span>
              </div>
            </div>

            {analysis.size && (
              <div className="text-sm text-gray-600 mb-2">
                Size: {Math.round(analysis.size / 1024)}KB
              </div>
            )}

            {analysis.error && (
              <div className="text-sm text-red-600 mb-2 bg-red-50 p-2 rounded">
                ❌ {analysis.error}
              </div>
            )}

            {analysis.imports.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium mb-2">📥 Imports ({analysis.imports.length}):</div>
                <div className="text-xs space-y-1 max-h-24 overflow-y-auto">
                  {analysis.imports.slice(0, 3).map((imp, idx) => (
                    <div key={idx} className="bg-blue-50 p-1 rounded">
                      {imp.module}.{imp.name} ({imp.kind})
                    </div>
                  ))}
                  {analysis.imports.length > 3 && (
                    <div className="text-gray-500">...and {analysis.imports.length - 3} more</div>
                  )}
                </div>
              </div>
            )}

            {analysis.exports.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">📤 Exports ({analysis.exports.length}):</div>
                <div className="text-xs space-y-1 max-h-24 overflow-y-auto">
                  {analysis.exports.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="bg-green-50 p-1 rounded">
                      {exp.name} ({exp.kind})
                    </div>
                  ))}
                  {analysis.exports.length > 3 && (
                    <div className="text-gray-500">...and {analysis.exports.length - 3} more</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded">
        <div className="text-sm font-medium mb-2">💡 Check console for detailed analysis</div>
        <div className="text-xs text-gray-600">
          Open browser console to see the complete analysis report including specific details about the reasoning engine WASM module.
        </div>
      </div>
    </div>
  );
};

export default WasmInspectionPanel;
