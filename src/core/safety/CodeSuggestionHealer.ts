
import { ErrorRecord } from './types';
import { systemKernel } from '../SystemKernel';
import { BrowserEventEmitter } from '../BrowserEventEmitter';

/**
 * Interface for code suggestion metadata
 */
export interface CodeSuggestion {
  id: string;
  errorId: string;
  targetFile: string;
  suggestedCode: string;
  originalCode?: string;
  confidence: number; // 0-1 value
  explanation: string;
  createdAt: number;
  appliedAt?: number;
  status: 'pending' | 'applied' | 'rejected' | 'testing';
}

/**
 * Advanced self-healing system that can suggest and potentially apply
 * code changes to fix detected issues
 */
export class CodeSuggestionHealer {
  private static instance: CodeSuggestionHealer;
  private suggestions: Map<string, CodeSuggestion> = new Map();
  private isEnabled = false;
  private apiKey?: string;
  private aiEndpoint = 'https://api.openai.com/v1/chat/completions';
  private readonly MAX_SUGGESTIONS = 100;
  private eventEmitter = new BrowserEventEmitter();
  
  private constructor() {
    // Instead of directly subscribing to SafetyNet events during construction,
    // we'll set up event listeners when explicitly initialized
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): CodeSuggestionHealer {
    if (!this.instance) {
      this.instance = new CodeSuggestionHealer();
    }
    return this.instance;
  }
  
  /**
   * Initialize event listeners - separate from constructor to avoid circular dependencies
   */
  private initializeEventListeners() {
    // Safely import SafetyNet only when needed
    const { safetyNet } = require('../SafetyNet');
    
    // Subscribe to error events from SafetyNet
    safetyNet.on('error:unrecoverable', this.handleUnrecoverableError);
    
    // Listen to self-healing configuration changes
    systemKernel.events.on('SAFETY_CONFIG_CHANGED', this.handleConfigChange);
    
    console.log('CodeSuggestionHealer event listeners initialized');
  }
  
  /**
   * Enable the code suggestion healer
   */
  public enable(apiKey?: string): void {
    this.isEnabled = true;
    if (apiKey) {
      this.apiKey = apiKey;
    }
    
    // Initialize event listeners when enabled
    this.initializeEventListeners();
    
    console.log('Code suggestion healer enabled');
    
    // Emit event 
    this.eventEmitter.emit('healer:enabled');
  }
  
  /**
   * Disable the code suggestion healer
   */
  public disable(): void {
    this.isEnabled = false;
    
    // Clean up event listeners if SafetyNet is loaded
    try {
      const { safetyNet } = require('../SafetyNet');
      safetyNet.off('error:unrecoverable', this.handleUnrecoverableError);
    } catch (e) {
      // SafetyNet might not be loaded yet, that's ok
    }
    
    // Clean up system kernel event listeners
    systemKernel.events.off('SAFETY_CONFIG_CHANGED', this.handleConfigChange);
    
    console.log('Code suggestion healer disabled');
    
    // Emit event
    this.eventEmitter.emit('healer:disabled');
  }
  
  /**
   * Check if the healer is enabled
   */
  public isHealerEnabled(): boolean {
    return this.isEnabled;
  }
  
  /**
   * Get all pending code suggestions
   */
  public getPendingSuggestions(): CodeSuggestion[] {
    return Array.from(this.suggestions.values())
      .filter(s => s.status === 'pending')
      .sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Apply a code suggestion
   */
  public applySuggestion(suggestionId: string): boolean {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion || suggestion.status !== 'pending') {
      return false;
    }
    
    // In a real implementation, this would involve runtime code modification
    // or triggering a build pipeline with the suggested changes
    
    // For now, we just mark it as applied
    suggestion.status = 'applied';
    suggestion.appliedAt = Date.now();
    this.suggestions.set(suggestionId, suggestion);
    
    // Emit event for the applied suggestion
    systemKernel.events.emit('CODE_SUGGESTION_APPLIED', {
      suggestionId,
      suggestion,
      timestamp: Date.now()
    });
    
    return true;
  }
  
