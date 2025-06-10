
import { 
  hardwareAbstractionLayer, 
  HardwareDevice, 
  DeviceType, 
  HardwareTelemetry, 
  HardwareCommand 
} from './HardwareAbstractionLayer';
import { MockHardwareAdapter } from './MockHardwareAdapter';
import { BrowserEventEmitter } from '../events/BrowserEventEmitter';

export interface SwarmNode {
  device: HardwareDevice;
  lastTelemetry: HardwareTelemetry | null;
  role: SwarmRole;
  taskQueue: HardwareCommand[];
  performance: number; // 0-100
}

export enum SwarmRole {
  COORDINATOR = 'coordinator',
  WORKER = 'worker',
  SENSOR = 'sensor',
  GATEWAY = 'gateway',
  BACKUP = 'backup'
}

export class HardwareManager extends BrowserEventEmitter {
  private swarmNodes = new Map<string, SwarmNode>();
  private isInitialized = false;
  private discoveryInterval: NodeJS.Timeout | null = null;
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing Hardware Manager...');
    
    // Register mock adapters for development
    hardwareAbstractionLayer.registerAdapter(DeviceType.ESP32, new MockHardwareAdapter(DeviceType.ESP32));
    hardwareAbstractionLayer.registerAdapter(DeviceType.RASPBERRY_PI, new MockHardwareAdapter(DeviceType.RASPBERRY_PI));
    hardwareAbstractionLayer.registerAdapter(DeviceType.NEURAL_CHIP, new MockHardwareAdapter(DeviceType.NEURAL_CHIP));
    hardwareAbstractionLayer.registerAdapter(DeviceType.SENSOR_NODE, new MockHardwareAdapter(DeviceType.SENSOR_NODE));
    hardwareAbstractionLayer.registerAdapter(DeviceType.GATEWAY, new MockHardwareAdapter(DeviceType.GATEWAY));
    
    // Start device discovery
    await this.discoverAndConnectDevices();
    
    // Start periodic discovery
    this.discoveryInterval = setInterval(() => {
      this.discoverAndConnectDevices();
    }, 30000); // Every 30 seconds
    
    this.isInitialized = true;
    console.log('✅ Hardware Manager initialized');
    
