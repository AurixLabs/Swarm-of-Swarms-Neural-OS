
import { DependencyNode } from './DependencyTypes';

export class CycleDetector {
  /**
   * Detect and construct a cycle in the dependency graph
   */
  public detectCycle(
    startNode: string,
    visited: Set<string>,
    nodes: Map<string, DependencyNode>
  ): string[] {
    const node = nodes.get(startNode);
    if (!node) return [startNode];
    
    for (const dep of node.dependencies) {
      if (visited.has(dep)) {
        const cycle = Array.from(visited);
        const startIdx = cycle.indexOf(dep);
        return cycle.slice(startIdx).concat(dep);
      }
      
      visited.add(dep);
      const cycle = this.detectCycle(dep, visited, nodes);
      if (cycle.length > 0) return cycle;
      visited.delete(dep);
    }
    
    return [];
  }

  /**
   * Check for missing dependencies
   */
  public checkMissingDependencies(
    nodes: Map<string, DependencyNode>
  ): Error[] {
    const errors: Error[] = [];
    
    for (const [nodeId, node] of nodes.entries()) {
      for (const dep of node.dependencies) {
        if (!nodes.has(dep) && (!node.optional || !node.optional.includes(dep))) {
          errors.push(new Error(`Missing dependency: ${dep} required by ${nodeId}`));
        }
      }
    }
    
    return errors;
  }
}
