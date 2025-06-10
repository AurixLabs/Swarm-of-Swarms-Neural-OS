
import { 
  HardwareAdapter, 
  HardwareDevice, 
  DeviceType, 
  DeviceStatus, 
  HardwareTelemetry, 
  HardwareCommand, 
  HardwareResponse 
} from './HardwareAbstractionLayer';

export class MockHardwareAdapter extends HardwareAdapter {
  private mockDevices: HardwareDevice[] = [];
  private connectedDevices = new Set<string>();
  private telemetryIntervals = new Map<string, NodeJS.Timeout>();
  
  constructor(deviceType: DeviceType) {
    super();
    this.generateMockDevices(deviceType);
  }
  
  private generateMockDevices(type: DeviceType): void {
    const deviceCount = Math.floor(Math.random() * 5) + 3; // 3-7 devices
    
    for (let i = 0; i < deviceCount; i++) {
      const device: HardwareDevice = {
        id: `${type}-${i.toString().padStart(3, '0')}`,
        type,
        status: Math.random() > 0.2 ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE,
        capabilities: this.getCapabilitiesForType(type),
        specs: this.getSpecsForType(type)
      };
      
      this.mockDevices.push(device);
    }
  }
  
  private getCapabilitiesForType(type: DeviceType): string[] {
    switch (type) {
      case DeviceType.ESP32:
        return ['wifi', 'bluetooth', 'gpio', 'adc', 'pwm', 'spi', 'i2c'];
      case DeviceType.RASPBERRY_PI:
        return ['ethernet', 'wifi', 'usb', 'gpio', 'camera', 'hdmi', 'audio'];
      case DeviceType.NEURAL_CHIP:
        return ['spike_processing', 'neural_networks', 'pattern_recognition', 'learning'];
      case DeviceType.SENSOR_NODE:
        return ['temperature', 'humidity', 'pressure', 'light', 'motion'];
      case DeviceType.GATEWAY:
        return ['ethernet', 'wifi', 'lora', 'zigbee', 'routing', 'firewall'];
      default:
        return ['basic_io'];
    }
  }
  
  private getSpecsForType(type: DeviceType): any {
    switch (type) {
      case DeviceType.ESP32:
        return {
          processingPower: 240, // MHz
          memorySize: 520, // KB
          powerConsumption: 0.5, // Watts
          operatingTemp: 25 + Math.random() * 20,
          maxTemp: 85
        };
      case DeviceType.RASPBERRY_PI:
        return {
          processingPower: 1500, // MHz
          memorySize: 4096, // MB
          powerConsumption: 5.1, // Watts
          operatingTemp: 35 + Math.random() * 15,
          maxTemp: 85
        };
      case DeviceType.NEURAL_CHIP:
        return {
          processingPower: 2000, // TOPS (Tera Operations Per Second)
          memorySize: 8192, // MB
          powerConsumption: 15, // Watts
          operatingTemp: 45 + Math.random() * 20,
          maxTemp: 95
        };
      default:
        return {
          processingPower: 100,
          memorySize: 256,
          powerConsumption: 1,
          operatingTemp: 25 + Math.random() * 15,
          maxTemp: 70
        };
    }
  }
  
  async discoverDevices(): Promise<HardwareDevice[]> {
    // Simulate discovery delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Randomly update device statuses
    this.mockDevices.forEach(device => {
      if (Math.random() > 0.95) {
        device.status = device.status === DeviceStatus.ONLINE ? 
          DeviceStatus.OFFLINE : DeviceStatus.ONLINE;
      }
    });
    
    console.log(`🔍 Discovered ${this.mockDevices.length} mock devices`);
    return [...this.mockDevices];
  }
  
  async connectDevice(deviceId: string): Promise<boolean> {
    const device = this.mockDevices.find(d => d.id === deviceId);
    if (!device) return false;
    
    // Simulate connection time
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));
    
    // 95% success rate for mock connections
    const success = Math.random() > 0.05;
    
    if (success) {
      this.connectedDevices.add(deviceId);
      device.status = DeviceStatus.ONLINE;
    }
    
    return success;
  }
  
  async disconnectDevice(deviceId: string): Promise<boolean> {
    this.connectedDevices.delete(deviceId);
    const device = this.mockDevices.find(d => d.id === deviceId);
    if (device) {
      device.status = DeviceStatus.OFFLINE;
    }
    
    // Clear telemetry stream
    const interval = this.telemetryIntervals.get(deviceId);
    if (interval) {
      clearInterval(interval);
      this.telemetryIntervals.delete(deviceId);
    }
    
    return true;
  }
  
  async sendCommand(command: HardwareCommand): Promise<HardwareResponse> {
    // Simulate command execution time
    const executionTime = 50 + Math.random() * 200;
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    // 90% success rate for mock commands
    const success = Math.random() > 0.1;
    
    return {
      deviceId: command.deviceId,
      commandId: `cmd-${Date.now()}`,
      success,
      data: success ? { result: 'Mock command executed successfully' } : undefined,
      error: success ? undefined : 'Mock command failed',
      executionTime
    };
  }
  
  async getTelemetry(deviceId: string): Promise<HardwareTelemetry> {
    const device = this.mockDevices.find(d => d.id === deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    
    return this.generateMockTelemetry(deviceId, device);
  }
  
  streamTelemetry(deviceId: string, callback: (telemetry: HardwareTelemetry) => void): void {
    const device = this.mockDevices.find(d => d.id === deviceId);
    if (!device) return;
    
    const interval = setInterval(() => {
      const telemetry = this.generateMockTelemetry(deviceId, device);
      callback(telemetry);
    }, 1000 + Math.random() * 2000); // 1-3 second intervals
    
    this.telemetryIntervals.set(deviceId, interval);
  }
  
  stopTelemetryStream(deviceId: string): void {
    const interval = this.telemetryIntervals.get(deviceId);
    if (interval) {
      clearInterval(interval);
      this.telemetryIntervals.delete(deviceId);
    }
  }
  
  private generateMockTelemetry(deviceId: string, device: HardwareDevice): HardwareTelemetry {
    return {
      deviceId,
      timestamp: Date.now(),
      cpuUsage: Math.random() * 80 + 10, // 10-90%
      memoryUsage: Math.random() * 70 + 15, // 15-85%
      temperature: device.specs.operatingTemp + (Math.random() - 0.5) * 10,
      powerDraw: device.specs.powerConsumption * (0.8 + Math.random() * 0.4),
      networkLatency: Math.random() * 50 + 10, // 10-60ms
      errorCount: Math.floor(Math.random() * 3) // 0-2 errors
    };
  }
}
