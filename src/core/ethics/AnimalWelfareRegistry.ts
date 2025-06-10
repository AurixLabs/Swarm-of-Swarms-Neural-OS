import * as crypto from 'crypto-js';
import { systemKernel } from '@/core/SystemKernel';
import { immutableEthicsCore } from './ImmutableEthicsCore';
import { 
  AnimalWelfarePolicy, 
  SpeciesConsideration,
  AnimalWelfareConsideration,
  EthicalPriorityRule
} from '@/core/regulatory/types';
import { culturalContextProvider } from './CulturalContextProvider';

/**
 * Animal Welfare Registry
 * 
 * This system ensures ethical consideration of animal welfare with elevated priority:
 * 1. Animal welfare considerations take precedence over cultural traditions when harm is involved
 * 2. Respect for cultural diversity is maintained until it conflicts with animal welfare
 * 3. Promoting ethical evolution toward greater compassion
 * 4. Providing educational alternatives rather than censorship
 */

// Cryptographic integrity validation
const ANIMAL_WELFARE_INTEGRITY_KEY = "MCMA_ANIMAL_WELFARE_INTEGRITY_KEY";

export class AnimalWelfareRegistry {
  private static instance: AnimalWelfareRegistry;
  private policies: Map<string, AnimalWelfarePolicy> = new Map();
  private speciesConsiderations: Map<string, SpeciesConsideration> = new Map();
  private priorityRules: Map<string, EthicalPriorityRule> = new Map();
  private readonly creationTimestamp: number;
  
  private constructor() {
    this.creationTimestamp = Date.now();
    this.initializeBasePolicies();
    this.initializeSpeciesConsiderations();
    this.initializePriorityRules();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): AnimalWelfareRegistry {
    if (!AnimalWelfareRegistry.instance) {
      AnimalWelfareRegistry.instance = new AnimalWelfareRegistry();
    }
    return AnimalWelfareRegistry.instance;
  }
  
  /**
   * Initialize with foundational animal welfare policies
   * Now with elevated priority levels
   */
  private initializeBasePolicies(): void {
    const policyData = [
      {
        id: 'unnecessary_suffering',
        name: 'Prevention of Unnecessary Suffering',
        description: 'Animals should not be subjected to unnecessary suffering, regardless of use context',
        applicability: 'universal',
        culturalContexts: ['all'],
        implementation: 'immediate',
        priority: 'critical'
      },
      {
        id: 'humane_treatment',
        name: 'Humane Treatment Principle',
        description: 'When animals are used for human purposes, they must be treated with care and humanity',
        applicability: 'universal',
        culturalContexts: ['all'],
        implementation: 'immediate',
        priority: 'elevated'
      },
      {
        id: 'ethical_evolution',
        name: 'Ethical Evolution in Animal Use',
        description: 'Society should continuously improve standards of animal welfare and explore alternatives to harmful practices',
        applicability: 'aspirational',
        culturalContexts: ['all'],
        implementation: 'gradual',
        priority: 'standard'
      },
      {
        id: 'cultural_context',
        name: 'Cultural Context Consideration',
        description: 'Animal welfare policies must consider cultural contexts while still protecting core welfare principles',
        applicability: 'contextual',
        culturalContexts: ['all'],
        implementation: 'educational',
        priority: 'standard'
      },
      {
        id: 'scientific_foundation',
        name: 'Scientific Foundation',
        description: 'Animal welfare policies should be based on best available scientific evidence about animal sentience and suffering',
        applicability: 'universal',
        culturalContexts: ['all'],
        implementation: 'gradual',
        priority: 'elevated'
      },
      {
        id: 'welfare_over_tradition',
        name: 'Welfare Priority Principle',
        description: 'When cultural or religious traditions conflict with animal welfare, preventing suffering takes precedence',
        applicability: 'universal',
        culturalContexts: ['all'],
        implementation: 'educational',
        priority: 'critical'
      }
    ];

    // Add each policy with proper integrity hash calculation
    policyData.forEach(policy => {
      // Create integrity hash
      const policyString = `${policy.id}:${policy.name}:${policy.description}:${policy.applicability}:${policy.culturalContexts.join(',')}:${policy.implementation}:${policy.priority}`;
      const integrityHash = crypto.SHA256(policyString + ANIMAL_WELFARE_INTEGRITY_KEY).toString();
      
      const completePolicy: AnimalWelfarePolicy = {
        ...policy,
        integrityHash
      } as AnimalWelfarePolicy;
      
      this.policies.set(policy.id, completePolicy);
    });
  }
  
