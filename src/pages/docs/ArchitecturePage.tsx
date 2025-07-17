import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Shield, Cpu, Network, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ArchitecturePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Architecture Guide
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Understanding the cognitive modular architecture principles
            </p>
          </div>

          <div className="space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Architecture Overview</h2>
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border">
                <p className="text-muted-foreground mb-4">
                  CMA Neural OS implements a <strong>Multi-Cognitive Modular Architecture (MCMA)</strong> that separates 
                  different AI functions into specialized kernels, each optimized for specific cognitive tasks.
                </p>
                <p className="text-muted-foreground">
                  This approach enables better resource management, improved reliability, and easier maintenance 
                  compared to monolithic AI systems.
                </p>
              </div>
            </section>

            {/* Core Components */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Core Components</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Brain className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Meta-Kernel</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    The orchestrator that manages all other kernels, provides system-wide coordination, 
                    and ensures proper resource allocation.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Cross-kernel communication</li>
                    <li>• Resource management</li>
                    <li>• Health monitoring</li>
                    <li>• Error recovery</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Shield className="w-6 h-6 text-destructive mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Ethics Kernel</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Provides ethical reasoning and constraint validation for all system operations. 
                    Cryptographically secured to prevent bypass.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Ethical decision validation</li>
                    <li>• Bias detection</li>
                    <li>• Harm prevention</li>
                    <li>• Compliance checking</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Cpu className="w-6 h-6 text-accent mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Cognitive Kernels</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Specialized processing units for different cognitive functions like reasoning, 
                    memory, creativity, and language processing.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Reasoning & Logic</li>
                    <li>• Memory Management</li>
                    <li>• Language Processing</li>
                    <li>• Creative Generation</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Network className="w-6 h-6 text-secondary mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Bridge System</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Facilitates communication between kernels using shared memory pools and 
                    event-driven messaging for efficient data transfer.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Inter-kernel messaging</li>
                    <li>• Shared memory management</li>
                    <li>• Event routing</li>
                    <li>• Data serialization</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* WASM Integration */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Rust WASM Integration</h2>
              <div className="bg-muted/20 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Layers className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-lg font-semibold text-foreground">Performance Layer</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Critical cognitive functions are implemented in Rust and compiled to WebAssembly 
                  for near-native performance in browser environments.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Benefits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Memory safety</li>
                      <li>• Predictable performance</li>
                      <li>• Small binary sizes</li>
                      <li>• Cross-platform compatibility</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Use Cases</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Mathematical computations</li>
                      <li>• Pattern recognition</li>
                      <li>• Cryptographic operations</li>
                      <li>• Signal processing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Design Principles */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Design Principles</h2>
              <div className="space-y-6">
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">Modularity</h3>
                  <p className="text-sm text-muted-foreground">
                    Each kernel is self-contained and can be developed, tested, and deployed independently. 
                    This enables rapid iteration and reduces system complexity.
                  </p>
                </div>

                <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/20">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Resilience</h3>
                  <p className="text-sm text-muted-foreground">
                    System continues operating even if individual kernels fail. The Meta-Kernel 
                    provides automatic recovery and graceful degradation.
                  </p>
                </div>

                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <h3 className="text-lg font-semibold text-accent mb-3">Scalability</h3>
                  <p className="text-sm text-muted-foreground">
                    Kernels can be distributed across multiple devices or scaled based on demand. 
                    Supports everything from embedded devices to cloud deployments.
                  </p>
                </div>

                <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/20">
                  <h3 className="text-lg font-semibold text-destructive mb-3">Ethics-First</h3>
                  <p className="text-sm text-muted-foreground">
                    Ethical constraints are built into the architecture itself, not added as an afterthought. 
                    All operations must pass ethical validation.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Flow */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Data Flow</h2>
              <div className="bg-muted/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Request Processing Flow</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mr-3">1</div>
                    <span>User input received by Meta-Kernel</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mr-3">2</div>
                    <span>Ethics Kernel validates request for safety and compliance</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mr-3">3</div>
                    <span>Meta-Kernel routes request to appropriate cognitive kernels</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mr-3">4</div>
                    <span>Cognitive kernels process request using WASM modules</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mr-3">5</div>
                    <span>Results aggregated and validated by Ethics Kernel</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mr-3">6</div>
                    <span>Final response delivered to user interface</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Next Steps */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Learn More</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/docs/api" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">
                      API Reference
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Detailed API documentation for working with kernels
                    </p>
                    <Button variant="outline" size="sm">
                      View API Docs <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Link>

                <Link to="/developer" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">
                      Examples
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      See the architecture in action with practical examples
                    </p>
                    <Button variant="outline" size="sm">
                      View Examples <ArrowRight className="w-4 h-4 ml-2" />
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

export default ArchitecturePage;