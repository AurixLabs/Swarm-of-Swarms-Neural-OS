
export interface RegulatoryPolicy {
  id: string;
  name: string;
  description: string;
  active: boolean;
  jurisdictions: string[];
  requirements: string[];
  lastUpdated?: number;
  priority?: 'low' | 'medium' | 'high';
  category?: 'data' | 'security' | 'privacy' | 'ethics';
}
