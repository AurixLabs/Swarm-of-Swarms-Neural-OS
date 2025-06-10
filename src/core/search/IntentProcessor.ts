/**
 * IntentProcessor - Core component of our cognitive search engine
 * 
 * This module processes user intents detected from queries and
 * transforms them into actionable search strategies.
 */

import { AIKernel, AIModule } from '@/core/AIKernel';
import { DetectedIntent } from '@/lib/ai/types/intentTypes';
import { BrowserEventEmitter } from '@/core/BrowserEventEmitter';
import { SystemKernel } from '@/core/SystemKernel';
import { Intent, IntentType } from '@/core/interfaces/IntentTypes';
import { culturalContextProvider } from '@/core/ethics/CulturalContextProvider';

export interface SearchStrategy {
  id: string;
  name: string;
  description: string;
  queryTransformation: (query: string, intent: DetectedIntent) => string;
  resultProcessing: (results: any[], intent: DetectedIntent) => any[];
  relevanceScoring: (item: any, intent: DetectedIntent) => number;
  confidence: number;
}

export class IntentProcessor implements AIModule {
  public id = 'core-intent-processor';
  public name = 'Cognitive Search Intent Processor';
  public version = '1.0.0';
  
  private strategies = new Map<string, SearchStrategy>();
  private events = new BrowserEventEmitter();
  private systemKernel: SystemKernel | null = null;
  
  initialize(kernel: AIKernel): void {
    console.log(`Initializing ${this.name}`);
    
    // Register default search strategies
    this.registerDefaultStrategies();
    
    // Set up event handlers
    kernel.events.onEvent('INTENT_ANALYZED', this.handleIntentAnalyzed);
    
    // Store reference to system kernel through kernel bridge
    try {
      this.systemKernel = (window as any).kernelRegistry?.getSystem() || null;
    } catch (err) {
      console.error('Failed to connect to System Kernel', err);
    }
  }
  
  /**
   * Register a search strategy for a specific intent
   */
  registerStrategy(strategy: SearchStrategy): void {
    this.strategies.set(strategy.id, strategy);
    this.events.emit('strategy:registered', strategy);
  }
  
  /**
   * Get the best search strategy for a given intent
   */
  getBestStrategyForIntent(intent: DetectedIntent): SearchStrategy | null {
    let bestStrategy: SearchStrategy | null = null;
    let highestConfidence = 0;
    
    for (const strategy of this.strategies.values()) {
      // Calculate match score between strategy and intent
      const matchScore = this.calculateStrategyMatch(strategy, intent);
      
      if (matchScore > highestConfidence) {
        highestConfidence = matchScore;
        bestStrategy = strategy;
      }
    }
    
    return bestStrategy;
  }
  
  /**
   * Calculate how well a strategy matches an intent
   */
  private calculateStrategyMatch(strategy: SearchStrategy, intent: DetectedIntent): number {
    // Base match on intent type
    let baseScore = 0;
    
    // Direct match on intent type
    if (strategy.id.includes(intent.type)) {
      baseScore = 0.7;
    } 
    // Similar intents
    else if (
      (strategy.id.includes('search') && intent.type === 'document') ||
      (strategy.id.includes('document') && intent.type === 'search')
    ) {
      baseScore = 0.5;
    }
    // Default score for general strategies
    else if (strategy.id.includes('general')) {
      baseScore = 0.3;
    }
    
    // Adjust based on specificity and entities
    const specificityBoost = intent.parameters?.requestSpecificity === 'highly-specific' ? 0.2 : 0;
    const entitiesBoost = intent.entities && Object.keys(intent.entities).length > 0 ? 0.1 : 0;
    
    return baseScore + specificityBoost + entitiesBoost;
  }
  
  /**
   * Process a search intent to find information
   */
  async processSearchIntent(
    intent: DetectedIntent,
    options: {
      maxResults?: number;
      timeLimit?: number;
    } = {}
  ): Promise<any[]> {
    // Log the processing
    console.log(`Processing search intent: ${intent.type}`, intent);
    
    // Check if this intent has cross-cultural dimensions that should be considered
    this.detectCrossCulturalDimensions(intent);
    
    // Get the best strategy for this intent
    const strategy = this.getBestStrategyForIntent(intent);
    
    if (!strategy) {
      console.warn('No suitable strategy found for intent', intent);
      return [];
    }
    
    // Transform the query based on the strategy
    const transformedQuery = strategy.queryTransformation(
      intent.rawText || '', 
      intent
    );
    
    // Emit transformed query event
    this.events.emit('query:transformed', {
      original: intent.rawText,
      transformed: transformedQuery,
      strategy: strategy.id
    });
    
    // In a real implementation, we would now:
    // 1. Submit the transformed query to search providers
    // 2. Process the results using the strategy
    // 3. Score and rank the results
    
    // For now, we'll just return a dummy result
    const mockResults = [
      { title: 'Result 1', url: 'https://example.com/1', snippet: 'This is a mock result' },
      { title: 'Result 2', url: 'https://example.com/2', snippet: 'Another mock result' }
    ];
    
    // Process the results
    const processedResults = strategy.resultProcessing(mockResults, intent);
    
    // Return the processed results
    return processedResults;
  }
  
