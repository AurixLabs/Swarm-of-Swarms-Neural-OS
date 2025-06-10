
import React, { useState } from 'react';

interface ProxyTestResult {
  success: boolean;
  data?: any;
  error?: string;
  method: string;
}

const HttpProxyTester = () => {
  const [testResults, setTestResults] = useState<ProxyTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testESP32Connection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    const testMethods = [
      { url: 'http://192.168.1.7/api/functions', method: 'Functions API' },
      { url: 'http://192.168.1.7/api/status', method: 'Status API' },
      { url: 'http://192.168.1.7/', method: 'Root Endpoint' },
      { url: 'http://192.168.1.7/api/led?state=blink', method: 'LED Control' }
    ];

    const results: ProxyTestResult[] = [];

    for (const test of testMethods) {
      try {
        console.log(`🔍 Testing ${test.method} at ${test.url}`);
        
        // Try with no-cors mode to bypass CORS restrictions
        const response = await fetch(test.url, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache'
        });

        // For no-cors, we can't read the response but can check if it succeeded
        if (response.type === 'opaque') {
          results.push({
            success: true,
            method: test.method,
            data: 'Connection successful (no-cors mode)'
          });
          console.log(`✅ ${test.method} - Connection successful`);
        } else {
          const data = await response.text();
          results.push({
            success: true,
            method: test.method,
            data: data
          });
          console.log(`✅ ${test.method} - Full response received`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          success: false,
          method: test.method,
          error: errorMessage
        });
        console.log(`❌ ${test.method} - Failed: ${errorMessage}`);
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const openManualTest = () => {
    window.open('http://192.168.1.7', '_blank');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">
        🔧 HTTP Proxy Tester - ESP32 Connection
      </h2>
      
      <div className="mb-6">
        <div className="flex gap-3 mb-3">
          <button
            onClick={testESP32Connection}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
          >
            {isLoading ? '🔍 Testing ESP32...' : '🚀 Test ESP32 Connection'}
          </button>
          
          <button
            onClick={openManualTest}
            className="px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            🌐 Open ESP32 in New Tab
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          This uses no-cors mode to bypass browser security restrictions
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Test Results:</h3>
          
          {testResults.map((result, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                  {result.success ? '✅' : '❌'}
                </span>
                <span className="font-medium">{result.method}</span>
              </div>
              
              {result.success ? (
                <div className="text-sm text-green-700">
                  <strong>Success:</strong> {result.data}
                </div>
              ) : (
                <div className="text-sm text-red-700">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold mb-2">💡 What This Does:</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <div>• Uses "no-cors" mode to bypass browser security</div>
          <div>• Tests all ESP32 endpoints we need</div>
          <div>• Shows which connections work vs fail</div>
          <div>• Opens manual browser test for comparison</div>
        </div>
      </div>
    </div>
  );
};

export default HttpProxyTester;
