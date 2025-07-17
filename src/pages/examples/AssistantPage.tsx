import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Brain, Shield, Code, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AssistantPage = () => {
  const [isRunning, setIsRunning] = useState(false);

  const runExample = () => {
    setIsRunning(true);
    // Simulate processing
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Personal AI Assistant
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Build your own cognitive AI assistant using CMA Neural OS
            </p>
            <div className="flex justify-center gap-3">
              <Badge variant="secondary">Cognitive AI</Badge>
              <Badge variant="outline">Multi-Kernel</Badge>
              <Badge variant="outline">Ethics-Enabled</Badge>
            </div>
          </div>

          <div className="space-y-12">
            {/* Demo Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Interactive Demo</h2>
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <MessageSquare className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">AI Assistant Demo</h3>
                  </div>
                  <Button onClick={runExample} disabled={isRunning}>
                    {isRunning ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Demo
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-background rounded-lg p-4 mb-4">
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold mr-3">
                        U
                      </div>
                      <div className="bg-muted p-3 rounded-lg flex-1">
                        <p className="text-sm">Can you help me plan a sustainable weekly meal plan?</p>
                      </div>
                    </div>

                    {isRunning ? (
                      <div className="flex">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm font-bold mr-3">
                          AI
                        </div>
                        <div className="bg-secondary/20 p-3 rounded-lg flex-1">
                          <div className="flex items-center">
                            <div className="animate-pulse flex space-x-1">
                              <div className="w-2 h-2 bg-secondary rounded-full"></div>
                              <div className="w-2 h-2 bg-secondary rounded-full"></div>
                              <div className="w-2 h-2 bg-secondary rounded-full"></div>
                            </div>
                            <span className="ml-2 text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm font-bold mr-3">
                          AI
                        </div>
                        <div className="bg-secondary/20 p-3 rounded-lg flex-1">
                          <p className="text-sm">I'd be happy to help! I've analyzed your dietary preferences and created a sustainable meal plan focusing on local, seasonal ingredients. Here's what I recommend:</p>
                          <ul className="text-sm mt-2 space-y-1">
                            <li>• Monday: Quinoa bowl with roasted vegetables</li>
                            <li>• Tuesday: Lentil curry with brown rice</li>
                            <li>• Wednesday: Chickpea salad with whole grain bread</li>
                            <li>• ... (complete plan generated based on ethics-approved guidelines)</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Brain className="w-4 h-4 text-primary mr-2" />
                    Cognitive reasoning applied
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Shield className="w-4 h-4 text-destructive mr-2" />
                    Ethics validation passed
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Code className="w-4 h-4 text-accent mr-2" />
                    WASM acceleration used
                  </div>
                </div>
              </div>
            </section>

            {/* Features */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Key Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Multi-Domain Intelligence</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    The assistant can handle diverse topics from personal productivity to technical questions, 
                    using specialized cognitive kernels for each domain.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Personal productivity and planning</li>
                    <li>• Technical problem solving</li>
                    <li>• Creative ideation and brainstorming</li>
                    <li>• Data analysis and insights</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Ethical Guidelines</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Every response is validated through the Ethics Kernel to ensure helpful, 
                    harmless, and honest assistance.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Privacy protection by design</li>
                    <li>• Bias detection and mitigation</li>
                    <li>• Harm prevention protocols</li>
                    <li>• Transparency in reasoning</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Contextual Memory</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Maintains conversation context and learns from interactions while 
                    respecting privacy boundaries.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Session-based context retention</li>
                    <li>• Preference learning</li>
                    <li>• Conversation continuity</li>
                    <li>• Secure memory management</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Offline Capability</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Core functionality works offline using local WASM modules, 
                    ensuring privacy and availability.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Local processing capability</li>
                    <li>• No mandatory cloud dependency</li>
                    <li>• Instant response times</li>
                    <li>• Data stays on device</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Architecture */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Technical Architecture</h2>
              <div className="bg-muted/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Implementation Overview</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Kernels Used</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Language Kernel:</strong> Natural language processing</li>
                        <li>• <strong>Reasoning Kernel:</strong> Logical reasoning and planning</li>
                        <li>• <strong>Memory Kernel:</strong> Context and preference management</li>
                        <li>• <strong>Ethics Kernel:</strong> Response validation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Data Flow</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• User input → Ethics validation</li>
                        <li>• Context retrieval → Memory Kernel</li>
                        <li>• Processing → Language + Reasoning</li>
                        <li>• Response validation → Ethics Kernel</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-background p-4 rounded border">
                    <h4 className="font-semibold text-foreground mb-2">Key Code Components</h4>
                    <pre className="text-xs text-muted-foreground overflow-x-auto">
{`// Initialize assistant with multiple kernels
const assistant = new PersonalAssistant({
  kernels: ['language', 'reasoning', 'memory', 'ethics'],
  config: {
    privacyMode: 'strict',
    offlineCapable: true,
    ethicsValidation: 'required'
  }
});

// Process user query
const response = await assistant.process({
  query: "Help me plan my day",
  context: userContext
});`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Implementation Guide */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Implementation Guide</h2>
              <div className="space-y-6">
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">Step 1: Setup Base Assistant</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Initialize the assistant framework with required kernels and configuration.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs/quickstart">
                      Follow Setup Guide <Download className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>

                <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/20">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Step 2: Configure Kernels</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Set up specialized kernels for language processing, reasoning, and memory management.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs/architecture">
                      Kernel Configuration <Code className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>

                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <h3 className="text-lg font-semibold text-accent mb-3">Step 3: Add Custom Logic</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Implement domain-specific functionality and customize the assistant for your use case.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs/api">
                      API Documentation <Code className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>

            {/* Next Steps */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Explore More Examples</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/examples/smarthome" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">
                      Smart Home Control
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Build cognitive home automation systems that understand context and preferences
                    </p>
                    <Badge variant="outline">IoT Integration</Badge>
                  </div>
                </Link>

                <Link to="/examples/collaboration" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">
                      Collaborative Development
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Multi-agent development environments for enhanced productivity
                    </p>
                    <Badge variant="outline">Multi-Agent</Badge>
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

export default AssistantPage;