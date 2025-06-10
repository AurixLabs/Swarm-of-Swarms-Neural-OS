
import React, { useState } from 'react';
import { realWasmLoader } from '../../core/wasm/RealWasmLoader';

const ReasoningEngineTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('What is the meaning of life in a swarm intelligence system?');
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const testRealReasoningEngine = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      console.log('🔥 Testing REAL reasoning_engine WASM module - CONSISTENCY CHECK ACTIVE!');
      
      const loadResult = await realWasmLoader.loadRealModule('reasoning_engine');
      
      if (!loadResult.success || !loadResult.isReal) {
        throw new Error(`REAL WASM load failed: ${loadResult.error || 'Not real WASM'}`);
      }
      
      console.log('✅ REAL Reasoning engine loaded successfully - DIAGNOSTICS:', loadResult.diagnostics);
      
      // Execute REAL analyze function
      const analysisResult = realWasmLoader.executeReal('reasoning_engine', 'analyze', input);
      
      console.log('🎯 REAL Analysis result:', analysisResult);
      
      // Get detailed diagnostics
      const moduleDiagnostics = realWasmLoader.getDiagnostics('reasoning_engine');
      setDiagnostics(moduleDiagnostics);
      
      // Parse the JSON result if it's a string
      let parsedResult;
      try {
        parsedResult = typeof analysisResult === 'string' ? JSON.parse(analysisResult) : analysisResult;
      } catch (parseError) {
        parsedResult = { raw_output: analysisResult };
      }
      
      setTestResult(`🔥 REAL SUCCESS! 
File Hash: ${loadResult.diagnostics?.fileHash}
Load Time: ${loadResult.diagnostics?.loadTime}ms
Functions: ${loadResult.diagnostics?.functionsCount}
Magic Valid: ${loadResult.diagnostics?.magicNumberValid}

RESULT: ${JSON.stringify(parsedResult, null, 2)}`);
      
    } catch (error) {
      console.error('❌ REAL Reasoning engine test failed:', error);
      const moduleDiagnostics = realWasmLoader.getDiagnostics('reasoning_engine');
      setDiagnostics(moduleDiagnostics);
      setTestResult(`💥 REAL FAILURE: ${error instanceof Error ? error.message : 'Unknown error'}
      
DIAGNOSTICS: ${JSON.stringify(moduleDiagnostics, null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRealContextProcessing = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      console.log('🔥 Testing REAL context processing...');
      
      const module = realWasmLoader.getRealModule('reasoning_engine');
      if (!module) {
        throw new Error('REAL Reasoning engine not loaded - BUILD THE REAL DEAL FIRST!');
      }
      
      const context = {
        input: input,
        context_type: 'analytical',
        priority: 'high',
        complexity: Math.floor(Math.random() * 10) + 1
      };
      
      const contextResult = realWasmLoader.executeReal('reasoning_engine', 'process_context', JSON.stringify(context));
      
      console.log('🎯 REAL Context processing result:', contextResult);
      
      // Get detailed diagnostics
      const moduleDiagnostics = realWasmLoader.getDiagnostics('reasoning_engine');
      setDiagnostics(moduleDiagnostics);
      
      // Parse the JSON result if it's a string
      let parsedResult;
      try {
        parsedResult = typeof contextResult === 'string' ? JSON.parse(contextResult) : contextResult;
      } catch (parseError) {
        parsedResult = { raw_output: contextResult };
      }
      
      setTestResult(`🔥 REAL CONTEXT SUCCESS! 
File Hash: ${moduleDiagnostics.lastResult?.fileHash}
Load Attempts: ${moduleDiagnostics.loadAttempts}

RESULT: ${JSON.stringify(parsedResult, null, 2)}`);
      
    } catch (error) {
      console.error('❌ REAL Context processing failed:', error);
      const moduleDiagnostics = realWasmLoader.getDiagnostics('reasoning_engine');
      setDiagnostics(moduleDiagnostics);
      setTestResult(`💥 REAL CONTEXT FAILURE: ${error instanceof Error ? error.message : 'Unknown error'}
      
DIAGNOSTICS: ${JSON.stringify(moduleDiagnostics, null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkRealModuleStatus = () => {
    const isLoaded = realWasmLoader.isRealModuleLoaded('reasoning_engine');
    const module = realWasmLoader.getRealModule('reasoning_engine');
    const moduleDiagnostics = realWasmLoader.getDiagnostics('reasoning_engine');
    
    console.log('📊 REAL Module status with detailed diagnostics:', moduleDiagnostics);
    
    const functions = module ? Object.keys(module).filter(key => typeof module[key] === 'function') : [];
    const reasoningFunctions = functions.filter(f => f.startsWith('reasoningengine_')).map(f => f.replace('reasoningengine_', ''));
    
    setDiagnostics(moduleDiagnostics);
    setTestResult(`🔥 CONSISTENCY CHECK:
Module loaded: ${isLoaded}
Load attempts: ${moduleDiagnostics.loadAttempts}
File hash: ${moduleDiagnostics.lastResult?.fileHash}
Functions count: ${moduleDiagnostics.lastResult?.functionsCount}
Last error: ${moduleDiagnostics.lastError || 'None'}

🧠 Reasoning Functions: ${reasoningFunctions.join(', ') || 'NONE'}
📋 All Functions: ${functions.slice(0, 10).join(', ')}`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-red-600">🔥 REAL REASONING ENGINE TEST - CONSISTENCY TRACKING!</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">REAL Test Input:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter something for REAL analysis..."
        />
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={testRealReasoningEngine}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Testing REAL...' : '🔥 Test REAL analyze()'}
        </button>
        
        <button
          onClick={testRealContextProcessing}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Testing REAL...' : '🔥 Test REAL process_context()'}
        </button>
        
        <button
          onClick={checkRealModuleStatus}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          🔥 Consistency Check
        </button>
      </div>
      
      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-bold mb-2">🔥 REAL Test Result:</h3>
          <pre className="text-sm whitespace-pre-wrap break-words">{testResult}</pre>
        </div>
      )}
      
      {diagnostics && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h3 className="font-bold mb-2">🔍 Detailed Diagnostics:</h3>
          <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(diagnostics, null, 2)}</pre>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-red-50 rounded">
        <div className="text-sm font-medium mb-1">🔥 TWILIGHT ZONE DETECTION!</div>
        <div className="text-xs text-gray-700">
          This enhanced version tracks:
          <br />• ✅ File hash consistency (same file = same hash)
          <br />• ✅ Load attempt counting (multiple loads = suspicious)
          <br />• ✅ Function availability tracking
          <br />• ✅ Cache-busting to prevent stale loads
          <br />• 🔥 NO MORE UNCERTAINTY - WE KNOW WHAT'S REAL!
        </div>
      </div>
    </div>
  );
};

export default ReasoningEngineTest;