    this.emit('hardware:initialized', { nodeCount: this.swarmNodes.size });
  }
  
  async discoverAndConnectDevices(): Promise<void> {
    try {
      const devices = await hardwareAbstractionLayer.discoverAllDevices();
      console.log(`🔍 Discovered ${devices.length} hardware devices`);
      
      for (const device of devices) {
        if (!this.swarmNodes.has(device.id)) {
          const connected = await hardwareAbstractionLayer.connectDevice(device);
          
          if (connected) {
            const swarmNode: SwarmNode = {
              device,
              lastTelemetry: null,
              role: this.assignSwarmRole(device),
              taskQueue: [],
              performance: 100
            };
            
            this.swarmNodes.set(device.id, swarmNode);
            this.startTelemetryMonitoring(device.id);
            
            this.emit('hardware:device:connected', { device, role: swarmNode.role });
            console.log(`✅ Connected ${device.type} device: ${device.id} as ${swarmNode.role}`);
          }
        }
      }
      
      this.emit('hardware:discovery:complete', { 
        totalDevices: devices.length,
        connectedNodes: this.swarmNodes.size 
      });
      
    } catch (error) {
      console.error('❌ Hardware discovery failed:', error);
      this.emit('hardware:discovery:failed', { error: error.message });
    }
  }
  
  private assignSwarmRole(device: HardwareDevice): SwarmRole {
    // Assign roles based on device capabilities and type
    switch (device.type) {
      case DeviceType.RASPBERRY_PI:
        return SwarmRole.COORDINATOR;
      case DeviceType.NEURAL_CHIP:
        return SwarmRole.WORKER;
      case DeviceType.SENSOR_NODE:
        return SwarmRole.SENSOR;
      case DeviceType.GATEWAY:
        return SwarmRole.GATEWAY;
      case DeviceType.ESP32:
        return Math.random() > 0.5 ? SwarmRole.WORKER : SwarmRole.BACKUP;
      default:
        return SwarmRole.WORKER;
    }
  }
  
  private startTelemetryMonitoring(deviceId: string): void {
    const adapter = this.getAdapterForDevice(deviceId);
    if (!adapter) return;
    
    adapter.streamTelemetry(deviceId, (telemetry) => {
      const node = this.swarmNodes.get(deviceId);
      if (node) {
        node.lastTelemetry = telemetry;
        node.performance = this.calculatePerformance(telemetry);
        
        // Check for critical conditions
        if (telemetry.temperature > node.device.specs.maxTemp * 0.9) {
          this.emit('hardware:device:overheating', { deviceId, temperature: telemetry.temperature });
        }
        
        if (telemetry.cpuUsage > 95) {
          this.emit('hardware:device:overloaded', { deviceId, cpuUsage: telemetry.cpuUsage });
        }
        
        this.emit('hardware:telemetry:update', { deviceId, telemetry });
      }
    });
  }
  
  private calculatePerformance(telemetry: HardwareTelemetry): number {
    // Calculate performance score based on multiple factors
    const cpuScore = Math.max(0, 100 - telemetry.cpuUsage);
    const memoryScore = Math.max(0, 100 - telemetry.memoryUsage);
    const tempScore = telemetry.temperature < 60 ? 100 : Math.max(0, 100 - (telemetry.temperature - 60) * 2);
    const errorScore = Math.max(0, 100 - telemetry.errorCount * 10);
    
    return Math.round((cpuScore + memoryScore + tempScore + errorScore) / 4);
  }
  
  private getAdapterForDevice(deviceId: string): any {
    const node = this.swarmNodes.get(deviceId);
    if (!node) return null;
    
    return hardwareAbstractionLayer['adapters'].get(node.device.type);
  }
  
  getSwarmNodes(): SwarmNode[] {
    return Array.from(this.swarmNodes.values());
  }
  
  getNodesByRole(role: SwarmRole): SwarmNode[] {
    return this.getSwarmNodes().filter(node => node.role === role);
  }
  
  getSwarmMetrics() {
    const nodes = this.getSwarmNodes();
    
    return {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.device.status === 'online').length,
      averagePerformance: nodes.reduce((sum, n) => sum + n.performance, 0) / nodes.length || 0,
      roleDistribution: {
        coordinators: this.getNodesByRole(SwarmRole.COORDINATOR).length,
        workers: this.getNodesByRole(SwarmRole.WORKER).length,
        sensors: this.getNodesByRole(SwarmRole.SENSOR).length,
        gateways: this.getNodesByRole(SwarmRole.GATEWAY).length,
        backups: this.getNodesByRole(SwarmRole.BACKUP).length
      },
      totalProcessingPower: nodes.reduce((sum, n) => sum + n.device.specs.processingPower, 0),
      totalMemory: nodes.reduce((sum, n) => sum + n.device.specs.memorySize, 0),
      totalPowerDraw: nodes.reduce((sum, n) => sum + (n.lastTelemetry?.powerDraw || 0), 0)
    };
  }
  
  async executeDistributedTask(task: any): Promise<any> {
    const availableWorkers = this.getNodesByRole(SwarmRole.WORKER)
      .filter(node => node.performance > 70)
      .sort((a, b) => b.performance - a.performance);
    
    if (availableWorkers.length === 0) {
      throw new Error('No available workers for task execution');
    }
    
    // For now, assign to the best performing worker
    const selectedWorker = availableWorkers[0];
    
    const command: HardwareCommand = {
      deviceId: selectedWorker.device.id,
      command: 'execute_task',
      parameters: task,
      priority: 5,
      timeout: 30000
    };
    
    console.log(`🎯 Executing task on ${selectedWorker.device.id}`);
    
    const response = await hardwareAbstractionLayer.sendCommand(command);
    
    this.emit('hardware:task:executed', { 
      deviceId: selectedWorker.device.id, 
      task, 
      response 
    });
    
    return response;
  }
  
  destroy(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }
    
    // Stop all telemetry streams
    for (const [deviceId] of this.swarmNodes) {
      const adapter = this.getAdapterForDevice(deviceId);
      if (adapter) {
        adapter.stopTelemetryStream(deviceId);
      }
    }
    
    this.swarmNodes.clear();
    this.isInitialized = false;
  }
}

export const hardwareManager = new HardwareManager();
