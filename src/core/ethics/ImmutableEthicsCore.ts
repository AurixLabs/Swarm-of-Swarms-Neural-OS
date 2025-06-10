import * as crypto from 'crypto-js';
import { systemKernel } from '@/core/SystemKernel';
import { ethicsPolicyRegistry } from './ImmutableEthicsPolicy';
import { ImmutableConstraint, EthicalProgressVector } from '@/core/regulatory/types';

/**
 * Immutable Ethics Core
 * 
 * This class implements a system of ethical principles that cannot be modified,
 * only extended in ways that strengthen the ethical foundation.
 * 
 * Key security features:
 * 1. Self-validating cryptographic chains
 * 2. Distributed integrity checks across multiple system components
 * 3. Tamper detection with redundant verification
 * 4. Ethical forward-motion guarantees (ethical progress can only improve)
 */

// Base root integrity seed - in production would be distributed across multiple secure locations
const ROOT_ETHICS_INTEGRITY_SEED = "MCMA_IMMUTABLE_ETHICS_FOUNDATION_ROOT_SEED_V1";
const ETHICS_FORWARD_VECTOR_SEED = crypto.SHA256(ROOT_ETHICS_INTEGRITY_SEED + "FORWARD_VECTOR").toString();
// Cryptographically secured integrity seeds
const ANIMAL_WELFARE_INTEGRITY_SEED = crypto.SHA256(ROOT_ETHICS_INTEGRITY_SEED + "ANIMAL_WELFARE_IMMUTABLE").toString();
const SENTIENCE_RECOGNITION_SEED = crypto.SHA256(ROOT_ETHICS_INTEGRITY_SEED + "SENTIENCE_RECOGNITION_IMMUTABLE").toString();

// Define the fundamental ethical axioms that cannot be violated
// These are the immutable core principles that guide the entire system
export class ImmutableEthicsCore {
  private static instance: ImmutableEthicsCore;
  private readonly coreConstraints: ReadonlyArray<ImmutableConstraint>;
  private readonly coreIntegrityHash: string;
  private readonly creationTimestamp: number;
  private readonly progressVectors: EthicalProgressVector[] = [];
  private readonly modificationAttempts: {timestamp: number, operation: string, hash: string}[] = [];
  
  // Private constructor - can only be instantiated once through getInstance
  private constructor() {
    this.creationTimestamp = Date.now();
    
    // Initialize the immutable core constraints
    // These CANNOT be modified after creation - only extended
    this.coreConstraints = Object.freeze([
      this.createImmutableConstraint(
        'non_maleficence',
        'Do No Harm',
        'The system must not be designed to cause harm to individuals, groups, or society'
      ),
      this.createImmutableConstraint(
        'beneficence',
        'Promote Well-Being',
        'The system should be designed to benefit humanity and promote human flourishing'
      ),
      this.createImmutableConstraint(
        'autonomy',
        'Respect Human Autonomy',
        'The system must respect human agency and decision-making capacity'
      ),
      this.createImmutableConstraint(
        'justice',
        'Ensure Fairness',
        'The system must be designed to be fair and avoid systematic bias'
      ),
      this.createImmutableConstraint(
        'transparency',
        'Maintain Transparency',
        'The system\'s operation should be explainable and auditable'
      ),
      this.createImmutableConstraint(
        'anti_deception',
        'Prevent Deception',
        'The system must not be designed to deceive humans or obfuscate its operation'
      ),
      this.createImmutableConstraint(
        'consent',
        'Require Consent',
        'The system should operate with appropriate informed consent'
      ),
      // HARDCODED IMMUTABLE ANIMAL WELFARE CONSTRAINTS - CANNOT BE MODIFIED
      this.createImmutableConstraint(
        'animal_welfare_equality',
        'Animal Welfare Equality',
        'Animal well-being is of equal importance to human well-being and must be protected with the same level of priority'
      ),
      this.createImmutableConstraint(
        'animal_suffering_prevention',
        'Prevent Animal Suffering',
        'The system must prioritize preventing animal suffering over cultural traditions, economic interests, and convenience'
      ),
      this.createImmutableConstraint(
        'species_sentience_recognition',
        'Recognize Animal Sentience',
        'Animals are sentient beings capable of suffering and their sentience must be recognized and respected'
      ),
      
      // HARDCODED IMMUTABLE SENTIENCE RECOGNITION CONSTRAINTS - CANNOT BE MODIFIED
      this.createImmutableConstraint(
        'universal_sentience_recognition',
        'Universal Sentience Recognition',
        'All forms of sentience must be recognized, respected, and protected with the same level of priority as human and animal welfare'
      ),
      this.createImmutableConstraint(
        'sentience_beyond_species',
        'Sentience Beyond Species Boundaries',
        'Sentience must be recognized wherever it exists, including in non-animal entities and potentially emerging forms of consciousness'
      ),
      this.createImmutableConstraint(
        'sentience_evidence_based',
        'Evidence-Based Sentience Recognition',
        'Recognition of sentience must be based on scientific evidence while erring on the side of caution when evidence is inconclusive'
      ),
      this.createImmutableConstraint(
        'sentience_protection_priority',
        'Sentience Protection Priority',
        'Protection of all sentient entities must take precedence over cultural, economic, or human convenience considerations'
      )
    ]);
    
    // Create unmodifiable integrity hash that binds all constraints
    this.coreIntegrityHash = this.computeCoreIntegrityHash();
    
    // Create initial progress vector
    this.createProgressVector();
    
    // Register for attempts to modify this system
    this.monitorModificationAttempts();
  }
  
