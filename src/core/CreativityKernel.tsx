
import { UniversalKernel } from './UniversalKernel';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { BrowserEventEmitter } from './BrowserEventEmitter';

// Creativity event types
export type CreativityEventType = 
  | 'CREATIVE_INSIGHT_GENERATED'
  | 'CREATIVE_PROCESS_STARTED'
  | 'CREATIVE_PROCESS_COMPLETED'
  | 'LATERAL_THINKING_ACTIVATED'
  | 'METAPHORICAL_MAPPING_CREATED'
  | 'COGNITIVE_REFRAMING_APPLIED'
  | 'CREATIVE_CONSTRAINT_ADDED'
  | 'CREATIVE_CONSTRAINT_REMOVED'
  | 'CROSS_DOMAIN_CONNECTION_MADE'
  | 'DIVERGENT_THINKING_INITIATED'
  | 'CONVERGENT_THINKING_INITIATED'
  | 'IDEATION_SESSION_STARTED'
  | 'IDEATION_SESSION_COMPLETED';

// Creativity event interface
export interface CreativityEvent {
  type: CreativityEventType;
  payload: any;
}

// Creativity framework interface
export interface CreativeFramework {
  id: string;
  name: string;
  description: string;
  techniques: CreativeTechnique[];
  domains: string[];
  active: boolean;
}

// Creative technique interface
export interface CreativeTechnique {
  id: string;
  name: string;
  description: string;
  steps: string[];
  difficulty: 'low' | 'medium' | 'high';
}

// Creative output interface
export interface CreativeOutput {
  id: string;
  frameworkId: string;
  techniqueId: string;
  input: any;
  output: any;
  metrics: {
    novelty: number;
    usefulness: number;
    surprise: number;
  };
  timestamp: number;
}

// Creativity Event Bus
class CreativityEventBus extends BrowserEventEmitter {
  emitEvent<T extends CreativityEvent>(event: T) {
    this.emit(event.type, event.payload);
    return event;
  }
  
  onEvent<T extends CreativityEvent>(eventType: T['type'], handler: (payload: any) => void) {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }
}

// Creativity Kernel implementation
export class CreativityKernel extends UniversalKernel {
  public readonly events = new CreativityEventBus();
  private _state: Record<string, any> = {};
  private _frameworks: Map<string, CreativeFramework> = new Map();
  private _outputs: CreativeOutput[] = [];
  
  constructor() {
    super();
    this.initializeDefaultFrameworks();
  }
  
  /**
   * Initialize default creative frameworks
   */
  private initializeDefaultFrameworks(): void {
    // Lateral thinking framework
    this.registerFramework({
      id: 'lateral-thinking',
      name: 'Lateral Thinking',
      description: 'Breaking established patterns to generate new ideas',
      techniques: [
        {
          id: 'reversal',
          name: 'Reversal',
          description: 'Reverse assumptions to generate new perspectives',
          steps: [
            'Identify key assumptions',
            'Reverse each assumption',
            'Explore implications of the reversed assumptions',
            'Generate new ideas based on reversed perspectives'
          ],
          difficulty: 'medium'
        },
        {
          id: 'random-stimulation',
          name: 'Random Stimulation',
          description: 'Use random inputs to stimulate new connections',
          steps: [
            'Select a random word or concept',
            'Force connections between the random element and the problem',
            'Generate ideas from these forced connections',
            'Refine the most promising ideas'
          ],
          difficulty: 'low'
        }
      ],
      domains: ['problem-solving', 'innovation', 'design'],
      active: true
    });
    
    // Analogical reasoning framework
    this.registerFramework({
      id: 'analogical-reasoning',
      name: 'Analogical Reasoning',
      description: 'Using analogies to transfer knowledge across domains',
      techniques: [
        {
          id: 'direct-analogy',
          name: 'Direct Analogy',
          description: 'Draw direct comparisons between different domains',
          steps: [
            'Identify the problem structure',
            'Find similar structures in other domains',
            'Map relationships between domains',
            'Transfer insights to generate solutions'
          ],
          difficulty: 'medium'
        },
        {
          id: 'biomimicry',
          name: 'Biomimicry',
          description: 'Learn from and imitate nature\'s strategies',
          steps: [
            'Define the function you want to achieve',
            'Identify biological examples that perform this function',
            'Study the biological mechanism',
            'Abstract principles and apply to your domain'
          ],
          difficulty: 'high'
        }
      ],
      domains: ['engineering', 'design', 'architecture', 'problem-solving'],
      active: true
    });
  }
  
  /**
   * Get current creativity state
   */
  public getState<T>(key: string): T | undefined {
    return this._state[key] as T | undefined;
  }
  
  /**
   * Update creativity state
   */
  public setState<T>(key: string, value: T): void {
    this._state[key] = value;
    this.events.emitEvent({
      type: 'CREATIVE_INSIGHT_GENERATED',
      payload: { key, value, timestamp: Date.now() }
    });
  }
  