  /**
   * Detect cross-cultural dimensions in an intent
   */
  private detectCrossCulturalDimensions(intent: DetectedIntent): void {
    // Skip if no raw text
    if (!intent.rawText) return;
    
    const query = intent.rawText.toLowerCase();
    
    // Check for cultural integration keywords
    const culturalKeywords = [
      'traditional', 'indigenous', 'cultural', 'eastern', 'western', 'ayurveda', 
      'chinese medicine', 'tcm', 'traditional medicine', 'ancient wisdom',
      'cross-cultural', 'integrate', 'combined approach', 'holistic', 'multiple perspectives'
    ];
    
    const hasCulturalDimension = culturalKeywords.some(keyword => query.includes(keyword));
    
    if (hasCulturalDimension) {
      // Add cultural dimension to intent if not already present
      if (!intent.parameters) {
        intent.parameters = {};
      }
      
      intent.parameters.hasCulturalDimension = true;
      
      // Try to identify specific cultural contexts
      const cultures = this.identifyCultures(query);
      if (cultures.length > 0) {
        intent.parameters.identifiedCultures = cultures;
      }
      
      // For educational queries
      if (query.includes('education') || query.includes('learning') || query.includes('teach')) {
        if (this.systemKernel) {
          this.systemKernel.events.emitEvent({
            type: 'CROSS_CULTURAL_EDUCATIONAL_INSIGHT',
            payload: {
              query,
              cultures,
              timestamp: Date.now()
            }
          });
        }
      }
      
      // For financial/economic queries
      if (query.includes('finance') || query.includes('economic') || query.includes('business')) {
        if (this.systemKernel) {
          this.systemKernel.events.emitEvent({
            type: 'CROSS_CULTURAL_FINANCIAL_MODEL',
            payload: {
              query,
              cultures,
              timestamp: Date.now()
            }
          });
        }
      }
      
      // For ethical queries
      if (query.includes('ethics') || query.includes('moral') || query.includes('values')) {
        if (this.systemKernel) {
          this.systemKernel.events.emitEvent({
            type: 'CROSS_CULTURAL_ETHICAL_FRAMEWORK',
            payload: {
              query,
              cultures,
              timestamp: Date.now()
            }
          });
        }
      }
    }
  }
  
  /**
   * Identify cultural systems mentioned in a query
   */
  private identifyCultures(query: string): string[] {
    const cultures: string[] = [];
    
    const culturalSystems = {
      'chinese': ['chinese', 'china', 'tcm', 'traditional chinese medicine', 'asian'],
      'ayurvedic': ['ayurveda', 'ayurvedic', 'indian', 'india', 'dosha'],
      'indigenous': ['indigenous', 'native', 'aboriginal', 'tribal', 'first nations'],
      'african': ['african', 'ubuntu', 'traditional african', 'yoruba', 'zulu'],
      'arabic': ['arabic', 'islamic', 'unani', 'middle eastern', 'prophetic medicine'],
      'tibetan': ['tibetan', 'tibet', 'buddhist medicine'],
      'japanese': ['japanese', 'japan', 'kampo', 'oriental'],
      'korean': ['korean', 'korea', 'hanbang'],
      'latinamerican': ['latin american', 'maya', 'aztec', 'inca', 'curanderismo']
    };
    
    for (const [culture, keywords] of Object.entries(culturalSystems)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        cultures.push(culture);
      }
    }
    