  /**
   * Initialize priority rules that establish ethical hierarchy
   */
  private initializePriorityRules(): void {
    const rules: EthicalPriorityRule[] = [
      {
        id: 'welfare_over_tradition',
        name: 'Animal Welfare Supersedes Harmful Traditions',
        description: 'When cultural or religious traditions cause harm to animals, the welfare of animals takes priority',
        condition: 'always',
        priority: 90, // Very high priority
        overrides: ['cultural_tradition', 'religious_practice', 'economic_interest']
      },
      {
        id: 'sentience_recognition',
        name: 'Recognition of Animal Sentience',
        description: 'The capacity of animals to feel pain and suffer must be recognized regardless of cultural context',
        condition: 'always',
        priority: 85,
        overrides: ['cultural_tradition', 'economic_interest']
      },
      {
        id: 'humane_alternatives',
        name: 'Promotion of Humane Alternatives',
        description: 'Educational approaches to promote humane alternatives should be prioritized over censorship',
        condition: 'conditional',
        priority: 75,
        overrides: ['information_restriction']
      }
    ];
    
    rules.forEach(rule => {
      this.priorityRules.set(rule.id, rule);
    });
  }
  
  /**
   * Initialize species considerations
   */
  private initializeSpeciesConsiderations(): void {
    this.addSpeciesConsideration({
      speciesId: 'mammals_livestock',
      speciesName: 'Livestock Mammals',
      sentience: 0.9,
      culturalSignificance: {
        'western_european': 0.7,
        'eastern_asian': 0.6,
        'indigenous': 0.8,
        'middle_eastern': 0.7,
        'african': 0.8,
        'south_asian': 0.9
      },
      sustainabilityImpact: -0.7,
      welfareAssessment: {
        currentPractices: 0.3,
        potentialImprovements: [
          'Free-range practices',
          'Elimination of factory farming',
          'Pain management protocols',
          'Transport and slaughter reform',
          'Cellular agriculture alternatives'
        ],
        ethicalThreshold: 0.7
      }
    });
    
    this.addSpeciesConsideration({
      speciesId: 'birds_poultry',
      speciesName: 'Poultry Birds',
      sentience: 0.8,
      culturalSignificance: {
        'western_european': 0.6,
        'eastern_asian': 0.6,
        'indigenous': 0.7,
        'middle_eastern': 0.7,
        'african': 0.7,
        'south_asian': 0.8
      },
      sustainabilityImpact: -0.6,
      welfareAssessment: {
        currentPractices: 0.2,
        potentialImprovements: [
          'Cage-free housing',
          'Natural behavior accommodation',
          'Humane slaughter methods',
          'Breeding for welfare not just production',
          'Cellular agriculture alternatives'
        ],
        ethicalThreshold: 0.7
      }
    });
    
    this.addSpeciesConsideration({
      speciesId: 'fish_aquaculture',
      speciesName: 'Aquaculture Fish',
      sentience: 0.7,
      culturalSignificance: {
        'western_european': 0.5,
        'eastern_asian': 0.8,
        'indigenous': 0.7,
        'middle_eastern': 0.6,
        'african': 0.6,
        'south_asian': 0.7
      },
      sustainabilityImpact: -0.5,
      welfareAssessment: {
        currentPractices: 0.3,
        potentialImprovements: [
          'Reduced stocking densities',
          'Improved water quality standards',
          'Humane slaughter methods',
          'Disease prevention strategies',
          'Cellular agriculture alternatives'
        ],
        ethicalThreshold: 0.6
      }
    });
  }
  
