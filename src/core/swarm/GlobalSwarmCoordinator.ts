
// Browser-compatible EventEmitter
class BrowserEventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Function) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }

  destroy() {
    this.events = {};
  }
}

export interface SwarmNode {
  id: string;
  type: 'compute' | 'storage' | 'relay' | 'gateway' | 'specialized';
  location: {
    lat: number;
    lng: number;
    region: string;
  };
  capabilities: string[];
  health: number;
  workload: number;
  reputation: number;
  joinedAt: number;
  lastHeartbeat: number;
}

export interface SwarmTask {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requirements: string[];
  payload: any;
  status: 'pending' | 'allocated' | 'processing' | 'completed' | 'failed';
  assignedNodes: string[];
  createdAt: number;
  deadline?: number;
  progress: number;
}

export interface GlobalConsensus {
  id: string;
  type: 'config_change' | 'node_admission' | 'task_priority' | 'ethics_update';
  proposal: any;
  proposedBy: string;
  status: 'proposed' | 'voting' | 'approved' | 'rejected';
  votes: { nodeId: string; vote: boolean; timestamp: number }[];
  requiredVotes: number;
  deadline: number;
  createdAt: number;
}

export interface SwarmMetrics {
  totalNodes: number;
  activeNodes: number;
  averageHealth: number;
  totalTasks: number;
  completedTasks: number;
  networkLatency: number;
  consensusTime: number;
  globalEfficiency: number;
}

class GlobalSwarmCoordinator extends BrowserEventEmitter {
  private nodes: Map<string, SwarmNode> = new Map();
  private tasks: Map<string, SwarmTask> = new Map();
  private consensusProposals: Map<string, GlobalConsensus> = new Map();
  private isInitialized: boolean = false;
  private heartbeatInterval?: number;

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🌍 Initializing Global Swarm Coordinator...');
    
    // Create demo nodes
    this.createDemoNodes();
    
    // Start heartbeat system
    this.startHeartbeatSystem();
    
