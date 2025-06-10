
import React, { useState } from 'react';

const WasmRealityTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testRealWasmFile = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Testing if WASM files are ACTUALLY real...');
      
      // Test the smallest file first - reasoning_engine (138KB)
      const wasmPath = '/wasm/reasoning_engine.wasm';
      addResult(`📡 Fetching: ${wasmPath}`);
      
      const response = await fetch(wasmPath);
      addResult(`📊 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      addResult(`📋 Content-Type: ${contentType || 'unknown'}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const size = arrayBuffer.byteLength;
      addResult(`📏 File size: ${size} bytes (${Math.round(size/1024)}KB)`);
      
      // Check WASM magic number
      const firstBytes = new Uint8Array(arrayBuffer.slice(0, 8));
      const magicBytes = Array.from(firstBytes).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' ');
      addResult(`🔮 Magic bytes: ${magicBytes}`);
      
      const isValidWasm = firstBytes[0] === 0x00 && firstBytes[1] === 0x61 && firstBytes[2] === 0x73 && firstBytes[3] === 0x6D;
      addResult(`✨ Valid WASM magic: ${isValidWasm ? 'YES! 🎉' : 'NO 😞'}`);
      
      if (isValidWasm && size > 1000) {
        addResult('🔥 ATTEMPTING REAL WASM COMPILATION...');
        
        try {
          const wasmModule = await WebAssembly.compile(arrayBuffer);
          addResult('✅ WASM COMPILATION SUCCESSFUL! 🚀');
          
          const imports = WebAssembly.Module.imports(wasmModule);
          const exports = WebAssembly.Module.exports(wasmModule);
          
          addResult(`📦 Imports: ${imports.length}`);
          addResult(`📦 Exports: ${exports.length}`);
          
          if (exports.length > 0) {
            const exportNames = exports.slice(0, 5).map(e => e.name).join(', ');
            addResult(`🎯 Export functions: ${exportNames}${exports.length > 5 ? '...' : ''}`);
          }
          
          addResult('🌟 THE FILES ARE REAL! UNIVERSE DOESN\'T HATE YOU! 🌟');
          
        } catch (compileError) {
          addResult(`❌ WASM compilation failed: ${compileError}`);
        }
      }
      
    } catch (error) {
      addResult(`💥 Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔮 WASM Reality Test
        </h2>
        <p className="text-gray-600">
          Let's prove these ghost files are actually real and functional!
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={testRealWasmFile}
          disabled={isLoading}
          className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? '🔄 Testing Reality...' : '🚀 Test Real WASM Loading'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-3 text-gray-800">Reality Test Results:</h3>
          <div className="space-y-1">
            {testResults.map((result, idx) => (
              <div key={idx} className="text-sm font-mono text-gray-700">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">🎯 What This Test Does:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Actually fetches the WASM file (not just checks existence)</li>
          <li>• Validates the WASM magic number</li>
          <li>• Compiles it with WebAssembly.compile()</li>
          <li>• Lists the actual exports and imports</li>
          <li>• Proves the Universe doesn't hate you! 😄</li>
        </ul>
      </div>
    </div>
  );
};

export default WasmRealityTest;
