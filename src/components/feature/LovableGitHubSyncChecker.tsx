
import React, { useState } from 'react';

const LovableGitHubSyncChecker = () => {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkLovableFiles = async () => {
    setIsChecking(true);
    const results: string[] = [];
    
    results.push('🔍 LOVABLE ENVIRONMENT FILE CHECK');
    results.push('=====================================');
    results.push('Checking what files Lovable actually has access to...');
    results.push('');
    
    // Check the web-served files (what the dashboard checks)
    const wasmFiles = [
      'reasoning_engine.wasm',
      'neuromorphic.wasm', 
      'cma_neural_os.wasm',
      'llama_bridge.wasm',
      'hybrid_intelligence.wasm',
      'fused_kernels.wasm'
    ];
    
    for (const file of wasmFiles) {
      try {
        const response = await fetch(`/wasm/${file}`, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        const size = contentLength ? parseInt(contentLength) : 0;
        
        if (size > 1000) {
          results.push(`✅ REAL: /wasm/${file} (${Math.round(size/1024)}KB)`);
        } else {
          results.push(`🎭 FAKE: /wasm/${file} (${size} bytes)`);
        }
      } catch (error) {
        results.push(`❌ ERROR: /wasm/${file} - ${error}`);
      }
    }
    
    results.push('');
    results.push('🔄 CHECKING RUST SOURCE DIRECTORIES...');
    
    // Try to check if we can access the Rust build artifacts
    // Note: This might not work since we can't directly access file system in browser
    try {
      const response = await fetch('/src/rust/reasoning_engine/pkg/reasoning_engine_bg.wasm', { method: 'HEAD' });
      if (response.ok) {
        const size = response.headers.get('content-length');
        results.push(`✅ Found Rust build artifact: ${size ? Math.round(parseInt(size)/1024) + 'KB' : 'unknown size'}`);
      } else {
        results.push(`❌ Rust build artifact not accessible via web (${response.status})`);
      }
    } catch (error) {
      results.push(`❌ Cannot access Rust build artifacts via web`);
    }
    
    results.push('');
    results.push('🎯 DIAGNOSIS:');
    results.push('If files show as FAKE above but you pushed real files to GitHub,');
    results.push('then Lovable has not synced properly with GitHub yet.');
    results.push('');
    results.push('💡 SOLUTIONS:');
    results.push('1. Wait a few minutes for GitHub sync');
    results.push('2. Trigger a manual refresh/rebuild');
    results.push('3. Copy files from pkg/ to public/wasm/ inside Lovable');
    
    setDiagnostics(results);
    setIsChecking(false);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-yellow-900">🔄 Lovable ↔ GitHub Sync Checker</h2>
        <button
          onClick={checkLovableFiles}
          disabled={isChecking}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
        >
          {isChecking ? '🔄 Checking...' : '🔍 Check Lovable Files'}
        </button>
      </div>

      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <h3 className="font-semibold text-yellow-900 mb-2">🎯 The Issue</h3>
        <p className="text-yellow-800 text-sm">
          You pushed real WASM files to GitHub, but Lovable is still seeing 0-byte files.
          This suggests a sync delay or issue between GitHub and Lovable's cloud environment.
        </p>
      </div>

      {diagnostics.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">🔍 Lovable Environment Check</h3>
          <pre className="text-xs whitespace-pre-wrap font-mono">
            {diagnostics.join('\n')}
          </pre>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-semibold text-blue-900 mb-2">🚀 If Sync Is Broken</h4>
        <div className="text-blue-800 text-sm space-y-2">
          <p>1. <strong>Force refresh:</strong> Try closing and reopening Lovable</p>
          <p>2. <strong>Manual copy:</strong> We might need to copy from pkg/ to public/wasm/ inside Lovable</p>
          <p>3. <strong>Rebuild:</strong> Compile the Rust code directly in Lovable's environment</p>
        </div>
      </div>
    </div>
  );
};

export default LovableGitHubSyncChecker;
