
import { SwarmModule } from '../module/SwarmModule';
import { SwarmModuleMetadata } from '../unified/UnifiedTypes';
import { ModuleStatus } from '../module/ModuleLifecycleManager';

export abstract class SwarmModuleBase implements SwarmModule {
  public id: string;
  public name: string;
  public version: string;
  public status: ModuleStatus;
  public metadata: SwarmModuleMetadata;
  public maxAgents: number;
  public currentAgents: number;
  public agentType: 'cognitive' | 'processing' | 'memory' | 'hybrid';
  
  constructor(id: string, name: string, version: string = '1.0.0') {
    this.id = id;
    this.name = name;
    this.version = version;
    this.status = 'stopped';
    this.maxAgents = 100;
    this.currentAgents = 0;
    this.agentType = 'hybrid';
    
    this.metadata = {
      id,
      name,
      version,
      dependencies: [],
      configuration: {},
      permissions: [],
      maxAgents: this.maxAgents,
      currentAgents: this.currentAgents,
      swarmCapabilities: [],
      author: 'CMA System'
    };
  }
  
  abstract initialize(): Promise<boolean>;
  abstract start(): Promise<boolean>;
  abstract stop(): Promise<boolean>;
  abstract destroy(): void;
  abstract scaleUp(agentCount: number): Promise<boolean>;
  abstract scaleDown(agentCount: number): Promise<boolean>;
  abstract getSwarmMetrics(): any;
  
  public getMetadata(): SwarmModuleMetadata {
    return { ...this.metadata };
  }
  
  public updateMetadata(updates: Partial<SwarmModuleMetadata>): void {
    this.metadata = { ...this.metadata, ...updates };
  }
}
