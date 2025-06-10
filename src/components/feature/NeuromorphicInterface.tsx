
import React, { useState, useEffect } from 'react';
import { unifiedWasmLoader } from '../../core/wasm/UnifiedWasmLoader';

const NeuromorphicInterface = () => {
  const [spikingPattern, setSpikingPattern] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [patternHistory, setPatternHistory] = useState<Array<{pattern: number[], timestamp: number}>>([]);

  const generateSpikingPattern = async () => {
    setIsActive(true);
    
    try {
      console.log('⚡ Generating REAL neuromorphic spiking pattern - NO FALLBACKS...');
      
      // Check if module is actually loaded - NO FALLBACKS
      if (!unifiedWasmLoader.isLoaded('neuromorphic')) {
        throw new Error('NEUROMORPHIC MODULE NOT LOADED - NO FALLBACKS ALLOWED');
      }
      
      // Try to use the REAL neuromorphic module - NO FALLBACKS
      const module = unifiedWasmLoader.getModule('neuromorphic');
      if (!module || !module.generate_spikes) {
        throw new Error('NEUROMORPHIC MODULE MISSING generate_spikes FUNCTION - NO FALLBACKS ALLOWED');
      }
      
      // Execute REAL WASM function - NO FALLBACKS
      const pattern = module.generate_spikes(50);
      
      if (!pattern || !Array.isArray(pattern)) {
        throw new Error('NEUROMORPHIC MODULE RETURNED INVALID DATA - NO FALLBACKS ALLOWED');
      }
      
      setSpikingPattern(pattern);
      setPatternHistory(prev => [{
        pattern: pattern,
        timestamp: Date.now()
      }, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('❌ NEUROMORPHIC GENERATION FAILED - NO FALLBACKS:', error);
      throw error; // Re-throw to show in UI
    } finally {
      setIsActive(false);
    }
  };

  // Check if neuromorphic module is actually loaded - NO FALLBACKS
  const isModuleLoaded = unifiedWasmLoader.isLoaded('neuromorphic');

  if (!isModuleLoaded) {
    return (
      <div className="bg-red-100 border border-red-500 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
          <h2 className="text-xl font-bold text-red-900">❌ Neuromorphic Module NOT LOADED</h2>
        </div>
        <div className="text-red-800">
          <p className="font-bold">NO FALLBACKS ALLOWED - SYSTEM REQUIRES REAL WASM MODULE!</p>
          <p className="mt-2">neuromorphic.wasm must be loaded for this component to function.</p>
          <p className="mt-1">Either the file is missing or failed to compile properly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
          <h2 className="text-xl font-bold text-gray-900">⚡ REAL Neuromorphic Brain</h2>
        </div>
        <button
          onClick={generateSpikingPattern}
          disabled={isActive}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
        >
          {isActive ? '🔄 REAL Generating...' : '⚡ REAL Generate (NO FALLBACKS)'}
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">REAL Spiking Pattern from WASM</h3>
          <div className="bg-black rounded-md p-4 min-h-[100px] flex items-end">
            {spikingPattern.map((spike, index) => (
              <div
                key={index}
                className={`w-2 mx-px rounded-t ${spike ? 'bg-green-400' : 'bg-gray-600'}`}
                style={{ 
                  height: spike ? `${Math.random() * 80 + 20}%` : '5%',
                  transition: 'height 0.2s ease'
                }}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Active spikes: {spikingPattern.filter(s => s === 1).length} / {spikingPattern.length}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">REAL Pattern Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-lg font-bold text-purple-600">
                {spikingPattern.length > 0 ? ((spikingPattern.filter(s => s === 1).length / spikingPattern.length) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-gray-600">REAL Spike Density</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-lg font-bold text-blue-600">
                {patternHistory.length}
              </div>
              <div className="text-xs text-gray-600">REAL Patterns Generated</div>
            </div>
          </div>
        </div>
        
        {patternHistory.length > 1 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">REAL Pattern History</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {patternHistory.slice(1, 6).map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <span className="text-gray-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="flex">
                    {item.pattern.slice(0, 20).map((spike, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 mr-px ${spike ? 'bg-green-400' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuromorphicInterface;
