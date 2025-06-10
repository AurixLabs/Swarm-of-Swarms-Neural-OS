
/**
 * Hardware Abstraction Layer for CMA Swarm
 * Interfaces with ESP32-S3, sensors, cameras, and networking hardware
 */

export interface HardwareDevice {
  id: string;
  type: DeviceType;
  status: 'online' | 'offline' | 'error' | 'initializing';
  capabilities: string[];
  lastSeen: number;
  metadata: Record<string, any>;
}

export type DeviceType = 
  | 'esp32_controller'
  | 'aht21_sensor'
  | 'adxl234_accelerometer'
  | 'camera_module'
  | 'storage_sd'
  | 'network_router'
  | 'power_station';

export interface SensorReading {
  deviceId: string;
  timestamp: number;
  type: 'temperature' | 'humidity' | 'acceleration' | 'image' | 'motion';
  value: any;
  unit?: string;
}

export interface ESP32Controller extends HardwareDevice {
  type: 'esp32_controller';
  ipAddress?: string;
  wifiSignalStrength: number;
  bluetoothEnabled: boolean;
  connectedSensors: string[];
  runningAgents: string[];
  memoryUsage: number;
  cpuUsage: number;
}

export interface AHT21Sensor extends HardwareDevice {
  type: 'aht21_sensor';
  temperature: number;
  humidity: number;
  i2cAddress: string;
}

export interface ADXL234Accelerometer extends HardwareDevice {
  type: 'adxl234_accelerometer';
  acceleration: { x: number; y: number; z: number };
  sensitivity: number;
  sampleRate: number;
}

export interface CameraModule extends HardwareDevice {
  type: 'camera_module';
  resolution: string;
  frameRate: number;
  isRecording: boolean;
}

export class HardwareAbstractionLayer {
  private devices = new Map<string, HardwareDevice>();
  private sensorReadings: SensorReading[] = [];
  private eventListeners = new Map<string, Function[]>();

  constructor() {
    this.initializeHAL();
  }

  private async initializeHAL() {
    console.log('🔧 Initializing Hardware Abstraction Layer...');
    
    // Auto-discover ESP32 controllers on network
    await this.discoverESP32Controllers();
    
    // Initialize sensor connections
    await this.initializeSensors();
    
    // Setup camera modules
    await this.initializeCameras();
    
    console.log(`✅ HAL initialized with ${this.devices.size} devices`);
  }

  private async discoverESP32Controllers() {
    console.log('🔍 Discovering ESP32-S3 controllers...');
    
    // Simulate ESP32 discovery (in real implementation, this would scan network)
    for (let i = 1; i <= 10; i++) {
      const esp32: ESP32Controller = {
        id: `esp32_${i}`,
        type: 'esp32_controller',
        status: 'online',
        capabilities: ['wifi', 'bluetooth', 'gpio', 'i2c', 'spi'],
        lastSeen: Date.now(),
        metadata: {
          firmwareVersion: '1.0.0',
          chipModel: 'ESP32-S3',
          flashSize: '4MB'
        },
        ipAddress: `192.168.1.${100 + i}`,
        wifiSignalStrength: Math.floor(Math.random() * 100),
        bluetoothEnabled: true,
        connectedSensors: [],
        runningAgents: [],
        memoryUsage: Math.floor(Math.random() * 80),
        cpuUsage: Math.floor(Math.random() * 60)
      };
      
      this.devices.set(esp32.id, esp32);
    }
  }

