
// Region type for type-safety in compliance operations
export type Region = 
  | 'us'
  | 'eu'
  | 'uk'
  | 'japan'
  | 'australia'
  | 'china'
  | 'canada'
  | 'brazil'
  | 'india'
  | 'singapore'
  | 'global'
  | 'southeast-asia';  // Adding the missing southeast-asia region

// Compliance level type
export type ComplianceLevel = 'strict' | 'standard' | 'minimal';

// Result of compliance verification
export interface ComplianceVerificationResult {
  compliant: boolean;
  reason?: string;
  warnings?: string[];
  suggestions?: string[];
}

// Compliance report structure
export interface ComplianceReport {
  region: Region;
  framework: string; 
  recommendations: string[];
  riskLevel: 'High' | 'Medium' | 'Low';
  details?: Record<string, any>;
  timestamp?: number;
}

// Compliance rule definition
export interface ComplianceRule {
  id: string;
  description: string;
  jurisdiction: Region[];
  level: 'strict' | 'standard' | 'minimal';
  restrictions: {
    dataRetention?: boolean;
    crossRegionDataTransfer?: boolean;
    personalDataProcessing?: boolean;
    encryptionRequired?: boolean;
  };
}

// Regional compliance rule
export interface RegionalComplianceRule {
  region: Region;
  level: ComplianceLevel;
  restrictions: {
    crossRegionDataTransfer: boolean;
    requiresLocalStorage: boolean;
    requiresEncryption: boolean;
    retentionPeriodDays: number;
  };
}

// PIPL compliance result
export interface PIPLComplianceResult {
  compliant: boolean;
  actions?: string[];
}

// Architecture compliance result
export interface ArchitectureComplianceResult {
  compliant: boolean;
  issues: string[];
  recommendations: string[];
}

// Transparency report
export interface TransparencyReport {
  dataArchitecture: string;
  dataAccessibility: string;
  securityMeasures: string[];
  complianceStatus: string;
}

// Data access policy
export interface DataAccessPolicy {
  region: Region;
  allowLocalAccess: boolean;
  allowRemoteAccess: boolean;
  requiresWarrant: boolean;
  notificationRequired: boolean;
  allowClientSideOnly: boolean; // Added missing property
}

// Regulatory access request
export interface RegulatoryAccessRequest {
  requestId: string;
  region: Region;
  authority: string;
  reason: string;
  dataRequested: string[];
  timestamp: number;
  scope?: string; // Added missing property
}

// Memory metadata
export interface MemoryMetadata {
  source: string;
  confidence: number;
  salience: number;
  isPrivate: boolean;
  emotionalValence: number; // Added missing property
  encoding: {
    format: string;
    version: string;
  };
}
