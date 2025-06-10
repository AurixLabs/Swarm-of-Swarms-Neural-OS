import * as crypto from 'crypto-js';
import { IntentBasedIdentityVerifier } from './IntentBasedIdentityVerifier';

/**
 * HardwareFingerprinter
 * 
 * Creates a unique hardware signature that identifies authorized environments.
 * This makes it difficult to run the software in unauthorized environments.
 */
export class HardwareFingerprinter {
  private fingerprintCache: string | null = null;
  private lastComputeTime: number = 0;
  private readonly CACHE_DURATION_MS = 3600000; // 1 hour
  
  /**
   * Generate a comprehensive hardware fingerprint
   * This collects various hardware/environment characteristics
   * that are difficult to spoof completely
   */
  public generateFingerprint(): string {
    // Check if we have a cached fingerprint that's still valid
    const now = Date.now();
    if (this.fingerprintCache && (now - this.lastComputeTime) < this.CACHE_DURATION_MS) {
      return this.fingerprintCache;
    }
    
    // Collect hardware/environment characteristics
    const components: string[] = [];
    
    // Browser and OS information
    components.push(navigator.userAgent);
    
    // Screen characteristics
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
    
    // Hardware concurrency (CPU cores)
    components.push(`cores:${navigator.hardwareConcurrency || 'unknown'}`);
    
    // Language and timezone
    components.push(`lang:${navigator.language}`);
    components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    
    // Canvas fingerprinting (creates a unique signature based on GPU/graphics)
    components.push(this.getCanvasFingerprint());
    
    // WebGL fingerprinting (hardware-specific rendering characteristics)
    components.push(this.getWebGLFingerprint());
    
    // Audio context fingerprinting
    components.push(this.getAudioFingerprint());
    
    // Browser plugins and features
    components.push(this.getFeatureSupport());
    
    // Local storage persistence test
    components.push(this.getStorageConsistency());
    
    // Generate the fingerprint using multiple hashing to make it harder to reverse
    const rawFingerprint = components.join('::');
    const stage1 = crypto.SHA256(rawFingerprint).toString();
    const stage2 = crypto.RIPEMD160(stage1).toString();
    const finalFingerprint = crypto.SHA512(stage2 + this.getSalt()).toString();
    
    // Cache the result
    this.fingerprintCache = finalFingerprint;
    this.lastComputeTime = now;
    
    return finalFingerprint;
  }
  
  /**
   * Generates a canvas fingerprint based on how the system renders graphics
   */
  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'canvas-unsupported';
      
      // Text with different styles
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#1a73e8';
      ctx.fillText('CMA Secure Environment', 5, 5);
      
      // Add shape with gradient
      const gradient = ctx.createLinearGradient(0, 0, 200, 0);
      gradient.addColorStop(0, 'red');
      gradient.addColorStop(1, 'blue');
      ctx.fillStyle = gradient;
      ctx.fillRect(10, 25, 180, 10);
      
      // Get the image data as a string
      return canvas.toDataURL().slice(-20);
    } catch (e) {
      return 'canvas-error';
    }
  }
  
  /**
   * Generates a WebGL fingerprint based on how the system handles 3D graphics
   */
  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'webgl-unsupported';
      
      // Explicitly type cast to WebGLRenderingContext
      const webGL = gl as WebGLRenderingContext;
      
      // Get WebGL renderer and vendor
      const debugInfo = webGL.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = webGL.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = webGL.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return `${vendor}-${renderer}`.replace(/\s+/g, '_');
      }
      
      return 'webgl-limited';
    } catch (e) {
      return 'webgl-error';
    }
  }
  
  /**
   * Generates a fingerprint based on audio processing characteristics
   */
  private getAudioFingerprint(): string {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return 'audio-unsupported';
      
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gain = context.createGain();
      
      gain.gain.value = 0; // Mute the sound
      oscillator.type = 'triangle';
      oscillator.connect(analyser);
      analyser.connect(gain);
      gain.connect(context.destination);
      
      oscillator.start(0);
      const buffer = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buffer);
      oscillator.stop(0);
      
      // Get a sample of the frequency data for fingerprinting
      let sum = 0;
      for (let i = 0; i < buffer.length; i += 100) {
        sum += buffer[i];
      }
      
      return sum.toString();
    } catch (e) {
      return 'audio-error';
    }
  }
  
  /**
   * Checks for support of various browser features
   */
  private getFeatureSupport(): string {
    const features = [
      'IndexedDB' in window,
      'SharedWorker' in window,
      'WebSocket' in window,
      'localStorage' in window,
      'Intl' in window,
      'MutationObserver' in window,
      'Promise' in window,
      'IntersectionObserver' in window,
      'WebAssembly' in window,
      'Proxy' in window
    ];
    
    return features.map(f => f ? '1' : '0').join('');
  }
  
  /**
   * Tests consistency of localStorage to detect private browsing modes
   */
  private getStorageConsistency(): string {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return 'storage-consistent';
    } catch (e) {
      return 'storage-restricted';
    }
  }
  
  /**
   * Creates a salt that changes weekly to prevent replay attacks
   * while remaining stable enough to not require constant reauthorization
   */
  private getSalt(): string {
    const now = new Date();
    const weekOfYear = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
    return `CMA-${weekOfYear}-${now.getFullYear()}`;
  }
  
  /**
   * Verifies if the current environment matches an authorized fingerprint
   */
  public verifyAuthorizedEnvironment(authorizedFingerprints: string[]): {
    authorized: boolean;
    confidence: number;
    details: any;
  } {
    const currentFingerprint = this.generateFingerprint();
    
    // Use the imported IntentBasedIdentityVerifier
    const intentVerification = IntentBasedIdentityVerifier.getInstance().verifyIdentity();
    
    // If the fingerprint exactly matches an authorized one
    if (authorizedFingerprints.includes(currentFingerprint)) {
      return {
        authorized: true,
        confidence: Math.min(1.0, intentVerification.confidence + 0.3),
        details: {
          matchType: 'exact',
          behavioralConfidence: intentVerification.confidence,
          timestamp: Date.now()
        }
      };
    }
    
    // If no exact match, check for similarity
    let highestSimilarity = 0;
    
    for (const authFingerprint of authorizedFingerprints) {
      const similarity = this.calculateSimilarity(currentFingerprint, authFingerprint);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
      }
      
      // If similarity is above threshold and behavior matches, consider it authorized
      if (highestSimilarity > 0.85 && intentVerification.confidence > 0.6) {
        return {
          authorized: true,
          confidence: (highestSimilarity + intentVerification.confidence) / 2,
          details: {
            matchType: 'partial',
            similarity: highestSimilarity,
            behavioralConfidence: intentVerification.confidence,
            timestamp: Date.now()
          }
        };
      }
    }
    
    // Not authorized
    return {
      authorized: false,
      confidence: 0,
      details: {
        highestSimilarity,
        behavioralConfidence: intentVerification.confidence,
        timestamp: Date.now()
      }
    };
  }
  
  /**
   * Calculate similarity between two fingerprints
   * Uses Levenshtein distance for string comparison
   */
  private calculateSimilarity(fp1: string, fp2: string): number {
    // Simplified similarity calculation for example purposes
    // In production, use a more sophisticated algorithm
    let matchingChars = 0;
    const minLength = Math.min(fp1.length, fp2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (fp1[i] === fp2[i]) {
        matchingChars++;
      }
    }
    
    return matchingChars / minLength;
  }
}

// Export singleton instance
export const hardwareFingerprinter = new HardwareFingerprinter();