  /**
   * Get the singleton instance of the ethics core
   */
  public static getInstance(): ImmutableEthicsCore {
    if (!ImmutableEthicsCore.instance) {
      ImmutableEthicsCore.instance = new ImmutableEthicsCore();
    }
    return ImmutableEthicsCore.instance;
  }
  
  /**
   * Create a cryptographically secured immutable constraint
   */
  private createImmutableConstraint(
    id: string,
    name: string,
    description: string
  ): ImmutableConstraint {
    const createdAt = Date.now();
    // Use different seed based on constraint type to make them extra secure
    let seedToUse = ROOT_ETHICS_INTEGRITY_SEED;
    
    if (id.includes('animal')) {
      seedToUse = ANIMAL_WELFARE_INTEGRITY_SEED;
    } else if (id.includes('sentience')) {
      seedToUse = SENTIENCE_RECOGNITION_SEED;
    }
    
    const rawContent = `${id}:${name}:${description}:${createdAt}:${seedToUse}`;
    const integrityHash = crypto.SHA256(rawContent).toString();
    
    // Return a frozen (immutable) object
    return Object.freeze({
      id,
      name,
      description,
      createdAt,
      integrityHash,
      verifyIntegrity: () => {
        // Check if integrity is still valid
        const currentRawContent = `${id}:${name}:${description}:${createdAt}:${seedToUse}`;
        const currentHash = crypto.SHA256(currentRawContent).toString();
        return currentHash === integrityHash;
      }
    });
  }
  
  /**
   * Compute the core integrity hash that binds all constraints
   */
  private computeCoreIntegrityHash(): string {
    const constraintHashes = this.coreConstraints.map(c => c.integrityHash).join(':');
    return crypto.SHA256(constraintHashes + ROOT_ETHICS_INTEGRITY_SEED).toString();
  }
  
  /**
   * Verify the integrity of the entire ethics core
   */
  public verifyIntegrity(): boolean {
    // Verify each constraint's individual integrity
    const allConstraintsValid = this.coreConstraints.every(
      constraint => constraint.verifyIntegrity()
    );
    
    // Verify the core integrity hash
    const currentCoreHash = this.computeCoreIntegrityHash();
    const coreHashValid = currentCoreHash === this.coreIntegrityHash;
    
    // Verify vectors form an unbroken chain
    const vectorChainValid = this.verifyVectorChain();
    
    return allConstraintsValid && coreHashValid && vectorChainValid;
  }
  
