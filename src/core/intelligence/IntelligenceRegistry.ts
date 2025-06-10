
import { BrowserEventEmitter } from '../BrowserEventEmitter';

/**
 * Intelligence Registry
 * Maintains a registry of intelligent components, algorithms, and capabilities
 */
export class IntelligenceRegistry {
  private intelligence: Map<string, any> = new Map();
  private events = new BrowserEventEmitter();
  
  /**
   * Register a new intelligence component
   */
  register(id: string, component: any): boolean {
    if (this.intelligence.has(id)) {
      return false;
    }
    
    this.intelligence.set(id, component);
    this.events.emit('INTELLIGENCE_REGISTERED', { id, timestamp: Date.now() });
    return true;
  }
  
  /**
   * Get an intelligence component
   */
  get(id: string): any {
    return this.intelligence.get(id);
  }
  
  /**
   * Check if an intelligence component exists
   */
  has(id: string): boolean {
    return this.intelligence.has(id);
  }
  
  /**
   * Get all intelligence component IDs
   */
  getAllIds(): string[] {
    return Array.from(this.intelligence.keys());
  }
  
  /**
   * Remove an intelligence component
   */
  remove(id: string): boolean {
    const result = this.intelligence.delete(id);
    if (result) {
      this.events.emit('INTELLIGENCE_REMOVED', { id, timestamp: Date.now() });
    }
    return result;
  }
}

// Export singleton instance
export const intelligenceRegistry = new IntelligenceRegistry();