    this.isInitialized = true;
    console.log('✅ Global Swarm Coordinator initialized with global mesh network');
  }

  private createDemoNodes(): void {
    const demoNodes: Partial<SwarmNode>[] = [
      {
        id: 'node-tokyo-1',
        type: 'compute',
        location: { lat: 35.6762, lng: 139.6503, region: 'Asia-Pacific' },
        capabilities: ['quantum-acceleration', 'neuromorphic-processing'],
        health: 0.95,
        workload: 0.3
      },
      {
        id: 'node-london-1',
        type: 'gateway',
        location: { lat: 51.5074, lng: -0.1278, region: 'Europe' },
        capabilities: ['high-bandwidth', 'regulatory-compliance'],
        health: 0.92,
        workload: 0.6
      },
      {
        id: 'node-silicon-valley-1',
        type: 'specialized',
        location: { lat: 37.4419, lng: -122.1430, region: 'North America' },
        capabilities: ['ai-acceleration', 'edge-computing'],
        health: 0.97,
        workload: 0.4
      },
      {
        id: 'node-sydney-1',
        type: 'storage',
        location: { lat: -33.8688, lng: 151.2093, region: 'Oceania' },
        capabilities: ['distributed-storage', 'backup-redundancy'],
        health: 0.89,
        workload: 0.7
      },
      {
        id: 'node-sao-paulo-1',
        type: 'relay',
        location: { lat: -23.5505, lng: -46.6333, region: 'South America' },
        capabilities: ['mesh-networking', 'latency-optimization'],
        health: 0.91,
        workload: 0.5
      }
    ];

    demoNodes.forEach(nodeData => {
      const node: SwarmNode = {
        ...nodeData as SwarmNode,
        reputation: 0.8 + Math.random() * 0.2,
        joinedAt: Date.now() - Math.random() * 86400000 * 30, // Random time in last 30 days
        lastHeartbeat: Date.now()
      };
      this.nodes.set(node.id, node);
    });
  }

  private startHeartbeatSystem(): void {
    this.heartbeatInterval = window.setInterval(() => {
      this.nodes.forEach(node => {
        // Simulate heartbeat with small variations
        node.lastHeartbeat = Date.now();
        node.health = Math.max(0.7, Math.min(1, node.health + (Math.random() - 0.5) * 0.02));
        node.workload = Math.max(0, Math.min(1, node.workload + (Math.random() - 0.5) * 0.1));
      });
      this.emit('swarm:heartbeat', this.getSwarmMetrics());
    }, 3000);
  }

  submitTask(taskData: {
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    requirements: string[];
    payload: any;
    deadline?: number;
  }): string {
    const task: SwarmTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...taskData,
      status: 'pending',
      assignedNodes: [],
      createdAt: Date.now(),
      progress: 0
    };

    this.tasks.set(task.id, task);
    this.emit('swarm:task_submitted', task);

    // Auto-allocate task
    setTimeout(() => this.allocateTask(task.id), 100);

    return task.id;
  }

  private allocateTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Find suitable nodes
    const suitableNodes = Array.from(this.nodes.values()).filter(node => 
      node.health > 0.8 && 
      node.workload < 0.8 &&
      task.requirements.some(req => node.capabilities.includes(req))
    );

    if (suitableNodes.length > 0) {
      const selectedNode = suitableNodes[0];
      task.assignedNodes = [selectedNode.id];
      task.status = 'allocated';
      
      this.emit('swarm:task_allocated', task);

      // Simulate task processing
      setTimeout(() => this.processTask(taskId), 2000);
    }
  }

  private processTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'processing';
    task.progress = 0;

    const progressInterval = setInterval(() => {
      task.progress += 0.1 + Math.random() * 0.2;
      
      if (task.progress >= 1) {
        task.progress = 1;
        task.status = 'completed';
        clearInterval(progressInterval);
        this.emit('swarm:task_completed', task);
      } else {
        this.emit('swarm:task_updated', task);
      }
    }, 500);
  }

  proposeConsensus(proposalData: {
    type: 'config_change' | 'node_admission' | 'task_priority' | 'ethics_update';
    proposal: any;
    requiredVotes: number;
    deadline: number;
  }): string {
    const consensus: GlobalConsensus = {
      id: `consensus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...proposalData,
      proposedBy: 'system',
      status: 'proposed',
      votes: [],
      createdAt: Date.now()
    };

    this.consensusProposals.set(consensus.id, consensus);
    this.emit('swarm:consensus_proposed', consensus);

    // Auto-vote simulation
    setTimeout(() => this.simulateVoting(consensus.id), 1000);

    return consensus.id;
  }

  private simulateVoting(consensusId: string): void {
    const consensus = this.consensusProposals.get(consensusId);
    if (!consensus) return;

    consensus.status = 'voting';

    // Simulate nodes voting
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.health > 0.8);
    activeNodes.forEach((node, index) => {
      setTimeout(() => {
        const vote = Math.random() > 0.3; // 70% approval rate
        consensus.votes.push({
          nodeId: node.id,
          vote,
          timestamp: Date.now()
        });

        if (consensus.votes.length >= consensus.requiredVotes) {
          const approvals = consensus.votes.filter(v => v.vote).length;
          consensus.status = approvals >= consensus.requiredVotes * 0.6 ? 'approved' : 'rejected';
          this.emit(`swarm:consensus_${consensus.status}`, consensus);
        }
      }, index * 200);
    });
  }

  vote(proposalId: string, nodeId: string, vote: boolean): boolean {
    const consensus = this.consensusProposals.get(proposalId);
    if (!consensus || consensus.status !== 'voting') return false;

    const existingVote = consensus.votes.find(v => v.nodeId === nodeId);
    if (existingVote) return false;

    consensus.votes.push({ nodeId, vote, timestamp: Date.now() });
    return true;
  }

  getAllNodes(): SwarmNode[] {
    return Array.from(this.nodes.values());
  }

  getAllTasks(): SwarmTask[] {
    return Array.from(this.tasks.values());
  }

  getAllConsensus(): GlobalConsensus[] {
    return Array.from(this.consensusProposals.values());
  }

  getSwarmMetrics(): SwarmMetrics {
    const nodes = this.getAllNodes();
    const tasks = this.getAllTasks();
    const activeNodes = nodes.filter(n => Date.now() - n.lastHeartbeat < 10000);
    
    return {
      totalNodes: nodes.length,
      activeNodes: activeNodes.length,
      averageHealth: nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.health, 0) / nodes.length : 0,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      networkLatency: 50 + Math.random() * 100, // Simulated
      consensusTime: 2000 + Math.random() * 3000, // Simulated
      globalEfficiency: activeNodes.length > 0 ? activeNodes.reduce((sum, n) => sum + (1 - n.workload), 0) / activeNodes.length : 0
    };
  }

  destroy(): void {
    super.destroy();
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.nodes.clear();
    this.tasks.clear();
    this.consensusProposals.clear();
    this.isInitialized = false;
  }
}

export const globalSwarmCoordinator = new GlobalSwarmCoordinator();
