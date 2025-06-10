
import { systemKernel } from '@/core/SystemKernel';

/**
 * Module metadata for plugin registration
 */
export interface ModuleMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
}

/**
 * Plugin interface that all modules must implement
 */
export interface Plugin {
  id: string;
  initialize(registry: PluginRegistry): boolean;
  destroy(): void;
  [key: string]: any;
}

/**
 * Plugin Registry
 * 
 * Manages the lifecycle of plugins and modules in the system.
 * Provides dependency resolution and health monitoring.
 */
export class PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private metadata = new Map<string, ModuleMetadata>();
  private initOrder: string[] = [];
  private initialized = false;
  
  /**
   * Register a plugin with the registry
   */
  public registerPlugin(plugin: Plugin, metadata?: ModuleMetadata): boolean {
    if (!plugin || !plugin.id) {
      console.error('Invalid plugin: missing ID');
      return false;
    }
    
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with ID ${plugin.id} is already registered`);
      return false;
    }
    
    this.plugins.set(plugin.id, plugin);
    
    if (metadata) {
      this.metadata.set(plugin.id, metadata);
    }
    
    return true;
  }
  
  /**
   * Unregister a plugin by ID
   */
  public unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }
    
    try {
      plugin.destroy();
    } catch (error) {
      console.error(`Error destroying plugin ${pluginId}:`, error);
    }
    
    this.plugins.delete(pluginId);
    this.metadata.delete(pluginId);
    
    // Remove from initialization order
    const index = this.initOrder.indexOf(pluginId);
    if (index !== -1) {
      this.initOrder.splice(index, 1);
    }
    
    return true;
  }
  
  /**
   * Get a plugin by ID
   */
  public getPlugin<T extends Plugin>(pluginId: string): T | undefined {
    return this.plugins.get(pluginId) as T | undefined;
  }
  
  /**
   * Get metadata for a plugin
   */
  public getMetadata(pluginId: string): ModuleMetadata | undefined {
    return this.metadata.get(pluginId);
  }
  
  /**
   * List all registered plugins
   */
  public listPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
  
  /**
   * Initialize all registered plugins in dependency order
   */
  public initialize(): boolean {
    if (this.initialized) {
      return true;
    }
    
    // Sort plugins by dependency order
    const order = this.resolveDependencyOrder();
    
    // Initialize plugins in order
    for (const pluginId of order) {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) continue;
      
      try {
        const success = plugin.initialize(this);
        if (!success) {
          console.error(`Failed to initialize plugin: ${pluginId}`);
          // Optionally handle failure (skip or abort)
        } else {
          this.initOrder.push(pluginId);
        }
      } catch (error) {
        console.error(`Error initializing plugin ${pluginId}:`, error);
        // Optionally handle error
      }
    }
    
    this.initialized = true;
    return true;
  }
  
  /**
   * Shut down all plugins in reverse initialization order
   */
  public shutdown(): void {
    // Destroy plugins in reverse order of initialization
    for (const pluginId of [...this.initOrder].reverse()) {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) continue;
      
      try {
        plugin.destroy();
      } catch (error) {
        console.error(`Error destroying plugin ${pluginId}:`, error);
      }
    }
    
    this.initOrder = [];
    this.initialized = false;
  }
  
  /**
   * Check if a plugin is registered
   */
  public hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }
  
  /**
   * Get plugin status information
   */
  public getPluginStatus(): Array<{
    id: string;
    initialized: boolean;
    metadata?: ModuleMetadata;
  }> {
    return Array.from(this.plugins.keys()).map(id => ({
      id,
      initialized: this.initOrder.includes(id),
      metadata: this.metadata.get(id)
    }));
  }
  
  /**
   * Resolve plugin dependencies and create initialization order
   */
  private resolveDependencyOrder(): string[] {
    const result: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (pluginId: string) => {
      if (visited.has(pluginId)) return;
      if (visiting.has(pluginId)) {
        console.error(`Circular dependency detected for plugin ${pluginId}`);
        return;
      }
      
      visiting.add(pluginId);
      
      const meta = this.metadata.get(pluginId);
      if (meta && meta.dependencies) {
        for (const depId of meta.dependencies) {
          if (this.plugins.has(depId)) {
            visit(depId);
          } else {
            console.warn(`Dependency ${depId} not found for plugin ${pluginId}`);
          }
        }
      }
      
      visiting.delete(pluginId);
      visited.add(pluginId);
      result.push(pluginId);
    };
    
    // Visit all plugins
    for (const pluginId of this.plugins.keys()) {
      visit(pluginId);
    }
    
    return result;
  }
  
  /**
   * Find plugins with a specific interface or method
   */
  public findPluginsByInterface(method: string): Plugin[] {
    return Array.from(this.plugins.values()).filter(plugin => 
      typeof plugin[method] === 'function'
    );
  }
  
  /**
   * Add dependencies to a plugin
   */
  public addDependencies(pluginId: string, dependencies: string[]): boolean {
    const meta = this.metadata.get(pluginId);
    
    if (!meta) {
      const newMeta: ModuleMetadata = {
        name: pluginId,
        version: '1.0.0',
        dependencies
      };
      this.metadata.set(pluginId, newMeta);
      return true;
    }
    
    meta.dependencies = [...new Set([
      ...(meta.dependencies || []),
      ...dependencies
    ])];
    
    return true;
  }
}

// Export a singleton instance
export const pluginRegistry = new PluginRegistry();