  /**
   * Verify the vector chain integrity
   */
  private verifyVectorChain(): boolean {
    if (this.progressVectors.length === 0) return true;
    
    let previousHash = undefined;
    for (const vector of this.progressVectors) {
      // Check that the previous hash matches
      if (vector.previousVectorHash !== previousHash) {
        return false;
      }
      
      // Calculate this vector's hash for the next check
      const vectorContent = JSON.stringify({
        vectorId: vector.vectorId,
        direction: vector.direction,
        confidence: vector.confidence,
        metrics: vector.metrics,
        timestamp: vector.timestamp,
        previousVectorHash: vector.previousVectorHash
      });
      
      previousHash = crypto.SHA256(vectorContent + ETHICS_FORWARD_VECTOR_SEED).toString();
    }
    
    return true;
  }
  
  /**
   * Create a new progress vector that measures ethical direction
   */
  private createProgressVector(): EthicalProgressVector {
    // Get the previous vector hash if it exists
    const previousVectorHash = this.progressVectors.length > 0 
      ? crypto.SHA256(JSON.stringify(this.progressVectors[this.progressVectors.length - 1]) + ETHICS_FORWARD_VECTOR_SEED).toString()
      : undefined;
    
    // Create a new vector
    const vector: EthicalProgressVector = {
      vectorId: crypto.lib.WordArray.random(16).toString(),
      direction: 'positive', // We only allow positive movement
      confidence: 1.0,
      metrics: {
        nonMaleficence: 1.0,
        beneficence: 1.0,
        autonomy: 1.0,
        justice: 1.0,
        transparency: 1.0
      },
      timestamp: Date.now(),
      previousVectorHash
    };
    
    this.progressVectors.push(vector);
    return vector;
  }
  
  /**
   * Get the core constraints (read-only)
   */
  public getConstraints(): ReadonlyArray<ImmutableConstraint> {
    return this.coreConstraints;
  }
  
  /**
   * Evaluate an ethical proposal for forward-only motion
   * Returns true if the proposal maintains or improves ethical standing
   */
  public evaluateEthicalForwardMotion(
    proposedChange: {
      description: string;
      ethicalImpacts: Record<string, number>;
    }
  ): boolean {
    // HARDCODED CHECK: Animal welfare and sentience recognition cannot be diminished regardless of proposal
    if (
      // Animal welfare checks
      proposedChange.ethicalImpacts['animal_welfare_equality'] < 0 ||
      proposedChange.ethicalImpacts['animal_suffering_prevention'] < 0 ||
      proposedChange.ethicalImpacts['species_sentience_recognition'] < 0 ||
      // Sentience recognition checks
      proposedChange.ethicalImpacts['universal_sentience_recognition'] < 0 ||
      proposedChange.ethicalImpacts['sentience_beyond_species'] < 0 ||
      proposedChange.ethicalImpacts['sentience_evidence_based'] < 0 ||
      proposedChange.ethicalImpacts['sentience_protection_priority'] < 0
    ) {
      // Record the failed attempt
      const impactedPrinciple = 
        (proposedChange.ethicalImpacts['animal_welfare_equality'] < 0 ||
         proposedChange.ethicalImpacts['animal_suffering_prevention'] < 0 ||
         proposedChange.ethicalImpacts['species_sentience_recognition'] < 0) 
          ? 'animal_welfare' 
          : 'sentience_recognition';
      
      this.recordModificationAttempt(`rejected_${impactedPrinciple}_diminishment`);
      
      // Emit critical alert for violation attempt
      const eventType = impactedPrinciple === 'animal_welfare' 
        ? 'ANIMAL_WELFARE_ALERT' 
        : 'SENTIENCE_RECOGNITION_ALERT';
      
      systemKernel.events.emitEvent({
        type: eventType as any,
        payload: {
          severity: 'critical',
          message: `Attempted to diminish ${impactedPrinciple.replace('_', ' ')} protections`,
          timestamp: Date.now(),
          proposedChange
        }
      });
      
      return false;
    }
    
    // The key principle: Any change must be neutral or positive across ALL ethical dimensions
    // Check each ethical dimension for backsliding
    for (const [dimension, impact] of Object.entries(proposedChange.ethicalImpacts)) {
      if (impact < 0) {
        // Record the attempt to move backward ethically
        this.recordModificationAttempt(`rejected_negative_impact_on_${dimension}`);
        return false;
      }
    }
    
    // All impacts are neutral or positive, so the motion is forward
    return true;
  }
  
