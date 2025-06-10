
import { DependencyLicense, LicenseAuditResult, LicenseType } from './LicenseTypes';

export class LicenseAuditor {
  private static restrictiveLicenses: LicenseType[] = ['GPL', 'LGPL', 'MPL'];
  
  public static auditDependencies(): LicenseAuditResult {
    const dependencies = this.getDependencyList();
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Check for restrictive licenses
    const restrictiveDeps = dependencies.filter(dep => 
      this.restrictiveLicenses.includes(dep.license)
    );
    
    if (restrictiveDeps.length > 0) {
      criticalIssues.push(
        `Found ${restrictiveDeps.length} dependencies with restrictive licenses that may require source code disclosure:`
      );
      restrictiveDeps.forEach(dep => {
        criticalIssues.push(`- ${dep.name}@${dep.version} (${dep.license})`);
      });
    }
    
    // Generate recommendations
    if (criticalIssues.length > 0) {
      recommendations.push(
        'Consider replacing GPL/LGPL dependencies with MIT/Apache-2.0 alternatives'
      );
    }
    
    return {
      timestamp: Date.now(),
      dependencies,
      criticalIssues,
      warnings,
      recommendations,
      hasRestrictiveLicenses: restrictiveDeps.length > 0
    };
  }

  private static getDependencyList(): DependencyLicense[] {
    // Current dependencies with their licenses
    return [
      { name: 'react', version: '^18.3.1', license: 'MIT', requiresDisclosure: true, requiresSourceCode: false },
      { name: 'react-dom', version: '^18.3.1', license: 'MIT', requiresDisclosure: true, requiresSourceCode: false },
      { name: '@radix-ui/react-dialog', version: '^1.1.2', license: 'MIT', requiresDisclosure: true, requiresSourceCode: false },
      { name: 'tailwindcss', version: '^3.0.0', license: 'MIT', requiresDisclosure: true, requiresSourceCode: false },
      { name: '@supabase/supabase-js', version: '^2.39.3', license: 'MIT', requiresDisclosure: true, requiresSourceCode: false },
      { name: 'framer-motion', version: '^12.7.4', license: 'MIT', requiresDisclosure: true, requiresSourceCode: false },
      { name: 'zod', version: '^3.23.8', license: 'MIT', requiresDisclosure: true, requiresSourceCode: false },
      { name: '@tanstack/react-query', version: '^5.56.2', license: 'MIT', requiresDisclosure: true, requiresSourceCode: false },
      { name: 'lucide-react', version: '^0.462.0', license: 'MIT', requiresDisclosure: true, requiresSourceCode: false }
    ];
  }
}
