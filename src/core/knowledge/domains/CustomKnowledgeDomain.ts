
import { BaseKnowledgeDomain } from '../BaseKnowledgeDomain';
import { KnowledgeResponse, KnowledgeCapability } from '../../types/KnowledgeDomainTypes';

/**
 * CustomKnowledgeDomain - Allows users to create their own specialized knowledge domains
 * 
 * This enables "solopreneurs" to master their own domain or create completely new ones
 */
export class CustomKnowledgeDomain extends BaseKnowledgeDomain {
  private capabilities: KnowledgeCapability[];
  private knowledgeBase: string;
  
  constructor(
    name: string,
    type: string,
    capabilities: KnowledgeCapability[] = [],
    knowledgeBase: string = ''
  ) {
    // Generate a unique ID based on name and type
    const id = `${type.toLowerCase()}_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    
    super(id, name, type);
    
    this.capabilities = capabilities;
    this.knowledgeBase = knowledgeBase;
    
    console.log(`Created new custom knowledge domain: ${name} (${type})`);
  }
  
  public async query(question: string, context?: any): Promise<KnowledgeResponse> {
    console.log(`${this.name} domain processing query: ${question}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In a real implementation, this would use a proper semantic search/matching algorithm
    // For now, we'll use a very simple keyword matching approach
    
    const lowerQuestion = question.toLowerCase();
    
    // Find relevant sections in the knowledge base
    const knowledgeLines = this.knowledgeBase.split('\n');
    const relevantLines = knowledgeLines.filter(line => {
      const lowerLine = line.toLowerCase();
      // Check if any word in the question is contained in this line
      return lowerQuestion.split(' ').some(word => 
        word.length > 3 && lowerLine.includes(word)
      );
    });
    
    if (relevantLines.length > 0) {
      // Found relevant knowledge
      const combinedKnowledge = relevantLines.join(' ');
      
      return this.createResponse(
        `Based on my ${this.type} expertise, I can address "${question}" as follows: ${combinedKnowledge}`,
        0.85, // Confidence level
        [], // No sources for now
        this.extractKeyTerms(combinedKnowledge, 5) // Extract key terms as related concepts
      );
    }
    
    // Check if any capabilities match
    const matchingCapability = this.capabilities.find(cap => 
      lowerQuestion.includes(cap.name.toLowerCase())
    );
    
    if (matchingCapability) {
      return this.createResponse(
        `As a specialist in ${this.type}, I can help with ${matchingCapability.name}. For your question "${question}", I would analyze it through the lens of my ${this.type} expertise.`,
        0.7, // Medium confidence
        [],
        [matchingCapability.name, this.type]
      );
    }
    
    // Fallback response
    return this.createResponse(
      `From my ${this.type} perspective, I would approach "${question}" by applying specialized knowledge in this domain. However, I don't have enough specific information in my knowledge base to give a detailed answer.`,
      0.4, // Low confidence
      [],
      [this.type]
    );
  }
  
  public getCapabilities(): KnowledgeCapability[] {
    return this.capabilities;
  }
  
  /**
   * Add new capability to this domain
   */
  public addCapability(capability: KnowledgeCapability): void {
    this.capabilities.push(capability);
  }
  
  /**
   * Update the knowledge base
   */
  public updateKnowledgeBase(knowledge: string): void {
    this.knowledgeBase = knowledge;
  }
  
  /**
   * Extract key terms from text
   */
  private extractKeyTerms(text: string, maxTerms: number = 3): string[] {
    // Very simple implementation - in a real system, this would use NLP
    const words = text.split(/\s+/);
    const termCounts: Record<string, number> = {};
    
    // Count occurrences of words with length > 3
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 3) {
        termCounts[cleanWord] = (termCounts[cleanWord] || 0) + 1;
      }
    });
    
    // Sort by frequency
    const sortedTerms = Object.entries(termCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([term]) => term);
    
    // Return most frequent terms (up to maxTerms)
    return sortedTerms.slice(0, maxTerms);
  }
}
