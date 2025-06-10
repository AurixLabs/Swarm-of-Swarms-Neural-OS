
export type LicenseType = 
  | 'MIT' 
  | 'Apache-2.0' 
  | 'BSD' 
  | 'GPL' 
  | 'LGPL' 
  | 'MPL' 
  | 'Custom'
  | 'Invalid';

export interface DependencyLicense {
  name: string;
  version: string;
  license: LicenseType;
  requiresDisclosure: boolean;
  requiresSourceCode: boolean;
  url?: string;
}

export interface LicenseAuditResult {
  timestamp: number;
  dependencies: DependencyLicense[];
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  hasRestrictiveLicenses: boolean;
}
