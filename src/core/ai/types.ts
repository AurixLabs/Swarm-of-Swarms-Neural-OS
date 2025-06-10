
import { Module } from '../UniversalKernel';

export type AIModel = string;

export interface AIModule extends Module {
  id: string;
  initialize: () => Promise<void>;
  destroy?: () => Promise<void>;
}

export type AIEvent = 
  | { type: 'INTENT_ANALYZED'; payload: any }
  | { type: 'CONTEXT_UPDATED'; payload: any }
  | { type: 'RESPONSE_GENERATED'; payload: any }
  | { type: 'MODEL_CHANGED'; payload: any }
  | { type: 'ETHICS_VIOLATION'; payload: any };
