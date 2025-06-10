
import React, { useState } from 'react';

const LovableFileSystemDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runNuclearDiagnostic = async () => {
    setIsRunning(true);
    const results: string[] = [];
    
    results.push('🚨 NUCLEAR LOVABLE FILE SYSTEM DIAGNOSTIC 🚨');
    results.push('===============================================');
    results.push('Testing EXACTLY what Lovable can see vs what you copied...');
    results.push('');
    
    // Test every possible path variation
    const testPaths = [
      '/wasm/reasoning_engine.wasm',
      '/public/wasm/reasoning_engine.wasm',
      'wasm/reasoning_engine.wasm',
      'public/wasm/reasoning_engine.wasm',
      './wasm/reasoning_engine.wasm',
      './public/wasm/reasoning_engine.wasm',
      '/reasoning_engine.wasm',
      'reasoning_engine.wasm'
    ];
    
    const expectedFiles = [
      'reasoning_engine.wasm',
      'neuromorphic.wasm', 
      'cma_neural_os.wasm',
      'llama_bridge.wasm',
      'hybrid_intelligence.wasm',
      'fused_kernels.wasm',
      'hybrid_orchestrator.wasm'
    ];
    
    results.push('🔍 TESTING ALL POSSIBLE PATH VARIATIONS:');
    results.push('');
    
    for (const file of expectedFiles) {
      results.push(`📁 Testing: ${file}`);
      
      for (const basePath of ['/wasm/', '/public/wasm/', 'wasm/', './wasm/']) {
        const fullPath = basePath + file;
        
        try {
          const response = await fetch(fullPath, { method: 'HEAD' });
          
          if (response.ok) {
            const size = response.headers.get('content-length');
            const sizeKB = size ? Math.round(parseInt(size) / 1024) : 0;
            
            if (sizeKB > 100) {
              results.push(`  ✅ FOUND REAL: ${fullPath} (${sizeKB}KB)`);
            } else {
              results.push(`  🎭 FOUND FAKE: ${fullPath} (${sizeKB}KB)`);
            }
          } else {
            results.push(`  ❌ NOT FOUND: ${fullPath} (HTTP ${response.status})`);
          }
        } catch (error) {
          results.push(`  💥 ERROR: ${fullPath} - ${error}`);
        }
      }
      results.push('');
    }
    
    results.push('🎯 SUMMARY OF WHAT LOVABLE CAN SEE:');
    results.push('If NOTHING shows as "FOUND REAL" above, then Lovable');
    results.push('is running in a sandbox that cannot see your public/ directory!');
    results.push('');
    
    results.push('💊 POSSIBLE SOLUTIONS:');
    results.push('1. Lovable cache issue - hard refresh (Ctrl+Shift+R)');
    results.push('2. Lovable is sandboxed - files need to be in different location');
    results.push('3. Lovable sync is completely broken - need manual intervention');
    results.push('4. Browser security blocking file access');
    
    setDiagnostics(results);
    setIsRunning(false);
  };

  const testSpecificLocations = async () => {
    setIsRunning(true);
    const results: string[] = [];
    
    results.push('🎯 TESTING SPECIFIC LOCATIONS LOVABLE MIGHT USE:');
    results.push('================================================');
    
    // Test locations that Lovable might actually serve from
    const lovableSpecificPaths = [
      // Standard web paths
      '/wasm/reasoning_engine.wasm',
      '/assets/wasm/reasoning_engine.wasm',
      '/static/wasm/reasoning_engine.wasm',
      
      // Build output paths
      '/dist/wasm/reasoning_engine.wasm',
      '/build/wasm/reasoning_engine.wasm',
      
      // Vite specific paths
      '/src/wasm/reasoning_engine.wasm',
      '/src/assets/wasm/reasoning_engine.wasm',
      
      // Absolute URLs (if served from different domain)
      `${window.location.origin}/wasm/reasoning_engine.wasm`,
      `${window.location.origin}/public/wasm/reasoning_engine.wasm`,
    ];
    
    for (const path of lovableSpecificPaths) {
      try {
        results.push(`🔍 Testing: ${path}`);
        
        const response = await fetch(path, { method: 'HEAD' });
        
        if (response.ok) {
          const size = response.headers.get('content-length');
          const contentType = response.headers.get('content-type');
          const lastModified = response.headers.get('last-modified');
          
          results.push(`  ✅ SUCCESS!`);
          results.push(`     Size: ${size} bytes`);
          results.push(`     Type: ${contentType}`);
          results.push(`     Modified: ${lastModified}`);
          
          // Check if it's real or fake
          const sizeNum = parseInt(size || '0');
          if (sizeNum > 100000) {
            results.push(`  🎉 THIS IS A REAL FILE! (${Math.round(sizeNum/1024)}KB)`);
          } else {
            results.push(`  🎭 This is a stub/fake file (${sizeNum} bytes)`);
          }
        } else {
          results.push(`  ❌ Not found (HTTP ${response.status})`);
        }
        results.push('');
      } catch (error) {
        results.push(`  💥 Error: ${error}`);
        results.push('');
      }
    }
    
    setDiagnostics(results);
    setIsRunning(false);
  };

  return (
    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-red-900">🚨 NUCLEAR FILE SYSTEM DIAGNOSTIC</h2>
        <div className="space-x-2">
          <button
            onClick={runNuclearDiagnostic}
            disabled={isRunning}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            {isRunning ? '🔄 Nuclear Scan...' : '🚨 Nuclear Scan'}
          </button>
          <button
            onClick={testSpecificLocations}
            disabled={isRunning}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400"
          >
            {isRunning ? '🔄 Testing...' : '🎯 Test Lovable Paths'}
          </button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded">
        <h3 className="font-semibold text-red-900 mb-2">🔥 THE SITUATION</h3>
        <p className="text-red-800 text-sm">
          You successfully copied 7 REAL WASM files (141KB reasoning_engine, 284KB neuromorphic, etc.) 
          to public/wasm/ but Lovable STILL can't see them. This diagnostic will find out WHY.
        </p>
      </div>

      {diagnostics.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">🔍 Nuclear Diagnostic Results</h3>
          <pre className="text-xs whitespace-pre-wrap font-mono">
            {diagnostics.join('\n')}
          </pre>
        </div>
      )}

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-900 mb-2">🎯 What This Will Tell Us</h4>
        <div className="text-yellow-800 text-sm space-y-1">
          <p>• Whether Lovable can see ANY of your copied files</p>
          <p>• Which exact paths Lovable uses for file serving</p>
          <p>• If this is a caching issue vs a fundamental access problem</p>
          <p>• Whether we need to copy files to a different location</p>
        </div>
      </div>
    </div>
  );
};

export default LovableFileSystemDiagnostic;
