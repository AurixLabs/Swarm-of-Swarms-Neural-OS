
import { DomainType } from '../../types/DomainTypes';

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

export interface Domain {
  id: string;
  type: DomainType;
  name: string;
  connectToDomain(targetId: string, strength?: number): boolean;
  disconnectFromDomain(targetId: string): boolean;
  emitEvent(event: DomainEvent): void;
  shutdown(): void;
  exportState(): Record<string, any>;
  importState(state: Record<string, any>): boolean;
}
