
/**
 * Domain Type definitions
 */

export enum DomainType {
  COGNITIVE = 'cognitive',
  ONTOLOGICAL = 'ontological',
  EPISTEMOLOGICAL = 'epistemological',
  ETHICAL = 'ethical',
  REGULATORY = 'regulatory',
  COLLABORATIVE = 'collaborative',
  SECURITY = 'security'
}

export interface DomainConfig {
  id: string;
  type: DomainType;
  name: string;
  description: string;
  active: boolean;
  secured: boolean;
  priority: number;
}

export interface DomainConnection {
  sourceId: string;
  targetId: string;
  strength: number;
  bidirectional: boolean;
  timestamp: number;
}

export interface DomainEvent {
  type: string;
  sourceId: string;
  payload: any;
  timestamp: number;
}
