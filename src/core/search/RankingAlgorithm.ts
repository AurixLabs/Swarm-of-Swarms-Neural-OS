
import { MultimodalSearchResult } from '@/types/search';
import { DetectedIntent } from '@/lib/ai/types/intentTypes';

export interface RankingParameters {
  intentRelevance?: number;  // 0.0 to 1.0, how much to weigh intent matching
  recency?: number;          // 0.0 to 1.0, how much to weigh recency
  confidence?: number;       // 0.0 to 1.0, how much to weigh confidence scores
  diversity?: number;        // 0.0 to 1.0, how much to diversify results
  sourceCredibility?: number; // 0.0 to 1.0, how much to weigh source credibility
  mediaType?: {              // Media type specific boosts
    image?: number;
    video?: number;
    audio?: number;
    text?: number;
    document?: number;
  }
}

export interface RankingAlgorithm {
  name: string;
  description: string;
  rank: (results: MultimodalSearchResult[], intent: DetectedIntent | null, params?: RankingParameters) => MultimodalSearchResult[];
}

// Default ranking parameters if none provided
const DEFAULT_RANKING_PARAMS: RankingParameters = {
  intentRelevance: 0.3,
  recency: 0.2,
  confidence: 0.3,
  diversity: 0.1,
  sourceCredibility: 0.1,
  mediaType: {
    image: 1.0,
    video: 1.0,
    audio: 1.0, 
    text: 1.0,
    document: 1.0
  }
};

export class StandardRankingAlgorithm implements RankingAlgorithm {
  name = 'standard';
  description = 'Standard ranking algorithm balancing relevance, recency, and confidence';
  
  rank(
    results: MultimodalSearchResult[], 
    intent: DetectedIntent | null, 
    params: RankingParameters = DEFAULT_RANKING_PARAMS
  ): MultimodalSearchResult[] {
    if (results.length === 0) return results;
    
    // Make a copy to avoid modifying the original
    const rankedResults = [...results];
    
    // Calculate scores for each result
    const scoredResults = rankedResults.map(result => {
      let score = result.confidence || 0.5; // Base score is the confidence
      
      // Intent relevance boost
      if (intent && intent.type && result.intentType === intent.type) {
        score += (params.intentRelevance || 0) * 0.2;
      }
      
      // Recency boost if timestamp exists
      if (result.timestamp) {
        const now = Date.now();
        const ageInHours = (now - result.timestamp) / (1000 * 60 * 60);
        // Newer content gets boosted more (inverse relationship with age)
        const recencyBoost = ageInHours < 24 ? (params.recency || 0) * 0.2 : 0;
        score += recencyBoost;
      }
      
      // Media type specific boosts
      if (params.mediaType && params.mediaType[result.mediaType]) {
        score *= (params.mediaType[result.mediaType] || 1.0);
      }
      
      // Source credibility boost
      if (result.source && isCredibleSource(result.source)) {
        score += (params.sourceCredibility || 0) * 0.2;
      }
      
      return { ...result, _rankingScore: score };
    });
    
    // Sort by the calculated score
    scoredResults.sort((a, b) => (b._rankingScore || 0) - (a._rankingScore || 0));
    
    // Diversity adjustment (ensure we don't have too many of the same type in a row)
    if ((params.diversity || 0) > 0) {
      const diversifiedResults = this.applyDiversityAdjustment(
        scoredResults, 
        params.diversity || 0
      );
      return diversifiedResults.map(r => {
        const { _rankingScore, ...result } = r;
        return result as MultimodalSearchResult;
      });
    }
    
    // Remove the internal ranking score before returning
    return scoredResults.map(r => {
      const { _rankingScore, ...result } = r;
      return result as MultimodalSearchResult;
    });
  }
  
  private applyDiversityAdjustment(
    results: (MultimodalSearchResult & { _rankingScore?: number })[], 
    diversityFactor: number
  ) {
    const mediaTypeCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    
    return results.map((result, index) => {
      const mediaType = result.mediaType;
      const source = result.source;
      
      // Count occurrences
      mediaTypeCounts[mediaType] = (mediaTypeCounts[mediaType] || 0) + 1;
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      
      // Apply diversity penalty if we have too many of the same type
      let diversityPenalty = 0;
      if (mediaTypeCounts[mediaType] > 2) {
        diversityPenalty += diversityFactor * 0.1 * (mediaTypeCounts[mediaType] - 2);
      }
      if (sourceCounts[source] > 2) {
        diversityPenalty += diversityFactor * 0.1 * (sourceCounts[source] - 2);
      }
      
      return {
        ...result,
        _rankingScore: (result._rankingScore || 0) - diversityPenalty
      };
    }).sort((a, b) => (b._rankingScore || 0) - (a._rankingScore || 0));
  }
}

