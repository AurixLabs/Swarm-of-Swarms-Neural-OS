
import { TemporalState } from './TemporalState';
import { ModuleWasmLoader } from './ModuleWasmLoader';

// Independent Module - 100% independent with temporal sync (Requirement 1)
export class IndependentModule {
  private moduleId: string;
  private config: any;
  private wasmLoader: ModuleWasmLoader;
  private temporalState: TemporalState | null = null;
  private eventListeners = new Map<string, Function>();

  constructor(moduleId: string, config: any, wasmLoader: ModuleWasmLoader) {
    this.moduleId = moduleId;
    this.config = config;
    this.wasmLoader = wasmLoader;
    console.log(`🧩 Independent module ${moduleId} created`);
  }

  // Connect to temporal state (no bridges - Requirement 2 & 4)
  connectToTemporalState(temporalState: TemporalState) {
    this.temporalState = temporalState;
    
    // Listen for temporal events
    const stateListener = (data: any) => this.handleTemporalStateChange(data);
    this.eventListeners.set('state:changed', stateListener);
    this.temporalState.on('state:changed', stateListener);
    
    console.log(`🔗 Module ${this.moduleId} connected to temporal state`);
  }

  disconnectFromTemporalState() {
    if (this.temporalState) {
      this.eventListeners.forEach((listener, event) => {
        this.temporalState!.off(event, listener);
      });
      this.eventListeners.clear();
      this.temporalState = null;
      console.log(`🔌 Module ${this.moduleId} disconnected from temporal state`);
    }
  }

  private handleTemporalStateChange(data: any) {
    // React to temporal state changes
    console.log(`⚡ Module ${this.moduleId} received temporal update:`, data);
  }

  // Module-specific WASM loading (Requirement 6)
  async loadWasm(wasmPath: string): Promise<boolean> {
    return await this.wasmLoader.loadModule(wasmPath);
  }

  // Module can be hot-swapped (Requirement 3)
  async initialize(): Promise<boolean> {
    try {
      // Initialize module-specific WASM if needed
      if (this.config.wasmPath) {
        await this.loadWasm(this.config.wasmPath);
      }
      return true;
    } catch (error) {
      console.error(`Failed to initialize module ${this.moduleId}:`, error);
      return false;
    }
  }

  getId(): string {
    return this.moduleId;
  }

  getConfig(): any {
    return this.config;
  }
}
