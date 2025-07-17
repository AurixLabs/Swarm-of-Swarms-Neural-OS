import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Code, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QuickStartPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Quick Start Guide
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Get up and running with CMA Neural OS in minutes
            </p>
          </div>

          <div className="space-y-12">
            {/* Prerequisites */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Prerequisites</h2>
              <div className="bg-muted/20 p-6 rounded-lg">
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    <strong>Modern Browser</strong> - Chrome, Firefox, Safari, or Edge with WASM support
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    <strong>Development Environment</strong> - This is a development preview system
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    <strong>React/TypeScript knowledge</strong> - Required for working with the current codebase
                  </li>
                </ul>
              </div>
            </section>

            {/* Installation */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Installation</h2>
              <div className="space-y-6">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Current Status</h3>
                  <div className="bg-background p-4 rounded border">
                    <code className="text-sm text-muted-foreground">
                      This is a development preview of CMA Neural OS.<br/>
                      The system demonstrates cognitive kernel architecture<br/>
                      and ethics-first design principles.
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    The application is accessible at your current URL
                  </p>
                </div>
              </div>
            </section>

            {/* First Steps */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">First Steps</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <div className="flex items-center mb-4">
                    <Code className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Explore the Code</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Familiarize yourself with the modular architecture and kernel system
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs/architecture">
                      View Architecture <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>

                <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/20">
                  <div className="flex items-center mb-4">
                    <Play className="w-6 h-6 text-secondary mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Try Examples</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start with pre-built examples to understand the system capabilities
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/examples/assistant">
                      View Examples <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>

            {/* Configuration */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Basic Configuration</h2>
              <div className="bg-muted/20 p-6 rounded-lg">
                <p className="text-muted-foreground mb-4">
                  CMA Neural OS is currently a development preview showcasing the cognitive architecture concepts:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    Explore the developer tools at <code className="bg-background px-2 py-1 rounded">/developer</code>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    Review the codebase structure in <code className="bg-background px-2 py-1 rounded">src/core/</code>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    Examine ethics implementations in <code className="bg-background px-2 py-1 rounded">src/core/ethics/</code>
                  </li>
                </ul>
              </div>
            </section>

            {/* Next Steps */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Next Steps</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link to="/docs/architecture" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">
                      Architecture Guide
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Deep dive into the multi-kernel cognitive architecture
                    </p>
                  </div>
                </Link>

                <Link to="/docs/api" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">
                      API Reference
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Complete API documentation and examples
                    </p>
                  </div>
                </Link>

                <Link to="/developer" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">
                      Developer Tools
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Interactive development and testing environment
                    </p>
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

export default QuickStartPage;