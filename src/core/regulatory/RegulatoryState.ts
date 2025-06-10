
/**
 * State manager for regulatory kernel
 */
export class RegulatoryState {
  private state: Map<string, any> = new Map();
  
  /**
   * Get state value
   */
  getState<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }
  
  /**
   * Set state value
   */
  setState<T>(key: string, value: T): void {
    this.state.set(key, value);
  }
  
  /**
   * Remove state value
   */
  removeState(key: string): boolean {
    return this.state.delete(key);
  }
  
  /**
   * Check if state has key
   */
  hasState(key: string): boolean {
    return this.state.has(key);
  }
  
  /**
   * Get all state keys
   */
  getStateKeys(): string[] {
    return Array.from(this.state.keys());
  }
  
  /**
   * Clear all state
   */
  clearState(): void {
    this.state.clear();
  }
}