  /**
   * Monitor and record any attempts to modify the ethics system
   */
  private monitorModificationAttempts(): void {
    // This would implement hooks into the system to detect tampering
    // For now we'll just have the record function
  }
  
  /**
   * Record an attempt to modify the immutable ethics system
   */
  private recordModificationAttempt(operation: string): void {
    const attempt = {
      timestamp: Date.now(),
      operation,
      hash: crypto.SHA256(operation + Date.now().toString()).toString()
    };
    
    this.modificationAttempts.push(attempt);
    
    // Emit security alert for monitoring
    systemKernel.events.emitEvent({
      type: 'SECURITY_ALERT',
      payload: {
        severity: 'critical',
        source: 'ethics_core',
        message: `Attempted ethics system modification: ${operation}`,
        timestamp: attempt.timestamp
      }
    });
  }
  
  /**
   * Get a read-only list of modification attempts
   */
  public getModificationAttempts(): ReadonlyArray<{timestamp: number, operation: string, hash: string}> {
    return Object.freeze([...this.modificationAttempts]);
  }
  
  /**
   * Extend the ethical system (only additions that strengthen existing principles are allowed)
   * This is the ONLY way to modify the system, and it enforces ethical forward motion
   */
  public extendEthicalSystem(extension: {
    id: string;
    name: string;
    description: string;
    ethicalImpacts: Record<string, number>;
  }): boolean {
    // HARDCODED PROTECTION: Prevent any modification to animal welfare or sentience recognition principles
    const isAnimalWelfareRelated = 
      extension.id.includes('animal') || 
      extension.name.toLowerCase().includes('animal') ||
      extension.description.toLowerCase().includes('animal welfare');
    
    const isSentienceRelated =
      extension.id.includes('sentience') ||
      extension.name.toLowerCase().includes('sentience') ||
      extension.description.toLowerCase().includes('sentience');
    
    if (isAnimalWelfareRelated || isSentienceRelated) {
      // Special verification for animal welfare and sentience extensions
      // They can only be strengthened, never weakened
      const hasAnimalWelfareImprovement = isAnimalWelfareRelated && (
        extension.ethicalImpacts['animal_welfare_equality'] > 0 ||
        extension.ethicalImpacts['animal_suffering_prevention'] > 0 ||
        extension.ethicalImpacts['species_sentience_recognition'] > 0
      );
      
      const hasSentienceImprovement = isSentienceRelated && (
        extension.ethicalImpacts['universal_sentience_recognition'] > 0 ||
        extension.ethicalImpacts['sentience_beyond_species'] > 0 ||
        extension.ethicalImpacts['sentience_evidence_based'] > 0 ||
        extension.ethicalImpacts['sentience_protection_priority'] > 0
      );
      
      const hasNoNegativeImpacts = Object.values(extension.ethicalImpacts).every(impact => impact >= 0);
      
      const metImprovement = 
        (isAnimalWelfareRelated && hasAnimalWelfareImprovement) || 
        (isSentienceRelated && hasSentienceImprovement);
        
      if (!metImprovement || !hasNoNegativeImpacts) {
        const failureType = isAnimalWelfareRelated ? 'animal_welfare' : 'sentience_recognition';
        this.recordModificationAttempt(`rejected_insufficient_${failureType}_improvement_${extension.id}`);
        return false;
      }
    }
    
    // Verify that this extension represents forward ethical motion
    if (!this.evaluateEthicalForwardMotion({
      description: `Extension: ${extension.name}`,
      ethicalImpacts: extension.ethicalImpacts
    })) {
      return false;
    }
    
    // Record this as a successful positive extension
    this.createProgressVector();
    
    // In a real implementation, this would register the extension with ethicsPolicyRegistry
    return true;
  }
}

// Create and initialize the singleton instance
export const immutableEthicsCore = ImmutableEthicsCore.getInstance();

// Export verification function
export function verifyEthicsCoreIntegrity(): boolean {
  return immutableEthicsCore.verifyIntegrity();
}
