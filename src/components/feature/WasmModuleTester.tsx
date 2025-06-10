
import React, { useState, useEffect } from 'react';
import { unifiedWasmLoader } from '../../core/wasm/UnifiedWasmLoader';

interface WasmTestResult {
  moduleId: string;
  loaded: boolean;
  error?: string;
  functions: string[];
  testResult?: any;
}

const WasmModuleTester = () => {
  const [testResults, setTestResults] = useState<WasmTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const modulesToTest = [
    'reasoning_engine',
    'neuromorphic',
    'cma_neural_os',
    'llama_bridge',
    'hybrid_intelligence'
  ];

  const testAllModules = async () => {
    setIsLoading(true);
    console.log('🧪 Testing all WASM modules...');
    
    const results: WasmTestResult[] = [];
    
    for (const moduleId of modulesToTest) {
      console.log(`🔍 Testing ${moduleId}...`);
      
      try {
        const loadResult = await unifiedWasmLoader.loadModule(moduleId);
        
        if (loadResult.success && loadResult.module) {
          const functions = Object.keys(loadResult.module).filter(key => 
            typeof loadResult.module![key] === 'function'
          );
          
          console.log(`✅ ${moduleId} loaded with ${functions.length} functions:`, functions);
          
          // Try to test a function if available
          let testResult = 'No testable functions';
          if (functions.includes('analyze')) {
            try {
              testResult = unifiedWasmLoader.execute(moduleId, 'analyze', 'test input');
              console.log(`🧠 ${moduleId}.analyze() test:`, testResult);
            } catch (error) {
              testResult = `Function test failed: ${error}`;
            }
          }
          
          results.push({
            moduleId,
            loaded: true,
            functions,
            testResult
          });
        } else {
          results.push({
            moduleId,
            loaded: false,
            error: loadResult.error,
            functions: []
          });
        }
      } catch (error) {
        console.error(`❌ ${moduleId} test failed:`, error);
        results.push({
          moduleId,
          loaded: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          functions: []
        });
      }
    }
    
    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    testAllModules();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">
        🔧 WASM Module Test Results
      </h2>
      
      <button
        onClick={testAllModules}
        disabled={isLoading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? '🔄 Testing...' : '🧪 Retest All Modules'}
      </button>
      
      <div className="space-y-4">
        {testResults.map((result) => (
          <div key={result.moduleId} className={`p-4 rounded border ${
            result.loaded ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{result.moduleId}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                result.loaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {result.loaded ? '✅ LOADED' : '❌ FAILED'}
              </span>
            </div>
            
            {result.error && (
              <div className="text-red-600 text-sm mb-2">
                <strong>Error:</strong> {result.error}
              </div>
            )}
            
            {result.functions.length > 0 && (
              <div className="text-sm">
                <strong>Functions ({result.functions.length}):</strong> {result.functions.join(', ')}
              </div>
            )}
            
            {result.testResult && (
              <div className="text-sm mt-2">
                <strong>Test Result:</strong> {typeof result.testResult === 'string' ? result.testResult : JSON.stringify(result.testResult)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
        <h4 className="font-bold mb-2">🚀 Next Steps to Fix WASM:</h4>
        <div className="text-sm space-y-1">
          <div>1. <strong>Build Real Modules:</strong> Run the Rust build scripts in src/rust/</div>
          <div>2. <strong>Check File Paths:</strong> Ensure WASM files exist in public/wasm/</div>
          <div>3. <strong>Fix Import Issues:</strong> Update WASM import definitions</div>
          <div>4. <strong>Test Functions:</strong> Verify exported functions work correctly</div>
        </div>
      </div>
    </div>
  );
};

export default WasmModuleTester;
