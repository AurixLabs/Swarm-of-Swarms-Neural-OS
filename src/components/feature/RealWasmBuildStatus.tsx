
import React, { useState } from 'react';

const RealWasmBuildStatus = () => {
  const [buildStatus, setBuildStatus] = useState<string>('');
  const [isBuilding, setIsBuilding] = useState(false);

  const startRealBuild = async () => {
    setIsBuilding(true);
    setBuildStatus('🔥 REAL BUILD INSTRUCTIONS:\n\n1. Open terminal/PowerShell in project root\n2. Run: cd src/rust/reasoning_engine\n3. Run: wasm-pack build --target web --release\n4. Run: mkdir -p ../../../public/wasm/ (create directory if needed)\n5. Run: cp pkg/reasoning_engine_bg.wasm ../../../public/wasm/reasoning_engine.wasm\n6. Refresh this page!\n\n🚨 IMPORTANT: Make sure ALL commands succeed before testing!');
    setIsBuilding(false);
  };

  const checkWasmFile = async () => {
    try {
      setBuildStatus('🔍 Checking if REAL WASM file exists...');
      
      const response = await fetch('/wasm/reasoning_engine.wasm');
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      console.log('🔥 DETAILED WASM FILE CHECK:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        contentLength,
        url: response.url,
        ok: response.ok
      });
      
      if (!response.ok) {
        setBuildStatus(`❌ WASM FILE NOT FOUND!\nHTTP Status: ${response.status} ${response.statusText}\nURL: ${response.url}\n\n🔧 THE FILE DOESN'T EXIST!\n\nTO FIX:\n1. Make sure you built the WASM: cd src/rust/reasoning_engine && wasm-pack build --target web --release\n2. Check if pkg/reasoning_engine_bg.wasm exists\n3. Copy it: cp pkg/reasoning_engine_bg.wasm ../../../public/wasm/reasoning_engine.wasm\n4. Verify the copy worked!`);
        return;
      }
      
      if (contentType && (contentType.includes('text/html') || contentType.includes('text/plain'))) {
        const text = await response.text();
        const preview = text.substring(0, 200);
        console.error(`🚨 [RealWASM] Got HTML instead of WASM! Preview:`, preview);
        setBuildStatus(`❌ INVALID WASM DETECTED!\nContent-Type: ${contentType}\nContent-Length: ${contentLength}\n\nFirst 200 chars:\n${preview}\n\n🔧 THE SERVER IS RETURNING HTML INSTEAD OF WASM!\n\nThis means the file wasn't copied to public/wasm/ correctly!\n\nTO FIX:\n1. cd src/rust/reasoning_engine\n2. ls pkg/ (check if reasoning_engine_bg.wasm exists)\n3. mkdir -p ../../../public/wasm/\n4. cp pkg/reasoning_engine_bg.wasm ../../../public/wasm/reasoning_engine.wasm\n5. ls ../../../public/wasm/ (verify the file was copied)`);
        return;
      }

      const bytes = await response.arrayBuffer();
      console.log(`📦 [RealWASM] Got ${bytes.byteLength} bytes`);

      // Check if we got HTML as binary (fallback detection)
      if (bytes.byteLength > 0) {
        const firstBytes = new Uint8Array(bytes.slice(0, 50));
        const text = new TextDecoder().decode(firstBytes);
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          console.error(`🚨 [RealWASM] Binary content is actually HTML! First 50 bytes:`, text);
          setBuildStatus(`❌ INVALID WASM DETECTED!\nFile size: ${bytes.byteLength} bytes\nBut content is HTML!\n\nFirst 50 bytes as text:\n${text}\n\n🔧 THE FILE EXISTS BUT CONTAINS HTML!\n\nThis usually means:\n1. The build failed silently\n2. You copied the wrong file\n3. The server is serving a 404 page instead of the WASM\n\nTO DEBUG:\n1. cd src/rust/reasoning_engine\n2. cat pkg/reasoning_engine_bg.wasm | head -c 20 | xxd\n3. Should show: 00000000: 0061 736d 0100 0000 (WASM magic)\n4. If not, rebuild: wasm-pack build --target web --release`);
          return;
        }
      }

      // Validate REAL WASM magic number
      if (bytes.byteLength < 8) {
        setBuildStatus(`❌ WASM FILE TOO SMALL!\nSize: ${bytes.byteLength} bytes\nContent-Type: ${contentType}\n\nA real WASM file should be at least 8 bytes and start with magic number!\n\nTO FIX:\n1. Rebuild the WASM: wasm-pack build --target web --release\n2. Check file size: ls -la pkg/reasoning_engine_bg.wasm\n3. Copy again: cp pkg/reasoning_engine_bg.wasm ../../../public/wasm/reasoning_engine.wasm`);
        return;
      }
      
      const magicBytes = new Uint8Array(bytes.slice(0, 4));
      const expectedMagic = [0x00, 0x61, 0x73, 0x6D]; // '\0asm'
      
      const magicHex = Array.from(magicBytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
      const expectedHex = expectedMagic.map(b => b.toString(16).padStart(2, '0')).join(' ');
      
      for (let i = 0; i < 4; i++) {
        if (magicBytes[i] !== expectedMagic[i]) {
          setBuildStatus(`❌ INVALID WASM MAGIC NUMBER!\nExpected: [${expectedHex}]\nActual:   [${magicHex}]\nSize: ${bytes.byteLength} bytes\nContent-Type: ${contentType}\n\n🔧 THE FILE IS CORRUPTED OR NOT VALID WASM!\n\nTO FIX:\n1. Delete the invalid file: rm ../../../public/wasm/reasoning_engine.wasm\n2. Rebuild: wasm-pack build --target web --release\n3. Verify build: xxd -l 8 pkg/reasoning_engine_bg.wasm\n4. Should show: 00000000: 0061 736d 0100 0000\n5. Copy: cp pkg/reasoning_engine_bg.wasm ../../../public/wasm/reasoning_engine.wasm`);
          return;
        }
      }

      setBuildStatus(`✅ VALID WASM FILE CONFIRMED!\n📊 Size: ${bytes.byteLength} bytes\n🔥 Magic number: [${magicHex}] ✓\n📋 Content-Type: ${contentType}\n🎯 Status: ${response.status} ${response.statusText}\n\n🎉 WASM file is valid and ready for testing!`);
      
    } catch (error) {
      console.error('❌ WASM file check failed:', error);
      setBuildStatus(`❌ ERROR CHECKING WASM FILE!\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\n🔧 NETWORK OR FILE SYSTEM ERROR!\n\nTO FIX:\n1. Make sure you're in the project directory\n2. Check if public/wasm/ directory exists: ls public/wasm/\n3. Check if file exists: ls -la public/wasm/reasoning_engine.wasm\n4. If missing, build and copy: \n   cd src/rust/reasoning_engine\n   wasm-pack build --target web --release\n   cp pkg/reasoning_engine_bg.wasm ../../../public/wasm/reasoning_engine.wasm`);
    }
  };

  return (
    <div className="p-6 bg-yellow-50 rounded-lg shadow-lg max-w-2xl mx-auto mb-6">
      <h2 className="text-2xl font-bold mb-4 text-orange-600">🔥 REAL WASM BUILD STATUS</h2>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={startRealBuild}
          disabled={isBuilding}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400"
        >
          {isBuilding ? 'Checking...' : '🔥 Get Build Instructions'}
        </button>
        
        <button
          onClick={checkWasmFile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔍 Deep WASM File Check
        </button>
      </div>
      
      {buildStatus && (
        <div className="mt-4 p-4 bg-white rounded-md border">
          <h3 className="font-bold mb-2">🔥 Diagnostic Status:</h3>
          <pre className="text-sm whitespace-pre-wrap break-words font-mono">{buildStatus}</pre>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-red-100 rounded">
        <div className="text-sm font-medium mb-1">🚨 EXACT COPY COMMANDS:</div>
        <div className="text-xs text-gray-700 font-mono bg-gray-50 p-2 rounded mb-2">
          <div>cd src/rust/reasoning_engine</div>
          <div>wasm-pack build --target web --release</div>
          <div>mkdir -p ../../../public/wasm/</div>
          <div>cp pkg/reasoning_engine_bg.wasm ../../../public/wasm/reasoning_engine.wasm</div>
        </div>
        <div className="text-xs text-gray-600">
          Run these commands ONE BY ONE and check that each succeeds before running the next!
        </div>
      </div>
    </div>
  );
};

export default RealWasmBuildStatus;
