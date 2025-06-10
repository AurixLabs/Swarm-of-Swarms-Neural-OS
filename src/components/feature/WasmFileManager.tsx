
import React, { useState, useEffect } from 'react';

interface WasmFile {
  name: string;
  path: string;
  size: number;
  lastModified: number;
  exists: boolean;
}

const WasmFileManager = () => {
  const [wasmFiles, setWasmFiles] = useState<WasmFile[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [cleanupResults, setCleanupResults] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const expectedWasmFiles = [
    'reasoning_engine.wasm',
    'neuromorphic.wasm',
    'cma_neural_os.wasm',
    'llama_bridge.wasm',
    'hybrid_intelligence.wasm',
    'fused_kernels.wasm',
    // Check for potential duplicates with different naming
    'reasoning_engine_bg.wasm',
    'neuromorphic_bg.wasm',
    'cma_neural_os_bg.wasm',
    'llama_bridge_bg.wasm'
  ];

  useEffect(() => {
    scanWasmFiles();
  }, []);

  const scanWasmFiles = async () => {
    setIsScanning(true);
    setDebugInfo([]);
    console.log('🔍 Scanning for WASM files and checking for duplicates...');
    
    const fileResults: WasmFile[] = [];
    const debugLog: string[] = [];
    
    debugLog.push('🔍 STARTING WASM FILE SCAN...');
    debugLog.push(`📂 Expected location: /wasm/ directory (public/wasm/)`);
    debugLog.push(`🎯 Looking for: ${expectedWasmFiles.length} files`);
    debugLog.push('');
    
    for (const fileName of expectedWasmFiles) {
      try {
        const fullPath = `/wasm/${fileName}`;
        debugLog.push(`🔍 Checking: ${fullPath}`);
        
        const response = await fetch(fullPath, { method: 'HEAD' });
        
        if (response.ok) {
          const contentLength = response.headers.get('content-length');
          const lastModified = response.headers.get('last-modified');
          const contentType = response.headers.get('content-type');
          
          fileResults.push({
            name: fileName,
            path: fullPath,
            size: contentLength ? parseInt(contentLength) : 0,
            lastModified: lastModified ? new Date(lastModified).getTime() : Date.now(),
            exists: true
          });
          
          debugLog.push(`✅ FOUND: ${fileName}`);
          debugLog.push(`   📊 Size: ${contentLength} bytes (${Math.round(parseInt(contentLength || '0') / 1024)}KB)`);
          debugLog.push(`   📅 Modified: ${lastModified}`);
          debugLog.push(`   📄 Type: ${contentType}`);
          debugLog.push('');
          
        } else {
          debugLog.push(`❌ NOT FOUND: ${fileName} (HTTP ${response.status})`);
          fileResults.push({
            name: fileName,
            path: fullPath,
            size: 0,
            lastModified: 0,
            exists: false
          });
        }
      } catch (error) {
        debugLog.push(`💥 ERROR checking ${fileName}:`, error);
        fileResults.push({
          name: fileName,
          path: `/wasm/${fileName}`,
          size: 0,
          lastModified: 0,
          exists: false
        });
      }
    }
    
    debugLog.push('📈 SCAN COMPLETE');
    debugLog.push(`✅ Found: ${fileResults.filter(f => f.exists).length} files`);
    debugLog.push(`❌ Missing: ${fileResults.filter(f => !f.exists).length} files`);
    
    setWasmFiles(fileResults);
    setDebugInfo(debugLog);
    identifyDuplicates(fileResults);
    setIsScanning(false);
  };

  const identifyDuplicates = (files: WasmFile[]) => {
    const duplicateGroups: { [key: string]: WasmFile[] } = {};
    const results: string[] = [];
    
    // Group files by base name (without _bg suffix)
    files.filter(f => f.exists).forEach(file => {
      const baseName = file.name.replace('_bg.wasm', '.wasm').replace('.wasm', '');
      
      if (!duplicateGroups[baseName]) {
        duplicateGroups[baseName] = [];
      }
      duplicateGroups[baseName].push(file);
    });
    
    // Check for duplicates
    Object.entries(duplicateGroups).forEach(([baseName, groupFiles]) => {
      if (groupFiles.length > 1) {
        results.push(`🔄 DUPLICATE GROUP: ${baseName}`);
        
        // Sort by modification time (newest first)
        const sortedFiles = groupFiles.sort((a, b) => b.lastModified - a.lastModified);
        
        sortedFiles.forEach((file, index) => {
          const age = new Date(file.lastModified).toLocaleString();
          const status = index === 0 ? '🆕 NEWEST (KEEP)' : '🗑️ OLDER (REMOVE)';
          results.push(`  ${status}: ${file.name} (${Math.round(file.size / 1024)}KB, ${age})`);
        });
        
        results.push('');
      }
    });
    
    if (results.length === 0) {
      results.push('✅ No duplicates found - all WASM files are unique!');
    }
    
    setCleanupResults(results);
  };

  const testReasoningEngineDirectly = async () => {
    try {
      console.log('🧠 DIRECT TEST: Testing reasoning engine file access...');
      
      const testPaths = [
        '/wasm/reasoning_engine.wasm',
        '/wasm/reasoning_engine_bg.wasm',
        'reasoning_engine.wasm',
        'reasoning_engine_bg.wasm'
      ];
      
      const results: string[] = [];
      
      for (const path of testPaths) {
        try {
          results.push(`🔍 Testing path: ${path}`);
          const response = await fetch(path, { method: 'HEAD' });
          
          if (response.ok) {
            const size = response.headers.get('content-length');
            const contentType = response.headers.get('content-type');
            results.push(`✅ SUCCESS: ${path} found!`);
            results.push(`   Size: ${size} bytes (${Math.round(parseInt(size || '0') / 1024)}KB)`);
            results.push(`   Type: ${contentType}`);
            
            // If this is a good size, it's probably our file!
            const sizeBytes = parseInt(size || '0');
            if (sizeBytes > 100000 && sizeBytes < 110000) {
              results.push(`🎯 THIS LOOKS LIKE THE REAL COMPILED REASONING ENGINE!`);
            }
          } else {
            results.push(`❌ FAILED: ${path} - HTTP ${response.status}`);
          }
          results.push('');
        } catch (error) {
          results.push(`💥 ERROR: ${path} - ${error}`);
          results.push('');
        }
      }
      
      alert('Direct test results logged to console - check browser dev tools!');
      console.log('🧠 DIRECT TEST RESULTS:');
      results.forEach(result => console.log(result));
      
    } catch (error) {
      console.error('❌ Direct test failed:', error);
      alert(`Direct test failed: ${error}`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'N/A';
    return `${Math.round(bytes / 1024)}KB`;
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">🔍 WASM File Manager & Debug Scanner</h2>
        <div className="space-x-2">
          <button
            onClick={scanWasmFiles}
            disabled={isScanning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isScanning ? '🔄 Scanning...' : '🔍 Scan Files'}
          </button>
          <button
            onClick={testReasoningEngineDirectly}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            🧠 Direct Path Test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File List */}
        <div>
          <h3 className="text-lg font-semibold mb-3">📁 WASM Files Found</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {wasmFiles.map((file, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  file.exists
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${file.exists ? 'text-green-800' : 'text-gray-500'}`}>
                    {file.exists ? '✅' : '❌'} {file.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                {file.exists && (
                  <div className="text-xs text-gray-500 mt-1">
                    Modified: {formatDate(file.lastModified)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">🐛 Debug Information</h3>
          <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-80 overflow-y-auto">
            {debugInfo.length > 0 ? (
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {debugInfo.join('\n')}
              </pre>
            ) : (
              <p className="text-gray-500">Run scan to see debug info...</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">🎯 Expected File Status</h4>
        <p className="text-blue-800 text-sm">
          Your reasoning engine was compiled to <strong>102,919 bytes</strong>. 
          Looking for: <strong>reasoning_engine.wasm</strong> (not reasoning_engine_bg.wasm)
        </p>
        <p className="text-blue-800 text-sm mt-2">
          Click "Direct Path Test" to check if the file exists at various possible locations.
        </p>
      </div>
    </div>
  );
};

export default WasmFileManager;