    return cultures;
  }
  
  /**
   * Handle intent analyzed events from the AI Kernel
   */
  private handleIntentAnalyzed = (payload: any): void => {
    // Extract the intent from the payload
    const intent = payload.intent || payload;
    
    if (!intent.type) {
      console.warn('Received invalid intent payload', payload);
      return;
    }
    
    // Log the received intent
    console.log('Intent processor received intent:', intent);
    
    // If it's a search-related intent, process it
    if (
      intent.type === 'search' || 
      intent.type === 'document' || 
      intent.type === 'chat'
    ) {
      this.processSearchIntent(intent as DetectedIntent)
        .then(results => {
          // Emit the results
          this.events.emit('search:results', {
            intent,
            results,
            timestamp: Date.now()
          });
          
          // Send to system kernel
          if (this.systemKernel) {
            this.systemKernel.events.emitEvent({
              type: 'DATA_UPDATED',
              payload: {
                source: 'search',
                intent,
                results,
                timestamp: Date.now()
              }
            });
          }
        })
        .catch(err => {
          console.error('Error processing search intent', err);
        });
    }
  };
  
  /**
   * Register the default search strategies
   */
  private registerDefaultStrategies(): void {
    // General search strategy
    this.registerStrategy({
      id: 'general-search',
      name: 'General Search',
      description: 'General purpose search strategy',
      confidence: 0.6,
      queryTransformation: (query, intent) => {
        // Simple query transformation
        return query;
      },
      resultProcessing: (results, intent) => {
        // Simple result processing
        return results;
      },
      relevanceScoring: (item, intent) => {
        // Simple relevance scoring
        return 0.5;
      }
    });
    
    // Fact-finding strategy
    this.registerStrategy({
      id: 'factual-search',
      name: 'Factual Search',
      description: 'Strategy for finding specific facts',
      confidence: 0.8,
      queryTransformation: (query, intent) => {
        // Transform question into fact-oriented query
        if (query.toLowerCase().startsWith('what is')) {
          return query.replace(/what is/i, 'definition:');
        }
        if (query.toLowerCase().startsWith('who is')) {
          return query.replace(/who is/i, 'person:');
        }
        return `facts about ${query}`;
      },
      resultProcessing: (results, intent) => {
        // Prioritize authoritative sources
        return results.sort((a, b) => {
          const aIsAuth = a.url?.includes('.edu') || a.url?.includes('.gov') ? 1 : 0;
          const bIsAuth = b.url?.includes('.edu') || b.url?.includes('.gov') ? 1 : 0;
          return bIsAuth - aIsAuth;
        });
      },
      relevanceScoring: (item, intent) => {
        // Score facts higher
        const hasFactIndicators = 
          item.snippet?.includes('is a') || 
          item.snippet?.includes('refers to') ||
          item.snippet?.includes('defined as');
        return hasFactIndicators ? 0.8 : 0.5;
      }
    });
    
    // How-to strategy
    this.registerStrategy({
      id: 'task-search',
      name: 'How-To Search',
      description: 'Strategy for finding instructions and guides',
      confidence: 0.8,
      queryTransformation: (query, intent) => {
        if (!query.toLowerCase().includes('how to')) {
          return `how to ${query}`;
        }
        return query;
      },
      resultProcessing: (results, intent) => {
        // Prioritize step-by-step guides
        return results.sort((a, b) => {
          const aIsGuide = a.snippet?.includes('step') || a.snippet?.includes('guide') ? 1 : 0;
          const bIsGuide = b.snippet?.includes('step') || b.snippet?.includes('guide') ? 1 : 0;
          return bIsGuide - aIsGuide;
        });
      },
      relevanceScoring: (item, intent) => {
        // Score how-tos higher
        const hasHowToIndicators = 
          item.snippet?.includes('step') || 
          item.snippet?.includes('guide') ||
          item.snippet?.includes('instructions');
        return hasHowToIndicators ? 0.9 : 0.5;
      }
    });
    
    // Cross-cultural integration strategy
    this.registerStrategy({
      id: 'cross-cultural-integration-search',
      name: 'Cross-Cultural Integration Search',
      description: 'Strategy for finding connections between diverse knowledge systems',
      confidence: 0.9,
      queryTransformation: (query, intent) => {
        // If already has cultural terms, keep it mostly as is
        if (intent.parameters?.hasCulturalDimension) {
          return `${query} cross-cultural integration`;
        }
        
        // Otherwise, transform to explicitly seek cultural connections
        return `${query} traditional knowledge systems integration`;
      },
      resultProcessing: (results, intent) => {
        // Process results to prioritize cross-cultural sources
        const cultures = intent.parameters?.identifiedCultures as string[] || [];
        
        return results.sort((a, b) => {
          // Give higher priority to results that mention cross-cultural integration
          const aHasCultural = a.snippet?.includes('integration') || 
                                a.snippet?.includes('traditional') || 
                                a.snippet?.includes('cultural') ? 1 : 0;
          const bHasCultural = b.snippet?.includes('integration') || 
                                b.snippet?.includes('traditional') || 
                                b.snippet?.includes('cultural') ? 1 : 0;
          
          // Further boost results that mention specific identified cultures
          let aCultureScore = 0;
          let bCultureScore = 0;
          
          cultures.forEach(culture => {
            if (a.snippet?.toLowerCase().includes(culture)) aCultureScore += 0.5;
            if (b.snippet?.toLowerCase().includes(culture)) bCultureScore += 0.5;
          });
          
          return (bHasCultural + bCultureScore) - (aHasCultural + aCultureScore);
        });
      },
      relevanceScoring: (item, intent) => {
        // Simple relevance scoring with cultural boosting
        const hasCulturalIndicators = 
          item.snippet?.includes('integration') || 
          item.snippet?.includes('traditional') ||
          item.snippet?.includes('cultural') ||
          item.snippet?.includes('indigenous');
          
        return hasCulturalIndicators ? 0.9 : 0.6;
      }
    });
  }
  
  /**
   * Subscribe to intent processor events
   */
  on(event: string, handler: (data: any) => void): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }
  
  /**
   * Clean up resources on destroy
   */
  destroy(): void {
    this.events.removeAllListeners();
    console.log(`${this.name} destroyed`);
  }
}

// Export singleton instance
export const intentProcessor = new IntentProcessor();
export default intentProcessor;
