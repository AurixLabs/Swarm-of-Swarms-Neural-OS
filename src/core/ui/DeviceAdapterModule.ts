
import { UIKernel } from './UIKernel';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  type: DeviceType;
  networkStatus: 'online' | 'offline' | 'slow';
  preferredColorScheme: 'light' | 'dark';
  reducedMotion: boolean;
  touchSupport: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  performanceGrade?: 'low' | 'medium' | 'high';
}

export interface DeviceAdapterOptions {
  simulateDevice?: DeviceType;
  enableTouchSupport?: boolean;
  enableGestureRecognition?: boolean;
}

/**
 * DeviceAdapterModule - Handles device-specific behavior and adaptations
 */
export class DeviceAdapterModule {
  private kernel: UIKernel;
  private deviceType: DeviceType;
  private touchSupport = false;
  private gestureRecognition = false;
  private deviceInfo: DeviceInfo;

  constructor(kernel: UIKernel, options: DeviceAdapterOptions = {}) {
    this.kernel = kernel;
    this.deviceType = this.detectDeviceType();
    this.touchSupport = options.enableTouchSupport ?? this.detectTouchSupport();
    this.gestureRecognition = options.enableGestureRecognition ?? false;
    
    // Initialize device info
    this.deviceInfo = {
      type: this.deviceType,
      networkStatus: navigator.onLine ? 'online' : 'offline',
      preferredColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      touchSupport: this.touchSupport,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      performanceGrade: this.estimatePerformanceGrade()
    };

    // Listen for online/offline events
    window.addEventListener('online', () => this.updateNetworkStatus('online'));
    window.addEventListener('offline', () => this.updateNetworkStatus('offline'));
    
    // Listen for resize events
    window.addEventListener('resize', () => this.updateScreenSize());
    
    // Notify kernel of initial device information
    this.notifyKernelOfDeviceConfiguration();
  }

  public getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }
  
  public getDeviceType(): DeviceType {
    return this.deviceType;
  }
  
  public hasTouchSupport(): boolean {
    return this.touchSupport;
  }
  
  public hasGestureRecognition(): boolean {
    return this.gestureRecognition;
  }
  
  public getDeviceCapabilities(): Record<string, boolean> {
    return {
      webgl: this.detectWebGLSupport(),
      webrtc: this.detectWebRTCSupport(),
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      bluetooth: 'bluetooth' in navigator
    };
  }
  
  public simulateDevice(deviceType: DeviceType): void {
    this.deviceType = deviceType;
    this.deviceInfo.type = deviceType;
    this.notifyKernelOfDeviceConfiguration();
  }
  
  private detectDeviceType(): DeviceType {
    const width = window.innerWidth;
    
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
  
  private detectTouchSupport(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
  
  private detectWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }
  
  private detectWebRTCSupport(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  
  private updateNetworkStatus(status: 'online' | 'offline') {
    this.deviceInfo.networkStatus = status;
    this.notifyKernelOfDeviceConfiguration();
  }
  
  private updateScreenSize() {
    this.deviceInfo.screenSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.notifyKernelOfDeviceConfiguration();
  }
  
  private estimatePerformanceGrade(): 'low' | 'medium' | 'high' {
    // Simple heuristic based on screen size and device type
    if (this.deviceType === 'mobile') {
      return 'low';
    } else if (this.deviceType === 'tablet') {
      return 'medium';
    } else {
      // Try to use hardware concurrency as an additional signal
      const cores = navigator.hardwareConcurrency || 4;
      return cores <= 4 ? 'medium' : 'high';
    }
  }
  
  private notifyKernelOfDeviceConfiguration(): void {
    this.kernel.events.emit('LAYOUT_CHANGED', {
      device: {
        type: this.deviceType,
        touchSupport: this.touchSupport,
        capabilities: this.getDeviceCapabilities()
      },
      deviceInfo: this.deviceInfo,
      timestamp: Date.now()
    });
  }
}
