
import { EventEmitter } from 'events';

export interface SwarmNode {
  id: string;
  type: 'chip' | 'virtual' | 'hybrid';
  capabilities: string[];
  load: number;
  health: number;
  lastHeartbeat: number;
  hardwareInfo?: {
    chipType: 'ESP32' | 'K210' | 'LoRa' | 'RPi_Zero' | 'Custom';
    memory: number;
    processing_power: number;
    energy_efficiency: number;
  };
}

export interface SwarmTask {
  id: string;
  type: string;
  priority: number;
  requiredCapabilities: string[];
  estimatedLoad: number;
  deadline?: number;
  data: any;
}

export interface LoadBalancingStrategy {
  name: string;
  algorithm: 'round_robin' | 'least_loaded' | 'capability_based' | 'energy_aware';
  parameters: Record<string, any>;
}

export interface SwarmMetrics {
  totalNodes: number;
  activeNodes: number;
  averageLoad: number;
  taskThroughput: number;
  energyEfficiency: number;
  networkLatency: number;
  faultTolerance: number;
}

export class AdvancedSwarmCoordinator extends EventEmitter {
  private nodes: Map<string, SwarmNode> = new Map();
  private tasks: Map<string, SwarmTask> = new Map();
  private taskAssignments: Map<string, string[]> = new Map(); // taskId -> nodeIds
  private loadBalancer: LoadBalancingStrategy;
  private meshNetwork: Map<string, string[]> = new Map(); // nodeId -> connectedNodeIds
  private isRunning = false;
  private coordinationInterval: number | null = null;