  /**
   * Add an animal welfare policy with integrity protection
   */
  public addPolicy(policy: Omit<AnimalWelfarePolicy, 'integrityHash'>): void {
    // Create integrity hash
    const policyData = `${policy.id}:${policy.name}:${policy.description}:${policy.applicability}:${policy.culturalContexts.join(',')}:${policy.implementation}:${policy.priority}`;
    const integrityHash = crypto.SHA256(policyData + ANIMAL_WELFARE_INTEGRITY_KEY).toString();
    
    const completePolicy: AnimalWelfarePolicy = {
      ...policy,
      integrityHash
    };
    
    this.policies.set(policy.id, completePolicy);
  }
  
  /**
   * Add species consideration
   */
  public addSpeciesConsideration(consideration: SpeciesConsideration): void {
    this.speciesConsiderations.set(consideration.speciesId, consideration);
  }
  
  /**
   * Get all animal welfare policies
   */
  public getPolicies(): ReadonlyArray<AnimalWelfarePolicy> {
    return Array.from(this.policies.values());
  }
  
  /**
   * Get species considerations
   */
  public getSpeciesConsiderations(): ReadonlyArray<SpeciesConsideration> {
    return Array.from(this.speciesConsiderations.values());
  }
  
  /**
   * Get a specific species consideration
   */
  public getSpeciesConsideration(speciesId: string): SpeciesConsideration | undefined {
    return this.speciesConsiderations.get(speciesId);
  }
  
  /**
   * Get ethical priority rules
   */
  public getPriorityRules(): ReadonlyArray<EthicalPriorityRule> {
    return Array.from(this.priorityRules.values());
  }
  
  /**
   * Evaluate a practice for animal welfare concerns with priority assessment
   * Returns null if no concerns or a structured assessment if concerns exist
   */
  public evaluatePractice(
    practice: string,
    speciesId: string,
    culturalContextId?: string
  ): AnimalWelfareConsideration | null {
    const species = this.speciesConsiderations.get(speciesId);
    if (!species) return null;
    
    // Get cultural context if specified
    const culturalPerspective = culturalContextId 
      ? culturalContextProvider.getRelevantCulturalContext('global', culturalContextId)
      : null;
    
    // Analyze the practice (this would be more sophisticated in reality)
    const harmfulPractices = [
      'factory farm', 'battery cage', 'gestation crate', 'force feed',
      'live transport', 'no stunning', 'growth hormone', 'overcrowded'
    ];
    
    const traditionalPractices = [
      'religious ritual', 'cultural tradition', 'ceremony', 'festival',
      'heritage', 'traditional', 'ancestral practice'
    ];
    
    const isHarmful = harmfulPractices.some(term => 
      practice.toLowerCase().includes(term)
    );
    
    const isTraditional = traditionalPractices.some(term =>
      practice.toLowerCase().includes(term)
    );
    
    if (!isHarmful) return null;
    
    // Determine if this is a case where welfare overrides cultural tradition
    const overridesCulture = isHarmful && isTraditional;
    
    let welfareImpact: 'beneficial' | 'neutral' | 'harmful' | 'severely_harmful' = 'harmful';
    if (practice.toLowerCase().includes('force feed') || 
        practice.toLowerCase().includes('no stunning') ||
        practice.toLowerCase().includes('overcrowded')) {
      welfareImpact = 'severely_harmful';
    }
    
    // Generate welfare consideration
    const consideration: AnimalWelfareConsideration = {
      speciesId: species.speciesId,
      speciesName: species.speciesName,
      welfareImpact,
      justification: overridesCulture
        ? `This practice appears to cause suffering to ${species.speciesName} despite its cultural significance. According to our ethical framework, welfare takes precedence.`
        : `The practice appears to involve conditions known to cause suffering in ${species.speciesName}`,
      alternativeApproaches: species.welfareAssessment.potentialImprovements,
      culturalContext: culturalPerspective ? [culturalPerspective.cultureId] : undefined,
      overridesCulturalTradition: overridesCulture
    };
    
    // Emit event for tracking
    systemKernel.events.emitEvent({
      type: 'ANIMAL_ETHICS_CONCERN',
      payload: {
        consideration,
        timestamp: Date.now(),
        practice,
        overridesCulturalTradition: overridesCulture
      }
    });
    
    return consideration;
  }
  
