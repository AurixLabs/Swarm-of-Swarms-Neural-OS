
import React, { useState } from 'react';

interface PathAnalysis {
  requestedPath: string;
  resolvedUrl: string;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  contentType: string;
  contentLength: number;
  isRedirected: boolean;
  actualContent: string;
  fileExists: boolean;
  magicBytes: string;
  timestamp: string;
}

const WasmPathAnalyzer = () => {
  const [analyses, setAnalyses] = useState<PathAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // All the core modules from WasmManager
  const coreModules = [
    'cma_neural_os',
    'neuromorphic', 
    'llama_bridge',
    'hybrid_intelligence',
    'reasoning_engine',
    'fused_kernels'
  ];

  const analyzeWasmPath = async (moduleName: string) => {
    const path = `/wasm/${moduleName}.wasm`;

    try {
      console.log(`🔍 [PathAnalyzer] Testing ${moduleName}: ${path}`);
      
      const response = await fetch(path);
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      let actualContent = '';
      let magicBytes = '';
      
      try {
        if (response.ok) {
          const arrayBuffer = await response.clone().arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Get first 16 bytes as hex
          magicBytes = Array.from(uint8Array.slice(0, 16))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ');
            
          // If it looks like text, get the text content
          if (uint8Array[0] === 0x3c || uint8Array[0] === 0x0a) { // < or newline
            actualContent = await response.clone().text();
            actualContent = actualContent.substring(0, 200) + (actualContent.length > 200 ? '...' : '');
          } else {
            actualContent = `Binary data (${arrayBuffer.byteLength} bytes)`;
          }
        } else {
          actualContent = await response.text();
          actualContent = actualContent.substring(0, 200) + (actualContent.length > 200 ? '...' : '');
        }
      } catch (contentError) {
        actualContent = `Failed to read content: ${contentError}`;
      }

      const analysis: PathAnalysis = {
        requestedPath: path,
        resolvedUrl: response.url,
        responseStatus: response.status,
        responseHeaders: headers,
        contentType: response.headers.get('content-type') || 'unknown',
        contentLength: parseInt(response.headers.get('content-length') || '0'),
        isRedirected: response.redirected,
        actualContent,
        fileExists: response.ok,
        magicBytes,
        timestamp: new Date().toISOString()
      };

      return analysis;

    } catch (error) {
      const analysis: PathAnalysis = {
        requestedPath: path,
        resolvedUrl: 'N/A',
        responseStatus: 0,
        responseHeaders: {},
        contentType: 'error',
        contentLength: 0,
        isRedirected: false,
        actualContent: `Network error: ${error}`,
        fileExists: false,
        magicBytes: '',
        timestamp: new Date().toISOString()
      };

      return analysis;
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      console.log('🚀 [PathAnalyzer] Testing ALL core modules for the ultimate truth!');
      
      const allResults: PathAnalysis[] = [];
      
      // Test all modules one by one
      for (const moduleName of coreModules) {
        const result = await analyzeWasmPath(moduleName);
        allResults.push(result);
        console.log(`📋 [PathAnalyzer] ${moduleName}:`, result);
      }
      
      setAnalyses(allResults);
      
      // Summary report
      const validWasm = allResults.filter(r => r.magicBytes.startsWith('00 61 73 6d')).length;
      const existing = allResults.filter(r => r.fileExists).length;
      const invalidFiles = allResults.filter(r => r.fileExists && !r.magicBytes.startsWith('00 61 73 6d')).length;
      
      console.log(`📊 [PathAnalyzer] ULTIMATE TRUTH REPORT:`);
      console.log(`✅ Valid WASM files: ${validWasm}/${coreModules.length}`);
      console.log(`📁 Files that exist: ${existing}/${coreModules.length}`);
      console.log(`❌ Invalid files (exist but not WASM): ${invalidFiles}/${coreModules.length}`);
      
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">WASM Path Analysis Tool</h3>
        <button 
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          {isAnalyzing ? 'Analyzing All Modules...' : 'Test ALL Modules!'}
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-100 rounded">
        <div className="text-sm font-medium mb-1">🎯 ULTIMATE TRUTH DISCOVERY!</div>
        <div className="text-xs text-gray-700">
          Testing all {coreModules.length} core modules: {coreModules.join(', ')}
          <br />
          Let's see which ones are valid WASM, which are invalid, and which don't exist!
        </div>
      </div>

      {analyses.length > 0 && (
        <div className="space-y-4">
          <div className="mb-4">
            <h4 className="font-medium text-purple-800 mb-2">📊 Summary Report</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-green-100 p-2 rounded text-center">
                <div className="font-bold text-green-700">
                  {analyses.filter(a => a.magicBytes.startsWith('00 61 73 6d')).length}
                </div>
                <div className="text-green-600">Valid WASM</div>
              </div>
              <div className="bg-orange-100 p-2 rounded text-center">
                <div className="font-bold text-orange-700">
                  {analyses.filter(a => a.fileExists && !a.magicBytes.startsWith('00 61 73 6d')).length}
                </div>
                <div className="text-orange-600">Invalid Files</div>
              </div>
              <div className="bg-red-100 p-2 rounded text-center">
                <div className="font-bold text-red-700">
                  {analyses.filter(a => !a.fileExists).length}
                </div>
                <div className="text-red-600">Missing</div>
              </div>
            </div>
          </div>
          
          {analyses.map((analysis, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {analysis.requestedPath}
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    analysis.fileExists ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {analysis.responseStatus}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    analysis.magicBytes.startsWith('00 61 73 6d') 
                      ? 'bg-blue-100 text-blue-700' 
                      : analysis.fileExists
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {analysis.magicBytes.startsWith('00 61 73 6d') 
                      ? 'VALID WASM' 
                      : analysis.fileExists 
                      ? 'INVALID FILE' 
                      : 'MISSING'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium mb-1">📍 URL Resolution</div>
                  <div className="bg-gray-50 p-2 rounded font-mono break-all">
                    {analysis.resolvedUrl}
                  </div>
                  {analysis.isRedirected && (
                    <div className="text-orange-600 mt-1">⚠️ Redirected</div>
                  )}
                </div>

                <div>
                  <div className="font-medium mb-1">📋 Response Info</div>
                  <div className="space-y-1">
                    <div>Content-Type: <span className="font-mono">{analysis.contentType}</span></div>
                    <div>Content-Length: <span className="font-mono">{analysis.contentLength}</span></div>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="font-medium mb-1">🔍 Magic Bytes</div>
                  <div className="bg-gray-50 p-2 rounded font-mono text-xs">
                    {analysis.magicBytes || 'No bytes read'}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="font-medium mb-1">📄 Content Preview</div>
                  <div className="bg-gray-50 p-2 rounded font-mono text-xs max-h-24 overflow-y-auto">
                    {analysis.actualContent}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Analyzed at: {analysis.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-yellow-50 rounded">
        <div className="text-sm font-medium mb-2">🔍 THE ULTIMATE TRUTH AWAITS!</div>
        <div className="text-xs text-gray-600">
          Click the button above to test all {coreModules.length} core WASM modules and discover which ones are valid, invalid, or missing!
          Check the browser console for detailed logs of this epic investigation.
        </div>
      </div>
    </div>
  );
};

export default WasmPathAnalyzer;
