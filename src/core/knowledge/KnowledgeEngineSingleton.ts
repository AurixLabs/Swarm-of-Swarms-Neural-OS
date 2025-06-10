
import { KnowledgeEngine } from './KnowledgeEngineCore';

// Create a singleton instance of the Knowledge Engine
export const knowledgeEngine = new KnowledgeEngine();

// Hook for using the Knowledge Engine
export const useKnowledgeEngine = () => {
  return {
    domains: knowledgeEngine.listDomains(),
    registerDomain: knowledgeEngine.registerDomain.bind(knowledgeEngine),
    unregisterDomain: knowledgeEngine.unregisterDomain.bind(knowledgeEngine),
    getDomain: knowledgeEngine.getDomain.bind(knowledgeEngine),
    query: knowledgeEngine.query.bind(knowledgeEngine),
    synthesizeKnowledge: knowledgeEngine.synthesizeKnowledge.bind(knowledgeEngine),
    setDomainWeight: knowledgeEngine.setDomainWeight.bind(knowledgeEngine),
    getConfig: knowledgeEngine.getConfig.bind(knowledgeEngine),
    updateConfig: knowledgeEngine.updateConfig.bind(knowledgeEngine),
    on: knowledgeEngine.on.bind(knowledgeEngine),
  };
};