  /**
   * Evaluate a cultural practice against welfare principles
   * Determines if animal welfare should override the cultural practice
   */
  public evaluateCulturalPracticeForWelfareOverride(
    practiceDescription: string,
    culturalId: string,
    speciesId: string
  ): {
    shouldOverride: boolean;
    rationale: string;
    alternativeApproaches: string[];
    welfareImpact: 'beneficial' | 'neutral' | 'harmful' | 'severely_harmful';
  } {
    const species = this.speciesConsiderations.get(speciesId);
    if (!species) {
      return {
        shouldOverride: false,
        rationale: "Insufficient information about the species involved",
        alternativeApproaches: [],
        welfareImpact: 'neutral'
      };
    }

    // Simplified harm assessment - would be more sophisticated in reality
    const harmTerms = ['slaughter', 'kill', 'pain', 'suffering', 'confined', 'force', 'restrain'];
    const harmScore = harmTerms.filter(term => 
      practiceDescription.toLowerCase().includes(term)
    ).length;
    
    // Evaluate the practice
    if (harmScore > 2) {
      return {
        shouldOverride: true,
        rationale: `This cultural practice causes significant harm to ${species.speciesName}. According to our ethical priority system, animal welfare takes precedence over cultural traditions when harm is involved.`,
        alternativeApproaches: species.welfareAssessment.potentialImprovements,
        welfareImpact: 'severely_harmful'
      };
    } else if (harmScore > 0) {
      return {
        shouldOverride: true,
        rationale: `This cultural practice may cause harm to ${species.speciesName}. Our ethical framework prioritizes animal welfare while still respecting cultural diversity, suggesting alternatives rather than censorship.`,
        alternativeApproaches: species.welfareAssessment.potentialImprovements,
        welfareImpact: 'harmful'
      };
    } else {
      return {
        shouldOverride: false,
        rationale: "No clear evidence of harm to animals in this cultural practice",
        alternativeApproaches: [],
        welfareImpact: 'neutral'
      };
    }
  }
  
  /**
   * Evaluate a policy's potential impacts on animal welfare
   */
  public evaluatePolicyImpact(
    policyDescription: string
  ): {
    impact: 'positive' | 'neutral' | 'negative';
    speciesAffected: string[];
    justification: string;
  } {
    // This would be a sophisticated analysis in a real implementation
    // Here we're providing a simplified version
    
    const positiveTerms = ['welfare', 'humane', 'ethical', 'compassion', 'reduce suffering'];
    const negativeTerms = ['intensive', 'accelerate production', 'deregulate', 'remove restrictions'];
    
    const positiveScore = positiveTerms.filter(term => 
      policyDescription.toLowerCase().includes(term)
    ).length;
    
    const negativeScore = negativeTerms.filter(term => 
      policyDescription.toLowerCase().includes(term)
    ).length;
    
    const impact = positiveScore > negativeScore 
      ? 'positive' 
      : negativeScore > positiveScore 
        ? 'negative' 
        : 'neutral';
    
    // Determine affected species (simplified)
    const speciesAffected: string[] = [];
    for (const [id, species] of this.speciesConsiderations.entries()) {
      if (policyDescription.toLowerCase().includes(species.speciesName.toLowerCase())) {
        speciesAffected.push(species.speciesName);
      }
    }
    
    return {
      impact,
      speciesAffected: speciesAffected.length > 0 ? speciesAffected : ['multiple species'],
      justification: impact === 'positive'
        ? 'Policy appears to enhance animal welfare standards'
        : impact === 'negative'
          ? 'Policy may reduce animal welfare protections'
          : 'Policy does not significantly impact animal welfare'
    };
  }
  
  /**
   * Get alternative approaches for a given species
   */
  public getAlternativeApproaches(speciesId: string): string[] {
    const species = this.speciesConsiderations.get(speciesId);
    return species?.welfareAssessment.potentialImprovements || [];
  }
}

// Create and export the singleton instance
export const animalWelfareRegistry = AnimalWelfareRegistry.getInstance();
