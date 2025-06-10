
// SDK Priority type definitions
export interface GlobalAlignment {
  organization: string;
  initiative: string;
  goals: string[];
}

export interface SDKPriority {
  id: string;
  title: string;
  description: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  globalAlignments?: GlobalAlignment[];
}
