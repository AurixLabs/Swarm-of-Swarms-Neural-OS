
export interface KnowledgeEngineConfig {
  enableCaching: boolean;
  maxCacheSize: number;
  timeout?: number;
  priorityDomains?: string[];
}