  constructor() {
    super();
    this.loadBalancer = {
      name: 'Adaptive Energy-Aware',
      algorithm: 'energy_aware',
      parameters: {
        energy_weight: 0.3,
        load_weight: 0.4,
        capability_weight: 0.3
      }
    };
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Advanced Swarm Coordinator...');
      
      // Initialize mesh networking
      await this.initializeMeshNetwork();
      
      // Start coordination loop
      this.startCoordinationLoop();
      
      this.isRunning = true;
      this.emit('swarm_initialized', { timestamp: Date.now() });
      
      console.log('✅ Advanced Swarm Coordinator initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize swarm coordinator:', error);
      return false;
    }
  }

  private async initializeMeshNetwork(): Promise<void> {
    // Simulate discovering chip modules
    const mockChipNodes: SwarmNode[] = [
      {
        id: 'esp32_001',
        type: 'chip',
        capabilities: ['neural_processing', 'sensor_data', 'wifi'],
        load: 15,
        health: 98,
        lastHeartbeat: Date.now(),
        hardwareInfo: {
          chipType: 'ESP32',
          memory: 520, // KB
          processing_power: 240, // MHz
          energy_efficiency: 85
        }
      },
      {
        id: 'k210_001',
        type: 'chip',
        capabilities: ['ai_acceleration', 'vision_processing', 'neural_nets'],
        load: 45,
        health: 95,
        lastHeartbeat: Date.now(),
        hardwareInfo: {
          chipType: 'K210',
          memory: 8192, // KB
          processing_power: 400, // MHz
          energy_efficiency: 70
        }
      },
      {
        id: 'lora_001',
        type: 'chip',
        capabilities: ['mesh_networking', 'long_range_comm', 'low_power'],
        load: 5,
        health: 99,
        lastHeartbeat: Date.now(),
        hardwareInfo: {
          chipType: 'LoRa',
          memory: 64, // KB
          processing_power: 32, // MHz
          energy_efficiency: 95
        }
      },
      {
        id: 'rpi_zero_001',
        type: 'chip',
        capabilities: ['coordination', 'data_storage', 'api_gateway'],
        load: 25,
        health: 92,
        lastHeartbeat: Date.now(),
        hardwareInfo: {
          chipType: 'RPi_Zero',
          memory: 512000, // KB
          processing_power: 1000, // MHz
          energy_efficiency: 60
        }
      }
    ];

    // Register mock nodes
    for (const node of mockChipNodes) {
      this.registerNode(node);
    }

    // Build mesh connections
    this.buildMeshTopology();
  }

  registerNode(node: SwarmNode): void {
    this.nodes.set(node.id, node);
    this.emit('node_registered', { nodeId: node.id, nodeType: node.type });
    console.log(`🔗 Registered ${node.type} node: ${node.id}`);
  }

  private buildMeshTopology(): void {
    const nodeIds = Array.from(this.nodes.keys());
    
    // Create full mesh for now (each node connects to all others)
    for (const nodeId of nodeIds) {
      const connections = nodeIds.filter(id => id !== nodeId);
      this.meshNetwork.set(nodeId, connections);
    }
    
    console.log('🕸️ Mesh topology built:', this.meshNetwork.size, 'nodes connected');
  }

  async submitTask(task: SwarmTask): Promise<string[]> {
    this.tasks.set(task.id, task);
    
    // Find optimal nodes for task
    const selectedNodes = this.selectOptimalNodes(task);
    
    if (selectedNodes.length === 0) {
      throw new Error(`No suitable nodes found for task ${task.id}`);
    }
    
    // Assign task to selected nodes
    this.taskAssignments.set(task.id, selectedNodes);
    
    // Update node loads
    this.updateNodeLoads(selectedNodes, task.estimatedLoad);
    
    this.emit('task_assigned', { 
      taskId: task.id, 
      assignedNodes: selectedNodes,
      loadDistribution: this.getLoadDistribution()
    });
    
    console.log(`📋 Task ${task.id} assigned to nodes:`, selectedNodes);
    return selectedNodes;
  }

  private selectOptimalNodes(task: SwarmTask): string[] {
    const suitableNodes = Array.from(this.nodes.values())
      .filter(node => this.nodeCanHandleTask(node, task))
      .sort((a, b) => this.calculateNodeScore(b, task) - this.calculateNodeScore(a, task));

    // Select top nodes based on load balancing strategy
    const maxNodes = Math.min(3, suitableNodes.length); // Max 3 nodes per task
    return suitableNodes.slice(0, maxNodes).map(node => node.id);
  }

  private nodeCanHandleTask(node: SwarmNode, task: SwarmTask): boolean {
    // Check if node has required capabilities
    const hasCapabilities = task.requiredCapabilities.every(cap => 
      node.capabilities.includes(cap)
    );
    
    // Check if node can handle additional load
    const canHandleLoad = (node.load + task.estimatedLoad) <= 90;
    
    // Check node health
    const isHealthy = node.health >= 80;
    
    return hasCapabilities && canHandleLoad && isHealthy;
  }

  private calculateNodeScore(node: SwarmNode, task: SwarmTask): number {
    const { energy_weight, load_weight, capability_weight } = this.loadBalancer.parameters;
    
    // Energy efficiency score (higher is better)
    const energyScore = (node.hardwareInfo?.energy_efficiency || 50) / 100;
    
    // Load score (lower load is better)
    const loadScore = (100 - node.load) / 100;
    
    // Capability match score
    const matchedCaps = task.requiredCapabilities.filter(cap => 
      node.capabilities.includes(cap)
    ).length;
    const capabilityScore = matchedCaps / task.requiredCapabilities.length;
    
    return (
      energyScore * energy_weight +
      loadScore * load_weight +
      capabilityScore * capability_weight
    );
  }

  private updateNodeLoads(nodeIds: string[], additionalLoad: number): void {
    const loadPerNode = additionalLoad / nodeIds.length;
    
    for (const nodeId of nodeIds) {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.load = Math.min(100, node.load + loadPerNode);
        this.nodes.set(nodeId, node);
      }
    }
  }

  private startCoordinationLoop(): void {
    this.coordinationInterval = window.setInterval(() => {
      this.coordinationTick();
    }, 2000);
  }

  private coordinationTick(): void {
    // Update node heartbeats and health
    this.updateNodeHealth();
    
    // Rebalance load if needed
    this.rebalanceLoad();
    
    // Emit metrics
    this.emit('metrics_updated', this.getSwarmMetrics());
  }

  private updateNodeHealth(): void {
    const now = Date.now();
    
    for (const [nodeId, node] of this.nodes) {
      // Simulate heartbeat and health degradation
      const timeSinceHeartbeat = now - node.lastHeartbeat;
      
      if (timeSinceHeartbeat > 10000) { // 10 seconds
        node.health = Math.max(0, node.health - 5);
      } else {
        node.health = Math.min(100, node.health + 1);
      }
      
      // Simulate load decay
      node.load = Math.max(0, node.load - 2);
      
      // Update last heartbeat (simulate)
      node.lastHeartbeat = now - Math.random() * 1000;
      
      this.nodes.set(nodeId, node);
    }
  }

  private rebalanceLoad(): void {
    // Find overloaded nodes
    const overloadedNodes = Array.from(this.nodes.values())
      .filter(node => node.load > 80);
    
    if (overloadedNodes.length > 0) {
      console.log('⚖️ Rebalancing load for overloaded nodes:', 
        overloadedNodes.map(n => n.id));
      
      // Implement load redistribution logic here
      this.emit('load_rebalanced', {
        overloadedNodes: overloadedNodes.map(n => n.id),
        timestamp: Date.now()
      });
    }
  }

  getSwarmMetrics(): SwarmMetrics {
    const nodes = Array.from(this.nodes.values());
    const activeNodes = nodes.filter(n => n.health > 70);
    
    return {
      totalNodes: nodes.length,
      activeNodes: activeNodes.length,
      averageLoad: nodes.reduce((sum, n) => sum + n.load, 0) / nodes.length,
      taskThroughput: this.tasks.size,
      energyEfficiency: nodes.reduce((sum, n) => 
        sum + (n.hardwareInfo?.energy_efficiency || 50), 0) / nodes.length,
      networkLatency: Math.random() * 50 + 10, // Simulated
      faultTolerance: (activeNodes.length / nodes.length) * 100
    };
  }

  getLoadDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const [nodeId, node] of this.nodes) {
      distribution[nodeId] = node.load;
    }
    return distribution;
  }

  getAllNodes(): SwarmNode[] {
    return Array.from(this.nodes.values());
  }

  getMeshTopology(): Map<string, string[]> {
    return new Map(this.meshNetwork);
  }

  shutdown(): void {
    if (this.coordinationInterval) {
      clearInterval(this.coordinationInterval);
      this.coordinationInterval = null;
    }
    this.isRunning = false;
    this.emit('swarm_shutdown');
    console.log('🛑 Advanced Swarm Coordinator shutdown');
  }
}

export const advancedSwarmCoordinator = new AdvancedSwarmCoordinator();
