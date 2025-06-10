
import { KnowledgeDomain, KnowledgeResponse, KnowledgeEngineConfig } from '../../types/KnowledgeDomainTypes';

export interface KnowledgeEngineEvent {
  type: string;
  payload: any;
  timestamp: number;
}

export interface DomainRegistrationEvent extends KnowledgeEngineEvent {
  domainId: string;
  domainType: string;
  domainName: string;
}

export interface DomainConnectionEvent extends KnowledgeEngineEvent {
  sourceDomainId: string;
  targetDomainId: string;
}

export type EngineEventHandler = (data: any) => void;
