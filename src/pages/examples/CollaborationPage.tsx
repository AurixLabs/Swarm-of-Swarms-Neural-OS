import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Code, GitBranch, MessageSquare, Play, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CollaborationPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);

  const agents = [
    { id: 'architect', name: 'System Architect', role: 'Architecture planning', color: 'text-blue-500' },
    { id: 'coder', name: 'Code Generator', role: 'Implementation', color: 'text-green-500' },
    { id: 'reviewer', name: 'Code Reviewer', role: 'Quality assurance', color: 'text-orange-500' },
    { id: 'tester', name: 'Test Engineer', role: 'Testing & validation', color: 'text-purple-500' }
  ];

  const runCollaboration = () => {
    setIsRunning(true);
    setActiveAgents([]);
    
    // Simulate agent activation sequence
    const sequence = ['architect', 'coder', 'reviewer', 'tester'];
    sequence.forEach((agentId, index) => {
      setTimeout(() => {
        setActiveAgents(prev => [...prev, agentId]);
        if (index === sequence.length - 1) {
          setTimeout(() => {
            setIsRunning(false);
            setActiveAgents([]);
          }, 2000);
        }
      }, (index + 1) * 1500);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Collaborative Development
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Multi-agent development environment for enhanced productivity
            </p>
            <div className="flex justify-center gap-3">
              <Badge variant="secondary">Multi-Agent</Badge>
              <Badge variant="outline">Code Generation</Badge>
              <Badge variant="outline">Quality Assurance</Badge>
            </div>
          </div>

          <div className="space-y-12">
            {/* Demo Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Agent Collaboration Demo</h2>
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Development Team Simulation</h3>
                  </div>
                  <Button onClick={runCollaboration} disabled={isRunning}>
                    {isRunning ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Collaborating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Project
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {agents.map((agent) => (
                    <Card 
                      key={agent.id} 
                      className={`transition-all duration-300 ${
                        activeAgents.includes(agent.id) 
                          ? 'border-primary bg-primary/5 shadow-lg' 
                          : 'bg-background'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-sm">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            activeAgents.includes(agent.id) ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span className={agent.color}>{agent.name}</span>
                          {activeAgents.includes(agent.id) && (
                            <Brain className="w-4 h-4 ml-auto animate-pulse text-primary" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{agent.role}</p>
                        {activeAgents.includes(agent.id) && (
                          <div className="mt-2 text-xs text-primary">
                            ● Processing task...
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {isRunning && (
                  <div className="bg-background rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-foreground mb-3">Project: E-commerce API</h4>
                    <div className="space-y-2 text-sm">
                      {activeAgents.includes('architect') && (
                        <div className="flex items-center text-blue-500">
                          <GitBranch className="w-4 h-4 mr-2" />
                          System Architect: Designing RESTful API structure...
                        </div>
                      )}
                      {activeAgents.includes('coder') && (
                        <div className="flex items-center text-green-500">
                          <Code className="w-4 h-4 mr-2" />
                          Code Generator: Implementing user authentication endpoints...
                        </div>
                      )}
                      {activeAgents.includes('reviewer') && (
                        <div className="flex items-center text-orange-500">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Code Reviewer: Analyzing security patterns and best practices...
                        </div>
                      )}
                      {activeAgents.includes('tester') && (
                        <div className="flex items-center text-purple-500">
                          <Zap className="w-4 h-4 mr-2" />
                          Test Engineer: Creating integration tests and API documentation...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Recent Collaborations</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• ✓ Authentication service: Architecture → Implementation → Review → Testing</p>
                    <p>• ✓ Database schema: Design validated, optimizations applied</p>
                    <p>• ✓ API endpoints: Generated with comprehensive error handling</p>
                    <p>• ⏳ Frontend integration: Currently in progress across agents</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Agent Capabilities */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Agent Capabilities</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">System Architect Agent</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Designs system architecture, data models, and integration patterns. 
                    Provides technical leadership and architectural guidance.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Architecture pattern selection</li>
                    <li>• Database schema design</li>
                    <li>• API specification creation</li>
                    <li>• Technology stack recommendations</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Code Generator Agent</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Implements features based on specifications, writes clean code, 
                    and handles complex algorithmic challenges.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Feature implementation</li>
                    <li>• Algorithm optimization</li>
                    <li>• Framework integration</li>
                    <li>• Documentation generation</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Code Reviewer Agent</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Performs thorough code reviews, identifies potential issues, 
                    and ensures adherence to best practices and security standards.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Security vulnerability detection</li>
                    <li>• Performance optimization suggestions</li>
                    <li>• Code quality assessment</li>
                    <li>• Best practice compliance</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Test Engineer Agent</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Creates comprehensive test suites, validates functionality, 
                    and ensures system reliability through automated testing.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Unit test generation</li>
                    <li>• Integration test design</li>
                    <li>• Performance benchmarking</li>
                    <li>• Quality assurance automation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Collaboration Patterns */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Collaboration Patterns</h2>
              <div className="space-y-6">
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">Sequential Development</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Agents work in sequence: Architecture → Implementation → Review → Testing
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Best for:</strong> Complex features requiring careful planning and validation
                  </div>
                </div>

                <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/20">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Parallel Processing</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Multiple agents work simultaneously on different aspects of the same project
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Best for:</strong> Large projects with independent components
                  </div>
                </div>

                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <h3 className="text-lg font-semibold text-accent mb-3">Iterative Refinement</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Agents continuously collaborate to refine and improve code through multiple iterations
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Best for:</strong> Optimization tasks and quality improvements
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Implementation */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Technical Implementation</h2>
              <div className="bg-muted/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Multi-Agent Architecture</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Core Components</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>Agent Manager:</strong> Orchestrates agent interactions</li>
                      <li>• <strong>Task Queue:</strong> Manages work distribution</li>
                      <li>• <strong>Communication Bus:</strong> Inter-agent messaging</li>
                      <li>• <strong>State Manager:</strong> Shared project state</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Integration Points</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Git repository management</li>
                      <li>• IDE plugin interface</li>
                      <li>• CI/CD pipeline integration</li>
                      <li>• Project management tools</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-background p-4 rounded border">
                  <h4 className="font-semibold text-foreground mb-2">Setup Example</h4>
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
{`// Initialize collaborative development environment
const devTeam = new CollaborativeDevelopment({
  agents: {
    architect: { specialization: 'system-design', experience: 'senior' },
    coder: { specialization: 'full-stack', experience: 'mid' },
    reviewer: { specialization: 'security', experience: 'senior' },
    tester: { specialization: 'automation', experience: 'mid' }
  },
  project: {
    type: 'web-application',
    complexity: 'medium',
    timeline: '2-weeks'
  },
  collaboration: {
    pattern: 'iterative',
    reviewThreshold: 'high',
    testCoverage: 90
  }
});

// Start project collaboration
await devTeam.startProject({
  requirements: 'Build e-commerce API with authentication',
  constraints: ['performance', 'security', 'scalability']
});`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Use Cases */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Use Cases</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">Rapid Prototyping</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Quickly build and validate proof-of-concepts with minimal human oversight
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• MVP development</li>
                    <li>• Feature exploration</li>
                    <li>• Technical feasibility studies</li>
                  </ul>
                </div>

                <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/20">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Code Quality Improvement</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Systematically improve existing codebases through automated analysis and refactoring
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Legacy code modernization</li>
                    <li>• Performance optimization</li>
                    <li>• Security hardening</li>
                  </ul>
                </div>

                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <h3 className="text-lg font-semibold text-accent mb-3">Learning & Training</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Educational tool for understanding development workflows and best practices
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Development process training</li>
                    <li>• Code review learning</li>
                    <li>• Architecture pattern examples</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Getting Started */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Getting Started</h2>
              <div className="space-y-6">
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">Step 1: Environment Setup</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Install CMA Neural OS and configure the multi-agent development environment.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs/quickstart">
                      Installation Guide
                    </Link>
                  </Button>
                </div>

                <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/20">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Step 2: Agent Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure agent specializations and collaboration patterns for your project needs.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs/api">
                      Agent API Reference
                    </Link>
                  </Button>
                </div>

                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <h3 className="text-lg font-semibold text-accent mb-3">Step 3: Project Integration</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect to your existing development tools and start collaborative development.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/developer">
                      Developer Tools
                    </Link>
                  </Button>
                </div>
              </div>
            </section>

            {/* More Examples */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Explore More Examples</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/examples/assistant" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">
                      Personal AI Assistant
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Build cognitive AI assistants for personal productivity and assistance
                    </p>
                    <Badge variant="outline">Cognitive AI</Badge>
                  </div>
                </Link>

                <Link to="/examples/smarthome" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">
                      Smart Home Control
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Cognitive home automation with privacy-first design principles
                    </p>
                    <Badge variant="outline">IoT Integration</Badge>
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

export default CollaborationPage;