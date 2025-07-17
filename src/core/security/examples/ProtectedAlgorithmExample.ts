
import { ProtectedCode } from '../ProtectedCode';

/**
 * Example of using the ProtectedCode system to protect critical algorithms
 * from reverse engineering. This is just a demonstration - in practice you
 * would protect your actual critical algorithms.
 */

// Example 1: Protected Function
// This algorithm will be encrypted at rest and only decrypted when executed
const calculateInnovation = ProtectedCode.createProtectedFunction(
  'innovation-algorithm-v1',
  (parameters: any) => {
    // Your critical algorithm implementation
    console.log('Executing protected innovation algorithm');
    
    const result = {
      probability: 0.87,
      confidence: 0.92,
      timeEstimate: '3.5 months',
      factors: {
        innovation: 0.85,
        market: 0.76,
        technical: 0.94
      }
    };
    
    return result;
  }
);

// Example 2: Protected Class
// This entire class implementation will be encrypted at rest
const ProtectedIntelligenceAnalyzer = ProtectedCode.createProtectedClass(
  'intelligence-analyzer-v2',
  class IntelligenceAnalyzer {
    private data: any;
    
    constructor(initialData: any) {
      this.data = initialData;
      console.log('Protected IntelligenceAnalyzer instantiated');
    }
    
    analyze() {
      // Critical proprietary algorithm
      console.log('Running protected intelligence analysis');
      
      return {
        insights: [
          { type: 'emergent_pattern', confidence: 0.89, details: '...' },
          { type: 'anomaly_cluster', confidence: 0.76, details: '...' }
        ],
        summary: 'Protected analysis complete'
      };
    }
    
    static getCapabilities() {
      return ['pattern_recognition', 'anomaly_detection', 'trend_analysis'];
    }
  }
);

// Example 3: Protected Value
// This critical configuration or secret value will be encrypted at rest
const getApiEndpoints = ProtectedCode.createProtectedValue(
  'api-endpoints-config-v1',
  {
    authEndpoint: 'https://api.example.com/auth',
    dataEndpoint: 'https://api.example.com/data',
    analyticsEndpoint: 'https://api.example.com/analytics',
    apiKey: 'k_prod_1a2b3c4d5e6f7g8h' // This would be protected
  }
);

// Export the protected items - note that they appear as normal functions/classes
// but their implementation is encrypted at rest
export {
  calculateInnovation,
  ProtectedIntelligenceAnalyzer,
  getApiEndpoints
};
