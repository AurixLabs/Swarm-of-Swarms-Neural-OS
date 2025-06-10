
import { KnowledgeCapability } from '../../types/KnowledgeDomainTypes';

/**
 * Creates a properly formatted KnowledgeCapability object
 */
export function createCapability(name: string, description?: string): KnowledgeCapability {
  return {
    id: `cap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    description
  };
}
