
import React, { useState } from 'react';

interface DiagnosticResult {
  test: string;
  result: 'success' | 'failed' | 'testing';
  details: string;
  method: string;
}

const NetworkDiagnostic = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, result: 'success' | 'failed', details: string, method: string) => {
    setResults(prev => [...prev, { test, result, details, method }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Basic fetch with different modes
    addResult('Basic Fetch Test', 'testing', 'Starting basic fetch...', 'fetch');
    try {
      const response = await fetch('http://192.168.1.7/', {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      if (response.type === 'opaque') {
        addResult('Basic Fetch Test', 'success', 'Connection successful (opaque response)', 'fetch no-cors');
      } else {
        addResult('Basic Fetch Test', 'success', `Status: ${response.status}`, 'fetch no-cors');
      }
    } catch (error) {
      addResult('Basic Fetch Test', 'failed', `Error: ${error}`, 'fetch no-cors');
    }

    // Test 2: WebSocket connection test
    addResult('WebSocket Test', 'testing', 'Testing WebSocket connection...', 'websocket');
    try {
      const ws = new WebSocket('ws://192.168.1.7:80');
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('WebSocket timeout'));
        }, 5000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          addResult('WebSocket Test', 'success', 'WebSocket connection established', 'websocket');
          resolve(true);
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          addResult('WebSocket Test', 'failed', 'WebSocket connection failed', 'websocket');
          reject(error);
        };
      });
    } catch (error) {
      addResult('WebSocket Test', 'failed', `WebSocket error: ${error}`, 'websocket');
    }

    // Test 3: Image loading test (bypasses CORS)
    addResult('Image Load Test', 'testing', 'Testing via image load...', 'image');
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          addResult('Image Load Test', 'failed', 'Image load timeout', 'image');
          reject(new Error('Timeout'));
        }, 5000);

        img.onload = () => {
          clearTimeout(timeout);
          addResult('Image Load Test', 'success', 'Server responded to image request', 'image');
          resolve(true);
        };

        img.onerror = () => {
          clearTimeout(timeout);
          addResult('Image Load Test', 'failed', 'Image load failed (but server might be responding)', 'image');
          resolve(true); // This is actually good - server responded with error
        };

        img.src = 'http://192.168.1.7/favicon.ico?' + Date.now();
      });
    } catch (error) {
      addResult('Image Load Test', 'failed', `Image test error: ${error}`, 'image');
    }

    // Test 4: Script loading test
    addResult('Script Load Test', 'testing', 'Testing via script loading...', 'script');
    try {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        const timeout = setTimeout(() => {
          document.head.removeChild(script);
          addResult('Script Load Test', 'failed', 'Script load timeout', 'script');
          resolve(false);
        }, 5000);

        script.onload = () => {
          clearTimeout(timeout);
          document.head.removeChild(script);
          addResult('Script Load Test', 'success', 'Script loaded (server responding)', 'script');
          resolve(true);
        };

        script.onerror = () => {
          clearTimeout(timeout);
          document.head.removeChild(script);
          addResult('Script Load Test', 'failed', 'Script failed but server responded', 'script');
          resolve(true);
        };

        script.src = `${window.location.protocol}//${window.location.hostname}:80/api/status?${Date.now()}`;
        document.head.appendChild(script);
      });
    } catch (error) {
      addResult('Script Load Test', 'failed', `Script test error: ${error}`, 'script');
    }

    setIsRunning(false);
  };

  const openManualTest = () => {
    // Try multiple ways to open the ESP32
    window.open('http://192.168.1.7', '_blank');
    window.open('http://192.168.1.7:80', '_blank');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-purple-600">
        🔬 Network Diagnostic Tool
      </h2>
      
      <div className="mb-6">
        <div className="flex gap-3 mb-3">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="px-6 py-3 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 font-semibold"
          >
            {isRunning ? '🔍 Running Diagnostics...' : '🚀 Run Network Diagnostics'}
          </button>
          
          <button
            onClick={openManualTest}
            className="px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🌐 Open ESP32 (Multiple Methods)
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          This tool tests multiple ways to connect to your ESP32, bypassing browser security
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Diagnostic Results:</h3>
          
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border ${
                result.result === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : result.result === 'testing'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={
                  result.result === 'success' ? 'text-green-600' : 
                  result.result === 'testing' ? 'text-yellow-600' :
                  'text-red-600'
                }>
                  {result.result === 'success' ? '✅' : 
                   result.result === 'testing' ? '🔄' : '❌'}
                </span>
                <span className="font-medium">{result.test}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{result.method}</span>
              </div>
              
              <div className="text-sm text-gray-700">
                {result.details}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <h4 className="font-semibold mb-2">💡 What This Tests:</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <div>• <strong>Fetch Test:</strong> Standard HTTP request (what our scanner uses)</div>
          <div>• <strong>WebSocket Test:</strong> Alternative connection method</div>
          <div>• <strong>Image Load:</strong> Bypasses CORS completely</div>
          <div>• <strong>Script Load:</strong> Another CORS bypass method</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkDiagnostic;
