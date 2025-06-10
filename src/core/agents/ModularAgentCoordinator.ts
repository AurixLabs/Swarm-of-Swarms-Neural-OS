
import { moduleRegistry } from '../modules/ModuleRegistry';

/**
 * Agent Coordinator that routes requests to available modules
 * Completely modular - only knows about the registry interface
 */
export class ModularAgentCoordinator {
  async processRequest(request: {
    capability: string;
    data: string;
    context?: string;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Find module that can handle this capability
      const module = moduleRegistry.getModuleByCapability(request.capability);
      
      if (!module) {
        return {
          success: false,
          error: `No module available for capability: ${request.capability}`,
          availableCapabilities: moduleRegistry.getCapabilities(),
          processingTime: Date.now() - startTime
        };
      }

      // Route request to the module
      const result = await module.process(request);
      
      return {
        ...result,
        totalProcessingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime
      };
    }
  }

  async processMultipleRequests(requests: any[]): Promise<any[]> {
    // Process requests in parallel for better performance
    const promises = requests.map(request => this.processRequest(request));
    return Promise.all(promises);
  }

  getSystemStatus() {
    return moduleRegistry.getSystemStatus();
  }

  getAvailableCapabilities(): string[] {
    return moduleRegistry.getCapabilities();
  }

  getModuleStatus() {
    const modules = moduleRegistry.getAllModules();
    return modules.map(module => ({
      id: module.id,
      name: module.name,
      status: module.getStatus(),
      capabilities: module.capabilities
    }));
  }
}

// Export singleton coordinator
export const agentCoordinator = new ModularAgentCoordinator();
