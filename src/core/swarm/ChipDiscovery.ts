
export interface ChipInfo {
  chipId: string;
  chipType: 'neural' | 'crypto' | 'networking' | 'storage' | 'coordinator';
  capabilities: string[];
  loadPercentage: number;
  lastSeen: number;
  ipAddress?: string;
  loraAddress?: string;
  wifiDirect?: boolean;
}

export interface SwarmTopology {
  localChip: ChipInfo;
  connectedChips: Map<string, ChipInfo>;
  meshRoutes: Map<string, string[]>; // chipId -> path to reach it
}

export class ChipDiscovery {
  private topology: SwarmTopology;
  private discoveryInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize as coordinator chip by default
    this.topology = {
      localChip: {
        chipId: `coord_${Date.now()}`,
        chipType: 'coordinator',
        capabilities: ['wasm_loading', 'task_distribution', 'swarm_coordination'],
        loadPercentage: 0,
        lastSeen: Date.now(),
        wifiDirect: true
      },
      connectedChips: new Map(),
      meshRoutes: new Map()
    };
  }

  startDiscovery(): void {
    console.log('🔍 Starting chip discovery protocol...');
    
    // Start broadcasting our presence
    this.discoveryInterval = setInterval(() => {
      this.broadcastPresence();
      this.scanForChips();
      this.cleanupStaleChips();
    }, 2000);

    // Start heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 5000);
  }

  stopDiscovery(): void {
    if (this.discoveryInterval) clearInterval(this.discoveryInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  private broadcastPresence(): void {
    const presenceData = {
      type: 'chip_discovery',
      chip: this.topology.localChip,
      timestamp: Date.now()
    };

    // In real implementation, this would use:
    // - WebRTC for browser-to-browser
    // - WiFi Direct for local mesh
    // - LoRa for long-range
    // For now, simulate via localStorage for demo
    localStorage.setItem(`chip_presence_${this.topology.localChip.chipId}`, JSON.stringify(presenceData));
    
    console.log(`📡 Broadcasting presence: ${this.topology.localChip.chipType} chip`);
  }

  private scanForChips(): void {
    // Simulate scanning for other chips via localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chip_presence_') && !key.includes(this.topology.localChip.chipId)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.type === 'chip_discovery' && data.chip) {
            this.addDiscoveredChip(data.chip);
          }
        } catch (error) {
          console.warn('Failed to parse chip discovery data:', error);
        }
      }
    }
  }

  private addDiscoveredChip(chip: ChipInfo): void {
    const existingChip = this.topology.connectedChips.get(chip.chipId);
    if (!existingChip) {
      console.log(`🔗 Discovered new ${chip.chipType} chip: ${chip.chipId}`);
    }
    
    this.topology.connectedChips.set(chip.chipId, {
      ...chip,
      lastSeen: Date.now()
    });

    // Update mesh routes
    this.updateMeshRoutes();
  }

  private updateMeshRoutes(): void {
    // Simple direct routing for now - in production would use proper mesh routing
    this.topology.meshRoutes.clear();
    for (const [chipId] of this.topology.connectedChips) {
      this.topology.meshRoutes.set(chipId, [chipId]); // Direct route
    }
  }

  private cleanupStaleChips(): void {
    const now = Date.now();
    const staleTimeout = 10000; // 10 seconds

    for (const [chipId, chip] of this.topology.connectedChips) {
      if (now - chip.lastSeen > staleTimeout) {
        console.log(`❌ Chip ${chipId} went offline`);
        this.topology.connectedChips.delete(chipId);
        this.topology.meshRoutes.delete(chipId);
      }
    }
  }

  private sendHeartbeat(): void {
    // Update our load percentage based on current activity
    this.topology.localChip.loadPercentage = this.calculateCurrentLoad();
    this.topology.localChip.lastSeen = Date.now();
  }

  private calculateCurrentLoad(): number {
    // Simple load calculation - in production would monitor actual CPU/memory
    const baseLoad = Math.random() * 30; // 0-30% base load
    const taskLoad = this.topology.connectedChips.size * 5; // 5% per connected chip
    return Math.min(95, baseLoad + taskLoad);
  }

  getSwarmTopology(): SwarmTopology {
    return { ...this.topology };
  }

  getConnectedChips(): ChipInfo[] {
    return Array.from(this.topology.connectedChips.values());
  }

  getChipByType(chipType: ChipInfo['chipType']): ChipInfo | null {
    for (const chip of this.topology.connectedChips.values()) {
      if (chip.chipType === chipType) {
        return chip;
      }
    }
    return null;
  }

  getBestChipForTask(requiredCapabilities: string[]): ChipInfo | null {
    let bestChip: ChipInfo | null = null;
    let bestScore = -1;

    for (const chip of this.topology.connectedChips.values()) {
      const hasCapabilities = requiredCapabilities.every(cap => 
        chip.capabilities.includes(cap)
      );
      
      if (hasCapabilities) {
        // Score based on load (lower is better) and capabilities (more is better)
        const score = (100 - chip.loadPercentage) + chip.capabilities.length;
        if (score > bestScore) {
          bestScore = score;
          bestChip = chip;
        }
      }
    }

    return bestChip;
  }
}
