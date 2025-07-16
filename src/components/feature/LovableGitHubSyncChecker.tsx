
import React, { useState } from 'react';
import { Button } from '../ui/button';

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
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">GitHub Sync Checker</h2>
        <Button
          onClick={checkLovableFiles}
          disabled={isChecking}
          variant="default"
        >
          {isChecking ? 'Checking...' : 'Check Files'}
        </Button>
      </div>

      <div className="mb-4 p-4 bg-muted rounded border">
        <h3 className="font-semibold mb-2">Sync Status</h3>
        <p className="text-muted-foreground text-sm">
          Verify that WASM files pushed to GitHub are properly synced to the Lovable environment.
          This helps identify sync delays or accessibility issues.
        </p>
      </div>

      {diagnostics.length > 0 && (
        <div className="bg-muted rounded p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Environment Check Results</h3>
          <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
            {diagnostics.join('\n')}
          </pre>
        </div>
      )}

      <div className="mt-4 p-4 bg-secondary rounded">
        <h4 className="font-semibold mb-2">Troubleshooting</h4>
        <div className="text-muted-foreground text-sm space-y-2">
          <p>• <strong>Force refresh:</strong> Close and reopen Lovable</p>
          <p>• <strong>Manual copy:</strong> Copy from pkg/ to public/wasm/</p>
          <p>• <strong>Rebuild:</strong> Compile Rust code in Lovable environment</p>
        </div>
      </div>
    </div>
  );
};

export default LovableGitHubSyncChecker;
