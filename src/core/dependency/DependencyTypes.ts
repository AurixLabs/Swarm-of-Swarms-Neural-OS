
export type DependencyNode = {
  id: string;
  dependencies: string[];
  optional?: string[];
  metadata?: Record<string, any>;
  version?: string;
};

export type ResolutionInfo = {
  nodeCount: number;
  resolvedCount: number;
  resolutionTime: number;
  isComplete: boolean;
  warnings: string[];
};

export type ResolutionState = {
  visited: Set<string>;
  resolved: string[];
  visiting: Set<string>;
};