  private async initializeSensors() {
    console.log('🌡️ Initializing AHT21 temperature/humidity sensors...');
    
    // Initialize AHT21 sensors
    for (let i = 1; i <= 10; i++) {
      const sensor: AHT21Sensor = {
        id: `aht21_${i}`,
        type: 'aht21_sensor',
        status: 'online',
        capabilities: ['temperature', 'humidity'],
        lastSeen: Date.now(),
        metadata: { i2cBus: 0, address: `0x${(0x38 + i).toString(16)}` },
        temperature: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        i2cAddress: `0x${(0x38 + i).toString(16)}`
      };
      
      this.devices.set(sensor.id, sensor);
    }

    console.log('📊 Initializing ADXL234 accelerometers...');
    
    // Initialize ADXL234 accelerometers
    for (let i = 1; i <= 10; i++) {
      const accelerometer: ADXL234Accelerometer = {
        id: `adxl234_${i}`,
        type: 'adxl234_accelerometer',
        status: 'online',
        capabilities: ['3-axis-acceleration', 'motion-detection'],
        lastSeen: Date.now(),
        metadata: { interface: 'i2c', range: '±2g' },
        acceleration: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: 1 + (Math.random() - 0.5) * 0.2
        },
        sensitivity: 256,
        sampleRate: 100
      };
      
      this.devices.set(accelerometer.id, accelerometer);
    }
  }

  private async initializeCameras() {
    console.log('📷 Initializing camera modules...');
    
    for (let i = 1; i <= 20; i++) {
      const camera: CameraModule = {
        id: `camera_${i}`,
        type: 'camera_module',
        status: 'online',
        capabilities: ['image-capture', 'video-recording'],
        lastSeen: Date.now(),
        metadata: { interface: 'i2c', resolution: '300KP VGA' },
        resolution: '640x480',
        frameRate: 30,
        isRecording: false
      };
      
      this.devices.set(camera.id, camera);
    }
  }

  // Device Management
  public getDevices(type?: DeviceType): HardwareDevice[] {
    const devices = Array.from(this.devices.values());
    return type ? devices.filter(d => d.type === type) : devices;
  }

  public getDevice(id: string): HardwareDevice | undefined {
    return this.devices.get(id);
  }

  public async sendCommand(deviceId: string, command: string, params?: any): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      console.error(`❌ Device ${deviceId} not found`);
      return false;
    }

    console.log(`📡 Sending command '${command}' to ${deviceId}`, params);
    
    // Simulate command execution
    device.lastSeen = Date.now();
    
    this.emit('command_sent', { deviceId, command, params });
    return true;
  }

  // Sensor Data Collection
  public async readSensor(deviceId: string): Promise<SensorReading | null> {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    let reading: SensorReading | null = null;

    switch (device.type) {
      case 'aht21_sensor':
        const aht21 = device as AHT21Sensor;
        reading = {
          deviceId,
          timestamp: Date.now(),
          type: 'temperature',
          value: { temperature: aht21.temperature, humidity: aht21.humidity },
          unit: '°C / %RH'
        };
        break;

      case 'adxl234_accelerometer':
        const accel = device as ADXL234Accelerometer;
        reading = {
          deviceId,
          timestamp: Date.now(),
          type: 'acceleration',
          value: accel.acceleration,
          unit: 'g'
        };
        break;

      case 'camera_module':
        reading = {
          deviceId,
          timestamp: Date.now(),
          type: 'image',
          value: { imageData: 'base64_encoded_image_data', resolution: '640x480' }
        };
        break;
    }

    if (reading) {
      this.sensorReadings.push(reading);
      this.emit('sensor_reading', reading);
    }

    return reading;
  }

  // Network Topology
  public async getNetworkTopology(): Promise<any> {
    const esp32Controllers = this.getDevices('esp32_controller') as ESP32Controller[];
    
    return {
      router: {
        id: 'linksys_mr203c',
        type: 'wifi6_mesh_router',
        connectedDevices: esp32Controllers.length,
        bandwidth: '1200Mbps',
        mesh: true
      },
      controllers: esp32Controllers.map(esp32 => ({
        id: esp32.id,
        ip: esp32.ipAddress,
        signalStrength: esp32.wifiSignalStrength,
        connectedSensors: esp32.connectedSensors.length
      }))
    };
  }

  // Event System
  public on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // Hardware Health Monitoring
  public getSystemHealth(): any {
    const devices = Array.from(this.devices.values());
    const onlineDevices = devices.filter(d => d.status === 'online');
    
    return {
      totalDevices: devices.length,
      onlineDevices: onlineDevices.length,
      healthPercentage: (onlineDevices.length / devices.length) * 100,
      deviceBreakdown: {
        esp32Controllers: this.getDevices('esp32_controller').length,
        sensors: this.getDevices('aht21_sensor').length + this.getDevices('adxl234_accelerometer').length,
        cameras: this.getDevices('camera_module').length
      },
      lastUpdate: Date.now()
    };
  }

  // Data Export for Swarm Coordination
  public exportSwarmData(): any {
    return {
      devices: Array.from(this.devices.values()),
      recentReadings: this.sensorReadings.slice(-100),
      networkTopology: this.getNetworkTopology(),
      systemHealth: this.getSystemHealth()
    };
  }
}

// Singleton instance
export const hardwareAbstractionLayer = new HardwareAbstractionLayer();
