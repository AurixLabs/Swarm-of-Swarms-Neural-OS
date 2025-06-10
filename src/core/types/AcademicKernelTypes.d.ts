
/**
 * Deprecated academic kernel types.
 * This file provides type interfaces for the academic kernel system
 * which has been refactored into the more elegant Knowledge Domain system.
 */

export interface AcademicKernelInterface {
  id: string;
  name: string;
  domain: string;
  version: string;
}

// These types are kept for backward compatibility
export type AcademicDomain = 
  | 'humanities'
  | 'languages'
  | 'mathematics'
  | 'computer_science'
  | 'natural_sciences'
  | 'social_sciences'
  | 'communication'
  | 'arts'
  | 'naturalSciences'  // Adding alternative formats for compatibility
  | 'computerScience'  // Adding alternative formats for compatibility
  | 'socialSciences'   // Adding alternative formats for compatibility
  | 'communication_studies' // Adding missing domain
  | 'communicationStudies'; // Adding camelCase variant

export interface AcademicKernelState {
  isInitialized: boolean;
  conceptsLoaded: boolean;
  readiness: number;
}

// =============== Transitional Type Exports for Compatibility ================

/**
 * Transitional compatibility interfaces for legacy intelligence/knowledge flows.
 * REMOVE THESE once all legacy usages have migrated!
 */

// Generic query against the academic kernel system
export interface AcademicQuery {
  id?: string;
  query: string;
  domain?: string;
  params?: Record<string, any>;
  question?: string;
}

// Academic knowledge node structure (for older concept graphs)
export interface AcademicKnowledgeNode {
  id: string;
  title: string;
  summary: string;
  content?: string;
  sources?: string[];
  relatedConcepts?: string[];
  domain?: string; // Added for compatibility with IntelligenceKernel
  confidence?: number; // Added to fix IntelligenceKernel errors
  tags?: string[]; // Added to fix IntelligenceKernel errors
  lastUpdated?: number; // Added for compatibility with timestamps
}

// Legacy philosophical/creativity/epistemology constructs
export interface PhilosophicalComponent {
  id: string;
  name: string;
  description: string;
  getPrinciples?: () => string[]; // Added for compatibility
  reflect?: (question: string) => string; // Added for compatibility
}

export interface CreativityComponent {
  id: string;
  creativityType: string;
  notes: string;
  frameworks?: string[]; // Added for compatibility
  inspire?: (problem: string) => string; // Added for compatibility
}

export interface EpistemologicalComponent {
  id: string;
  epistemologyType: string;
  argument: string;
  frameworks?: string[]; // Added for compatibility
  analyze?: (claim: string) => string; // Added for compatibility
}