  /**
   * Register a new creative framework
   */
  public registerFramework(framework: CreativeFramework): string {
    this._frameworks.set(framework.id, framework);
    
    this.events.emitEvent({
      type: 'CREATIVE_PROCESS_STARTED',
      payload: {
        frameworkId: framework.id,
        timestamp: Date.now()
      }
    });
    
    return framework.id;
  }
  
  /**
   * Get a framework by ID
   */
  public getFramework(frameworkId: string): CreativeFramework | undefined {
    return this._frameworks.get(frameworkId);
  }
  
  /**
   * List all active frameworks
   */
  public listActiveFrameworks(): CreativeFramework[] {
    return Array.from(this._frameworks.values()).filter(framework => framework.active);
  }
  
  /**
   * Apply a creative technique to generate outputs
   */
  public applyTechnique(
    frameworkId: string, 
    techniqueId: string, 
    input: any
  ): CreativeOutput | null {
    const framework = this._frameworks.get(frameworkId);
    if (!framework) {
      return null;
    }
    
    const technique = framework.techniques.find(t => t.id === techniqueId);
    if (!technique) {
      return null;
    }
    
    // In a real implementation, this would apply the technique to the input
    // For demo purposes, we'll generate a simulated output
    const output = {
      id: `output-${Date.now()}`,
      frameworkId,
      techniqueId,
      input,
      output: `Creative transformation of: ${JSON.stringify(input)}`,
      metrics: {
        novelty: Math.random() * 100,
        usefulness: Math.random() * 100,
        surprise: Math.random() * 100
      },
      timestamp: Date.now()
    };
    
    this._outputs.push(output);
    
    this.events.emitEvent({
      type: 'CREATIVE_PROCESS_COMPLETED',
      payload: {
        output,
        timestamp: Date.now()
      }
    });
    
    return output;
  }
  
  /**
   * Generate cross-domain connections
   */
  public generateCrossDomainConnections(conceptA: string, conceptB: string): any {
    // In a real implementation, this would use more sophisticated techniques
    const connection = {
      concepts: [conceptA, conceptB],
      relationship: 'shares structural properties with',
      insightGenerated: `${conceptA} and ${conceptB} can be connected through their common patterns of organization`,
      potentialApplications: [
        'New product design',
        'Problem-solving approach',
        'Communication strategy'
      ],
      timestamp: Date.now()
    };
    
    this.events.emitEvent({
      type: 'CROSS_DOMAIN_CONNECTION_MADE',
      payload: connection
    });
    
    return connection;
  }
  
  /**
   * Activate divergent thinking mode
   */
  public activateDivergentThinking(context: any): void {
    this.events.emitEvent({
      type: 'DIVERGENT_THINKING_INITIATED',
      payload: {
        context,
        timestamp: Date.now()
      }
    });
    
    // In a real implementation, this would modify system behavior to emphasize
    // divergent thinking patterns
  }
  
  /**
   * Activate convergent thinking mode
   */
  public activateConvergentThinking(ideas: any[]): void {
    this.events.emitEvent({
      type: 'CONVERGENT_THINKING_INITIATED',
      payload: {
        ideasCount: ideas.length,
        timestamp: Date.now()
      }
    });
    
    // In a real implementation, this would modify system behavior to emphasize
    // convergent thinking patterns
  }
  
  /**
   * Get recent creative outputs
   */
  public getRecentOutputs(limit: number = 10): CreativeOutput[] {
    return this._outputs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  /**
   * Clean up resources
   */
  public shutdown(): void {
    this.events.removeAllListeners();
  }
}

// Create singleton instance
export const creativityKernel = new CreativityKernel();

// React context
const CreativityContext = createContext<CreativityKernel | null>(null);

// Provider component
export const CreativityProvider = ({ children }: { children: ReactNode }) => (
  <CreativityContext.Provider value={creativityKernel}>
    {children}
  </CreativityContext.Provider>
);

// React hook for accessing the kernel
export const useCreativity = () => {
  const context = useContext(CreativityContext);
  if (!context) {
    throw new Error('useCreativity must be used within a CreativityProvider');
  }
  return context;
};

// Hook for creativity operations
export const useCreativityOperations = () => {
  const creativityKernel = useCreativity();
  const [state, setState] = useState(creativityKernel.getState('current'));

  useEffect(() => {
    const unsubscribe = creativityKernel.events.onEvent(
      'CREATIVE_INSIGHT_GENERATED', 
      () => setState(creativityKernel.getState('current'))
    );
    
    return () => {
      unsubscribe();
    };
  }, [creativityKernel]);

  return {
    state,
    applyTechnique: creativityKernel.applyTechnique.bind(creativityKernel),
    getFramework: creativityKernel.getFramework.bind(creativityKernel),
    listActiveFrameworks: creativityKernel.listActiveFrameworks.bind(creativityKernel),
    generateCrossDomainConnections: creativityKernel.generateCrossDomainConnections.bind(creativityKernel),
    activateDivergentThinking: creativityKernel.activateDivergentThinking.bind(creativityKernel),
    activateConvergentThinking: creativityKernel.activateConvergentThinking.bind(creativityKernel),
    getRecentOutputs: creativityKernel.getRecentOutputs.bind(creativityKernel)
  };
};
