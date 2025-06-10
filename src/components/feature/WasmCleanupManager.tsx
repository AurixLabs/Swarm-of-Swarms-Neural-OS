
import React, { useState } from 'react';

const WasmCleanupManager = () => {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runComprehensiveDiagnostics = async () => {
    setIsRunning(true);
    const results: string[] = [];
    
    results.push('🔥 WASM DIAGNOSTICS - WEB-SERVED FILES ONLY!');
    results.push('=============================================');
    results.push('🎯 Checking ONLY /wasm/ directory (web-served files)');
    results.push('');
    
    // Check ONLY the web-served WASM files
    const coreModules = [
      'cma_neural_os',
      'neuromorphic', 
      'llama_bridge',
      'hybrid_intelligence',
      'reasoning_engine',
      'fused_kernels'
    ];
    
    let foundValid = 0;
    let foundEmpty = 0;
    let foundMissing = 0;
    
    for (const module of coreModules) {
      const path = `/wasm/${module}.wasm`;
      
      try {
        const response = await fetch(path, { method: 'HEAD' });
        if (response.ok) {
          const size = response.headers.get('content-length');
          const sizeNum = parseInt(size || '0');
          
          if (sizeNum > 1000) {
            results.push(`✅ VALID: ${module}.wasm (${Math.round(sizeNum/1024)}KB)`);
            foundValid++;
          } else {
            results.push(`🎭 FAKE: ${module}.wasm (${sizeNum} bytes - empty/stub)`);
            foundEmpty++;
          }
        } else {
          results.push(`❌ MISSING: ${module}.wasm (${response.status})`);
          foundMissing++;
        }
      } catch (error) {
        results.push(`❌ ERROR: ${module}.wasm - ${error}`);
        foundMissing++;
      }
    }
    
    results.push('');
    results.push('📊 WEB-SERVED FILES SUMMARY:');
    results.push(`✅ Valid WASM files: ${foundValid}`);
    results.push(`🎭 Fake/Empty files: ${foundEmpty}`);
    results.push(`❌ Missing files: ${foundMissing}`);
    results.push('');
    
    if (foundValid === 0) {
      results.push('🚨 DIAGNOSIS: NO VALID WEB-SERVED WASM FILES!');
      results.push('💡 SOLUTION: Copy your REAL 138KB reasoning_engine_bg.wasm');
      results.push('   FROM: src/rust/reasoning_engine/pkg/reasoning_engine_bg.wasm');
      results.push('   TO: public/wasm/reasoning_engine.wasm');
      results.push('');
      results.push('📋 POWERSHELL COMMANDS TO RUN:');
      results.push('cd src\\rust\\reasoning_engine');
      results.push('Copy-Item "pkg\\reasoning_engine_bg.wasm" "..\\..\\..\\public\\wasm\\reasoning_engine.wasm"');
      results.push('Copy-Item "pkg\\reasoning_engine.js" "..\\..\\..\\public\\wasm\\reasoning_engine.js"');
    } else {
      results.push(`🎉 SUCCESS! Found ${foundValid} valid web-served WASM files!`);
    }
    
    setDiagnostics(results);
    setIsRunning(false);
  };

  const showCopyInstructions = () => {
    const instructions = [
      '🔧 COPY YOUR REAL WASM FILES TO WEB DIRECTORY',
      '==============================================',
      '',
      '🎯 PROBLEM: Your 138KB WASM files are in build dirs, not web dirs',
      '🎯 SOLUTION: Copy them to public/wasm/ where the web can serve them',
      '',
      '📋 STEP-BY-STEP COPY PROCESS:',
      '',
      '1. 📁 Open PowerShell in your project root',
      '',
      '2. 🧠 Copy the REAL reasoning engine:',
      '   cd src\\rust\\reasoning_engine',
      '   Copy-Item "pkg\\reasoning_engine_bg.wasm" "..\\..\\..\\public\\wasm\\reasoning_engine.wasm"',
      '   Copy-Item "pkg\\reasoning_engine.js" "..\\..\\..\\public\\wasm\\reasoning_engine.js"',
      '',
      '3. ⚡ Copy neuromorphic processor:',
      '   cd ..\\neuromorphic',
      '   Copy-Item "pkg\\neuromorphic_bg.wasm" "..\\..\\..\\public\\wasm\\neuromorphic.wasm"',
      '   Copy-Item "pkg\\neuromorphic.js" "..\\..\\..\\public\\wasm\\neuromorphic.js"',
      '',
      '4. ✅ Verify files copied:',
      '   cd ..\\..\\..',
      '   Get-Item "public\\wasm\\*.wasm" | Select-Object Name, Length',
      '',
      '💡 WHY THIS WORKS:',
      '   - Build dirs (/src/rust/*/pkg/) = Rust compilation output',
      '   - Web dirs (/public/wasm/) = Files served to browser',
      '   - Dashboard checks web dirs (correct behavior)',
      '   - You need to bridge the gap by copying',
      '',
      '🚀 AFTER COPYING: Refresh this page and test modules!'
    ];
    
    setDiagnostics(instructions);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-900">🎯 WEB-SERVED WASM FILES CHECKER</h2>
        <div className="space-x-2">
          <button
            onClick={runComprehensiveDiagnostics}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isRunning ? '🔄 Checking Web Files...' : '🔍 Check /wasm/ Directory'}
          </button>
          <button
            onClick={showCopyInstructions}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            📋 Show Copy Instructions
          </button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 CORRECT BEHAVIOR: Checking Web-Served Files</h3>
        <p className="text-blue-800 text-sm">
          This dashboard correctly checks <strong>/wasm/</strong> directory (mapped to public/wasm/). 
          These are the files your web application actually serves to browsers.
          <br /><br />
          <strong>Build files</strong> in /src/rust/ are NOT web-accessible and should NOT be checked.
        </p>
      </div>

      {diagnostics.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">🔍 Web-Served Files Status</h3>
          <pre className="text-xs whitespace-pre-wrap font-mono">
            {diagnostics.join('\n')}
          </pre>
        </div>
      )}

      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
        <h4 className="font-semibold text-green-900 mb-2">🚀 Quick Fix Command</h4>
        <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
          <div>cd src\rust\reasoning_engine</div>
          <div>Copy-Item "pkg\reasoning_engine_bg.wasm" "..\..\..\public\wasm\reasoning_engine.wasm"</div>
        </div>
      </div>
    </div>
  );
};

export default WasmCleanupManager;
