import React, { useState } from 'react';

interface WasmFile {
  path: string;
  exists: boolean;
  size?: number;
  isValid?: boolean;
  error?: string;
  magicBytes?: string;
}

const WasmDetector = () => {
  console.log('🔍 WasmDetector component is rendering!');
  
  const [results, setResults] = useState<WasmFile[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const possiblePaths = [
    '/wasm/reasoning_engine.wasm',
    '/wasm/neuromorphic.wasm',
    '/wasm/cma_neural_os.wasm',
    '/wasm/llama_bridge.wasm',
    '/wasm/hybrid_intelligence.wasm',
    '/wasm/fused_kernels.wasm',
    '/src/wasm/reasoning_engine.wasm',
    '/src/wasm/neuromorphic.wasm',
    '/public/wasm/reasoning_engine.wasm',
    '/public/wasm/neuromorphic.wasm'
  ];

  const checkWasmFile = async (path: string): Promise<WasmFile> => {
    try {
      console.log(`🔍 Checking: ${path}`);
      const response = await fetch(path);
      
      if (!response.ok) {
        return {
          path,
          exists: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      const size = arrayBuffer.byteLength;
      
      // Check WASM magic number (0x00 0x61 0x73 0x6D)
      const firstBytes = new Uint8Array(arrayBuffer.slice(0, 8));
      const magicBytes = Array.from(firstBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
      
      const isValid = firstBytes[0] === 0x00 && 
                     firstBytes[1] === 0x61 && 
                     firstBytes[2] === 0x73 && 
                     firstBytes[3] === 0x6D;

      return {
        path,
        exists: true,
        size,
        isValid,
        magicBytes
      };

    } catch (error) {
      return {
        path,
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const scanForWasm = async () => {
    setIsScanning(true);
    console.log('🚀 Starting WASM file scan...');
    
    try {
      const scanResults = await Promise.all(
        possiblePaths.map(path => checkWasmFile(path))
      );
      
      setResults(scanResults);
      
      const foundFiles = scanResults.filter(r => r.exists);
      const validWasm = scanResults.filter(r => r.exists && r.isValid);
      
      console.log(`📊 Scan complete: ${foundFiles.length} files found, ${validWasm.length} valid WASM`);
      
    } finally {
      setIsScanning(false);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  console.log('🔍 WasmDetector about to return JSX');

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 WASM File Detective
          </h1>
          <p className="text-gray-600">
            Let's hunt down those elusive WASM files! 😄
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">File Scanner</h2>
            <button
              onClick={scanForWasm}
              disabled={isScanning}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isScanning ? 'Scanning...' : 'Start WASM Hunt! 🕵️'}
            </button>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Scanning {possiblePaths.length} possible locations for WASM files...
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded text-center">
                  <div className="text-lg font-bold text-green-700">
                    {results.filter(r => r.exists && r.isValid).length}
                  </div>
                  <div className="text-green-600 text-sm">Valid WASM</div>
                </div>
                <div className="bg-orange-100 p-3 rounded text-center">
                  <div className="text-lg font-bold text-orange-700">
                    {results.filter(r => r.exists && !r.isValid).length}
                  </div>
                  <div className="text-orange-600 text-sm">Invalid Files</div>
                </div>
                <div className="bg-red-100 p-3 rounded text-center">
                  <div className="text-lg font-bold text-red-700">
                    {results.filter(r => !r.exists).length}
                  </div>
                  <div className="text-red-600 text-sm">Missing</div>
                </div>
              </div>

              <div className="space-y-2">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border-l-4 ${
                      result.exists && result.isValid
                        ? 'bg-green-50 border-green-400'
                        : result.exists
                        ? 'bg-orange-50 border-orange-400'
                        : 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-sm">{result.path}</div>
                      <div className="flex gap-2">
                        {result.exists && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {formatSize(result.size)}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            result.exists && result.isValid
                              ? 'bg-green-100 text-green-700'
                              : result.exists
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {result.exists && result.isValid
                            ? '✅ VALID WASM'
                            : result.exists
                            ? '⚠️ INVALID'
                            : '❌ NOT FOUND'}
                        </span>
                      </div>
                    </div>
                    
                    {result.exists && result.magicBytes && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-600">Magic bytes: </span>
                        <span className="font-mono bg-gray-100 px-1 rounded">
                          {result.magicBytes.substring(0, 23)}...
                        </span>
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="mt-2 text-xs text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🎯 What this tool does:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Scans common WASM file locations</li>
            <li>• Checks if files actually exist (not just 404 pages)</li>
            <li>• Validates WASM magic number (0x00 0x61 0x73 0x6D)</li>
            <li>• Shows file sizes and basic info</li>
            <li>• Helps you figure out where your WASM files are hiding! 😄</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WasmDetector;