// Equity-focused ranking algorithm that prioritizes fairness and inclusion
export class EquitableRankingAlgorithm implements RankingAlgorithm {
  name = 'equitable';
  description = 'Equitable ranking algorithm that prioritizes diverse sources and fairness';
  
  rank(
    results: MultimodalSearchResult[], 
    intent: DetectedIntent | null,
    params: RankingParameters = {
      ...DEFAULT_RANKING_PARAMS,
      diversity: 0.4, // Increased diversity emphasis
      sourceCredibility: 0.3 // Increased source credibility emphasis
    }
  ): MultimodalSearchResult[] {
    if (results.length === 0) return results;
    
    // Make a copy to avoid modifying the original
    const rankedResults = [...results];
    
    // Calculate scores for each result with equity considerations
    const scoredResults = rankedResults.map(result => {
      let score = result.confidence || 0.5; // Base score
      
      // Diverse sources get boosted
      if (!isMainstreamSource(result.source)) {
        score += 0.2; // Boost non-mainstream sources
      }
      
      // Apply standard ranking factors with equity modifications
      if (intent && intent.type && result.intentType === intent.type) {
        score += (params.intentRelevance || 0) * 0.15;
      }
      
      if (result.timestamp) {
        const now = Date.now();
        const ageInHours = (now - result.timestamp) / (1000 * 60 * 60);
        const recencyBoost = ageInHours < 48 ? (params.recency || 0) * 0.15 : 0;
        score += recencyBoost;
      }
      
      // Ensure diverse media types are represented
      if (isUnderrepresentedMediaType(result.mediaType, rankedResults)) {
        score += 0.25;
      }
      
      return { ...result, _rankingScore: score };
    });
    
    // Sort by the calculated score
    scoredResults.sort((a, b) => (b._rankingScore || 0) - (a._rankingScore || 0));
    
    // Force diversity by interleaving different types
    const diversified = this.forceInterleaving(scoredResults);
    
    // Remove the internal ranking score before returning
    return diversified.map(r => {
      const { _rankingScore, ...result } = r;
      return result as MultimodalSearchResult;
    });
  }
  
  private forceInterleaving(
    results: (MultimodalSearchResult & { _rankingScore?: number })[]
  ) {
    // Group by media type
    const groupedByType: Record<string, (MultimodalSearchResult & { _rankingScore?: number })[]> = {};
    
    results.forEach(result => {
      if (!groupedByType[result.mediaType]) {
        groupedByType[result.mediaType] = [];
      }
      groupedByType[result.mediaType].push(result);
    });
    
    const mediaTypes = Object.keys(groupedByType);
    const interleaved: (MultimodalSearchResult & { _rankingScore?: number })[] = [];
    
    // Maximum items of any type
    const maxItems = Math.max(...mediaTypes.map(type => groupedByType[type].length));
    
    // Interleave by taking one from each type in round-robin fashion
    for (let i = 0; i < maxItems; i++) {
      for (const type of mediaTypes) {
        if (groupedByType[type][i]) {
          interleaved.push(groupedByType[type][i]);
        }
      }
    }
    
    return interleaved;
  }
}

// Register available ranking algorithms
export const rankingAlgorithms: Record<string, RankingAlgorithm> = {
  standard: new StandardRankingAlgorithm(),
  equitable: new EquitableRankingAlgorithm()
};

// Utility functions for the ranking algorithms
function isCredibleSource(source: string): boolean {
  const credibleDomains = [
    'edu', 'gov', 'org', 'research', 'academic', 'science',
    'official', 'verified', 'trusted'
  ];
  
  return credibleDomains.some(domain => 
    source.toLowerCase().includes(domain)
  );
}

function isMainstreamSource(source: string): boolean {
  const mainstreamSources = [
    'google', 'facebook', 'amazon', 'microsoft', 'apple',
    'cnn', 'bbc', 'nytimes', 'washingtonpost', 'fox'
  ];
  
  return mainstreamSources.some(mainstream => 
    source.toLowerCase().includes(mainstream)
  );
}

function isUnderrepresentedMediaType(
  mediaType: string, 
  results: MultimodalSearchResult[]
): boolean {
  const typeCounts: Record<string, number> = {};
  
  results.forEach(r => {
    typeCounts[r.mediaType] = (typeCounts[r.mediaType] || 0) + 1;
  });
  
  const currentTypeCount = typeCounts[mediaType] || 0;
  const averageCount = Object.values(typeCounts).reduce((sum, count) => sum + count, 0) / 
                      Object.keys(typeCounts).length;
  
  return currentTypeCount < averageCount;
}

// Export a default ranking function for easier usage
export function rankResults(
  results: MultimodalSearchResult[],
  intent: DetectedIntent | null = null, 
  algorithmName: string = 'standard',
  params?: RankingParameters
): MultimodalSearchResult[] {
  const algorithm = rankingAlgorithms[algorithmName] || rankingAlgorithms.standard;
  return algorithm.rank(results, intent, params);
}
