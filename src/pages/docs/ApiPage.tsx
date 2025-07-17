import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code, Copy, Book, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ApiPage = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    metaKernel: `import { MetaKernel } from '@/core/MetaKernel';

// Initialize the Meta-Kernel
const metaKernel = MetaKernel.getInstance();

// Register a new kernel
await metaKernel.registerKernel('custom-kernel', {
  name: 'Custom Kernel',
  version: '1.0.0',
  initialize: async () => {
    // Kernel initialization logic
  }
});

// Get kernel status
const status = metaKernel.getSystemStatus();
console.log(status);`,

    ethicsKernel: `import { ethicsEngine } from '@/core/ethics/EthicsEngine';

// Validate an action
const result = ethicsEngine.validateAction({
  type: 'data-processing',
  context: {
    userConsent: true,
    dataType: 'personal',
    purpose: 'analysis'
  }
});

if (result.valid) {
  // Proceed with action
  console.log('Action approved');
} else {
  console.log('Action blocked:', result.message);
}`,

    cognitiveKernel: `import { CognitiveKernel } from '@/core/CognitiveKernel';

// Create a cognitive processing request
const kernel = new CognitiveKernel();

const response = await kernel.process({
  type: 'reasoning',
  input: 'What are the implications of this decision?',
  context: {
    domain: 'business',
    urgency: 'high'
  }
});

console.log(response.result);`,

    wasmModule: `import { WasmModule } from '@/core/wasm/WasmModule';

// Load and initialize a WASM module
const wasmModule = new WasmModule();

await wasmModule.load('/wasm/neural-processor.wasm');

// Call WASM function
const result = wasmModule.call('process_data', {
  input: [1, 2, 3, 4, 5],
  algorithm: 'neural-network'
});

console.log('Processed result:', result);`
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              API Reference
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Complete API documentation and examples
            </p>
          </div>

          <div className="space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">API Overview</h2>
              <div className="bg-muted/20 p-6 rounded-lg">
                <p className="text-muted-foreground mb-4">
                  The CMA Neural OS API provides programmatic access to all kernel functionalities. 
                  The API is designed to be type-safe, well-documented, and easy to use.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-primary/10 p-4 rounded border border-primary/20">
                    <h3 className="font-semibold text-primary mb-2">TypeScript First</h3>
                    <p className="text-xs text-muted-foreground">Full TypeScript support with comprehensive type definitions</p>
                  </div>
                  <div className="bg-secondary/10 p-4 rounded border border-secondary/20">
                    <h3 className="font-semibold text-secondary mb-2">Promise-Based</h3>
                    <p className="text-xs text-muted-foreground">All async operations return promises for clean async/await usage</p>
                  </div>
                  <div className="bg-accent/10 p-4 rounded border border-accent/20">
                    <h3 className="font-semibold text-accent mb-2">Event-Driven</h3>
                    <p className="text-xs text-muted-foreground">Subscribe to kernel events for reactive programming</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Meta-Kernel API */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Meta-Kernel API</h2>
              <div className="space-y-6">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Basic Usage</h3>
                    <Badge variant="secondary">Core</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    The Meta-Kernel is the central orchestrator that manages all other kernels in the system.
                  </p>
                  <div className="relative">
                    <pre className="bg-background p-4 rounded border overflow-x-auto text-sm">
                      <code className="text-muted-foreground">{codeExamples.metaKernel}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.metaKernel, 'metaKernel')}
                    >
                      {copiedCode === 'metaKernel' ? 'Copied!' : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Methods</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li><code>getInstance()</code> - Get singleton instance</li>
                      <li><code>registerKernel(id, config)</code> - Register new kernel</li>
                      <li><code>getSystemStatus()</code> - Get system health</li>
                      <li><code>shutdown()</code> - Graceful shutdown</li>
                    </ul>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Events</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li><code>kernel-registered</code> - New kernel added</li>
                      <li><code>kernel-failed</code> - Kernel failure detected</li>
                      <li><code>system-ready</code> - All kernels initialized</li>
                      <li><code>system-error</code> - Critical system error</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Ethics Kernel API */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Ethics Kernel API</h2>
              <div className="space-y-6">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Ethical Validation</h3>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    All system operations must pass through ethical validation to ensure safe and responsible AI behavior.
                  </p>
                  <div className="relative">
                    <pre className="bg-background p-4 rounded border overflow-x-auto text-sm">
                      <code className="text-muted-foreground">{codeExamples.ethicsKernel}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.ethicsKernel, 'ethicsKernel')}
                    >
                      {copiedCode === 'ethicsKernel' ? 'Copied!' : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Cognitive Kernel API */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Cognitive Kernel API</h2>
              <div className="space-y-6">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Cognitive Processing</h3>
                    <Badge variant="secondary">AI</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Process complex cognitive tasks using specialized AI kernels optimized for different types of reasoning.
                  </p>
                  <div className="relative">
                    <pre className="bg-background p-4 rounded border overflow-x-auto text-sm">
                      <code className="text-muted-foreground">{codeExamples.cognitiveKernel}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.cognitiveKernel, 'cognitiveKernel')}
                    >
                      {copiedCode === 'cognitiveKernel' ? 'Copied!' : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* WASM Module API */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">WASM Module API</h2>
              <div className="space-y-6">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">High-Performance Computing</h3>
                    <Badge variant="accent">Performance</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Execute computationally intensive operations using Rust-compiled WASM modules for optimal performance.
                  </p>
                  <div className="relative">
                    <pre className="bg-background p-4 rounded border overflow-x-auto text-sm">
                      <code className="text-muted-foreground">{codeExamples.wasmModule}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.wasmModule, 'wasmModule')}
                    >
                      {copiedCode === 'wasmModule' ? 'Copied!' : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Error Handling */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Error Handling</h2>
              <div className="bg-muted/20 p-6 rounded-lg">
                <p className="text-muted-foreground mb-4">
                  All API methods implement consistent error handling patterns:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Error Types</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <code>KernelError</code> - Kernel-specific failures</li>
                      <li>• <code>EthicsError</code> - Ethical validation failures</li>
                      <li>• <code>ValidationError</code> - Input validation errors</li>
                      <li>• <code>SystemError</code> - System-level errors</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Best Practices</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Always wrap API calls in try-catch blocks</li>
                      <li>• Check error types for specific handling</li>
                      <li>• Use error codes for programmatic responses</li>
                      <li>• Log errors for debugging and monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Next Steps */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Next Steps</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/developer" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <div className="flex items-center mb-3">
                      <Code className="w-5 h-5 text-primary mr-2" />
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                        View Examples
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      See these APIs in action with complete working examples
                    </p>
                    <Button variant="outline" size="sm">
                      Browse Examples <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Link>

                <Link to="/developer" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <div className="flex items-center mb-3">
                      <Book className="w-5 h-5 text-secondary mr-2" />
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                        Developer Tools
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Interactive development environment for testing APIs
                    </p>
                    <Button variant="outline" size="sm">
                      Open Dev Tools <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiPage;