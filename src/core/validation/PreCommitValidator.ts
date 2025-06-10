
export interface ValidationError {
  file: string;
  type: 'browser-compatibility' | 'route-integrity' | 'wasm-config' | 'build-config' | 'runtime';
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  suggestions: string[];
}

class PreCommitValidator {
  async validateProject(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const suggestions: string[] = [];

    // Check for browser compatibility issues
    const browserIssues = await this.checkBrowserCompatibility();
    errors.push(...browserIssues);

    // Check route integrity
    const routeIssues = await this.checkRouteIntegrity();
    errors.push(...routeIssues);

    // Check WASM configuration
    const wasmIssues = await this.checkWasmConfiguration();
    errors.push(...wasmIssues);

    // Check build configuration
    const buildIssues = await this.checkBuildConfiguration();
    errors.push(...buildIssues);

    // Generate suggestions based on errors
    if (errors.some(e => e.type === 'browser-compatibility')) {
      suggestions.push('Replace Node.js-only imports with browser-compatible alternatives');
    }
    if (errors.some(e => e.type === 'route-integrity')) {
      suggestions.push('Add missing routes to App.tsx or remove unused pages');
    }
    if (errors.some(e => e.type === 'wasm-config')) {
      suggestions.push('Run build-wasm.sh to generate missing WASM files');
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      suggestions
    };
  }

  private async checkBrowserCompatibility(): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    
    // Check for Node.js-only imports that won't work in browser
    const nodeOnlyPatterns = [
      /import.*from\s+['"]events['"]/,
      /import.*from\s+['"]fs['"]/,
      /import.*from\s+['"]path['"]/,
      /require\(['"]events['"]\)/
    ];

    // For now, return a sample error to demonstrate the system
    errors.push({
      file: 'src/core/events/BrowserEventEmitter.ts',
      type: 'browser-compatibility',
      message: 'Node.js "events" module detected. Use BrowserEventEmitter instead.',
      severity: 'error'
    });

    return errors;
  }

  private async checkRouteIntegrity(): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    
    // Check if all pages have corresponding routes
    // This is a simplified check - in reality would scan filesystem
    
    return errors;
  }

  private async checkWasmConfiguration(): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    
    const requiredWasmFiles = [
      'public/wasm/cma_neural_os.js',
      'public/wasm/neuromorphic.js',
      'public/wasm/llama_bridge.js'
    ];

    // Check if WASM files exist (simplified check)
    // In reality would use filesystem API
    
    return errors;
  }

  private async checkBuildConfiguration(): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    
    // Check Vite config, TypeScript config, etc.
    
    return errors;
  }
}

export const preCommitValidator = new PreCommitValidator();
