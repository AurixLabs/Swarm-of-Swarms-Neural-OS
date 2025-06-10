
import React from 'react';
import HttpProxyTester from '../components/feature/HttpProxyTester';
import RealHardwareChipDetector from '../components/feature/RealHardwareChipDetector';
import NetworkDiagnostic from '../components/feature/NetworkDiagnostic';
import ESP32DirectTester from '../components/feature/ESP32DirectTester';

const HttpProxyTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 ESP32-S3 Hardware Connection Tester
          </h1>
          <p className="text-gray-600">
            Advanced ESP32 scanner with CORS bypass tools
          </p>
        </div>

        {/* NEW: CORS Bypass Tester */}
        <ESP32DirectTester />
        
        {/* Separator */}
        <div className="my-8 border-t border-gray-300"></div>

        {/* Network Diagnostic Tool */}
        <NetworkDiagnostic />
        
        {/* Separator */}
        <div className="my-8 border-t border-gray-300"></div>

        {/* Enhanced Scanner */}
        <RealHardwareChipDetector />
        
        {/* Separator */}
        <div className="my-8 border-t border-gray-300"></div>
        
        {/* Original HTTP Tester */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">🔧 Basic HTTP Tester (Legacy)</h2>
          <HttpProxyTester />
        </div>
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">🚨 Network Troubleshooting</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div>• <strong>If CORS Bypass tests pass:</strong> Your ESP32 is working! Browser security is blocking normal requests</div>
            <div>• <strong>If manual browser test works:</strong> Definitely a CORS issue - ESP32 hardware is perfect</div>
            <div>• <strong>If all tests fail:</strong> Network connectivity issue between devices</div>
            <div>• <strong>Try:</strong> Different browser, disable antivirus temporarily, check router settings</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HttpProxyTestPage;