  /**
   * Reject a code suggestion
   */
  public rejectSuggestion(suggestionId: string): boolean {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion || suggestion.status !== 'pending') {
      return false;
    }
    
    suggestion.status = 'rejected';
    this.suggestions.set(suggestionId, suggestion);
    
    // Emit event for the rejected suggestion
    systemKernel.events.emit('CODE_SUGGESTION_REJECTED', {
      suggestionId,
      timestamp: Date.now()
    });
    
    return true;
  }
  
  /**
   * Subscribe to an event
   */
  public on(event: string, handler: (data: any) => void): () => void {
    this.eventEmitter.on(event, handler);
    return () => this.eventEmitter.off(event, handler);
  }
  
  /**
   * Handle unrecoverable errors by attempting to generate code suggestions
   */
  private handleUnrecoverableError = async (error: ErrorRecord): Promise<void> => {
    if (!this.isEnabled || !this.apiKey) {
      return;
    }
    
    try {
      console.log(`Attempting to generate code suggestion for error: ${error.message}`);
      
      // Check if the error has component information (file path)
      if (!error.component) {
        console.log('Cannot generate suggestion: no component information available');
        return;
      }
      
      const suggestion = await this.generateCodeSuggestion(error);
      if (suggestion) {
        // Store the suggestion
        this.suggestions.set(suggestion.id, suggestion);
        
        // Trim suggestions if needed
        this.trimSuggestions();
        
        // Emit event for the new suggestion
        systemKernel.events.emit('CODE_SUGGESTION_CREATED', {
          suggestionId: suggestion.id,
          errorId: error.timestamp.toString(),
          confidence: suggestion.confidence,
          timestamp: Date.now()
        });
        
        console.log(`Code suggestion generated with ID: ${suggestion.id}`);
      }
    } catch (err) {
      console.error('Error generating code suggestion:', err);
    }
  };
  
  /**
   * Generate a code suggestion for an error
   */
  private async generateCodeSuggestion(error: ErrorRecord): Promise<CodeSuggestion | null> {
    if (!this.apiKey) {
      return null;
    }
    
    try {
      // This would involve:
      // 1. Fetching code context from the file
      // 2. Sending to LLM API with error information
      // 3. Processing the response into a structured suggestion
      
      // For demo purposes, we're creating a simplified mock
      const suggestionId = `suggestion-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      return {
        id: suggestionId,
        errorId: error.timestamp.toString(),
        targetFile: error.component || 'unknown',
        suggestedCode: '// AI suggested fix would be here',
        confidence: 0.85,
        explanation: `Potential fix for error: ${error.message}`,
        createdAt: Date.now(),
        status: 'pending'
      };
      
      // In a real implementation, you would actually call the AI API
      // and process the result to generate the suggestion
    } catch (err) {
      console.error('Error in AI code suggestion generation:', err);
      return null;
    }
  }
  
  /**
   * Handle configuration changes
   */
  private handleConfigChange = (event: any): void => {
    if (event.payload && event.payload.codeSuggestions !== undefined) {
      if (event.payload.codeSuggestions) {
        this.enable(event.payload.aiApiKey);
      } else {
        this.disable();
      }
    }
  };
  
  /**
   * Trim suggestions to prevent memory growth
   */
  private trimSuggestions(): void {
    const suggestions = Array.from(this.suggestions.entries());
    if (suggestions.length > this.MAX_SUGGESTIONS) {
      // Sort by creation date (oldest first)
      suggestions.sort((a, b) => a[1].createdAt - b[1].createdAt);
      
      // Remove oldest suggestions that exceed the limit
      const toRemove = suggestions.slice(0, suggestions.length - this.MAX_SUGGESTIONS);
      for (const [id] of toRemove) {
        this.suggestions.delete(id);
      }
    }
  }
}

// Export singleton instance
export const codeSuggestionHealer = CodeSuggestionHealer.getInstance();
