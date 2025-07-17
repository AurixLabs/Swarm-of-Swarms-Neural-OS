import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Thermometer, Lightbulb, Shield, Wifi, Battery, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SmartHomePage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  const runSimulation = () => {
    setIsRunning(true);
    setSimulationStep(0);
    
    const steps = [
      "Analyzing user presence patterns...",
      "Evaluating environmental conditions...",
      "Checking energy efficiency constraints...",
      "Applying privacy and security protocols...",
      "Generating optimization recommendations..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setSimulationStep(currentStep);
      
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setIsRunning(false);
        setSimulationStep(0);
      }
    }, 1000);
  };

  const deviceStates = [
    { name: "Living Room Lights", status: "Auto-dimmed (Energy save)", icon: Lightbulb, color: "text-yellow-500" },
    { name: "Thermostat", status: "22°C (Comfort optimized)", icon: Thermometer, color: "text-blue-500" },
    { name: "Security System", status: "Active (Privacy mode)", icon: Shield, color: "text-green-500" },
    { name: "Smart Speakers", status: "Local processing only", icon: Wifi, color: "text-purple-500" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Smart Home Control
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Development preview demonstrating cognitive home automation architecture
            </p>
            <div className="flex justify-center gap-3">
              <Badge variant="secondary">IoT Integration</Badge>
              <Badge variant="outline">Privacy-First</Badge>
              <Badge variant="outline">Energy Efficient</Badge>
            </div>
          </div>

          <div className="space-y-12">
            {/* Demo Dashboard */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Smart Home Dashboard</h2>
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Home className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Cognitive Home Management</h3>
                  </div>
                  <Button onClick={runSimulation} disabled={isRunning}>
                    {isRunning ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Optimization
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {deviceStates.map((device, index) => (
                    <Card key={index} className="bg-background">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-sm">
                          <device.icon className={`w-4 h-4 mr-2 ${device.color}`} />
                          {device.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{device.status}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {isRunning && (
                  <div className="bg-background rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <div className="animate-pulse w-3 h-3 bg-primary rounded-full mr-3"></div>
                      <span className="text-sm font-medium">System Optimization in Progress</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {simulationStep >= 1 && <p>✓ Analyzing user presence patterns...</p>}
                      {simulationStep >= 2 && <p>✓ Evaluating environmental conditions...</p>}
                      {simulationStep >= 3 && <p>✓ Checking energy efficiency constraints...</p>}
                      {simulationStep >= 4 && <p>✓ Applying privacy and security protocols...</p>}
                      {simulationStep >= 5 && <p>✓ Generating optimization recommendations...</p>}
                    </div>
                  </div>
                )}

                <div className="bg-background rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Architectural Concepts</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Multi-kernel coordination for IoT management</p>
                    <p>• Privacy-first local processing design</p>
                    <p>• Ethics validation for automated decisions</p>
                    <p>• Modular sensor integration architecture</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Features */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Cognitive Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Context Awareness</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    The system learns from daily patterns, seasonal changes, and user preferences 
                    to make intelligent automation decisions.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Occupancy pattern learning</li>
                    <li>• Weather adaptation</li>
                    <li>• Routine optimization</li>
                    <li>• Preference evolution tracking</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Privacy-First Design</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    All processing happens locally when possible, with encrypted communication 
                    and strict data minimization principles.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Local-first processing</li>
                    <li>• Encrypted device communication</li>
                    <li>• No personal data in cloud</li>
                    <li>• User-controlled data sharing</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Energy Optimization</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    AI-driven energy management that balances comfort, cost, and environmental impact 
                    through intelligent device coordination.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Peak hour avoidance</li>
                    <li>• Renewable energy prioritization</li>
                    <li>• Load balancing across devices</li>
                    <li>• Predictive maintenance scheduling</li>
                  </ul>
                </div>

                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Adaptive Security</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Dynamic security protocols that adapt to context, threat levels, 
                    and user behavior patterns for optimal protection.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Behavioral anomaly detection</li>
                    <li>• Contextual access control</li>
                    <li>• Automatic threat response</li>
                    <li>• Privacy mode automation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Architecture */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">System Architecture</h2>
              <div className="bg-muted/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Multi-Kernel Integration</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Active Kernels</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>IoT Kernel:</strong> Device communication and control</li>
                      <li>• <strong>Pattern Kernel:</strong> Usage pattern analysis</li>
                      <li>• <strong>Environment Kernel:</strong> Sensor data processing</li>
                      <li>• <strong>Security Kernel:</strong> Access control and monitoring</li>
                      <li>• <strong>Ethics Kernel:</strong> Privacy and safety validation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Device Protocols</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Matter/Thread compatibility</li>
                      <li>• Zigbee mesh networking</li>
                      <li>• WiFi 6E local processing</li>
                      <li>• Bluetooth LE sensors</li>
                      <li>• Edge computing nodes</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-background p-4 rounded border">
                  <h4 className="font-semibold text-foreground mb-2">Architecture Concept</h4>
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
{`// Planned IoT integration architecture
// This demonstrates the design principles

interface IoTArchitecture {
  kernels: ['iot', 'security', 'ethics'];
  principles: {
    privacyFirst: boolean;
    localProcessing: boolean;
    ethicsValidation: boolean;
  };
}

// Development preview - implementation in progress`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Hardware Requirements */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Hardware Requirements</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <div className="flex items-center mb-3">
                    <Battery className="w-5 h-5 text-primary mr-2" />
                    <h3 className="text-lg font-semibold text-primary">Minimal Setup</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Entry-level setup for basic automation and learning
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Raspberry Pi 4 (4GB)</li>
                    <li>• Basic IoT sensors (3-5 devices)</li>
                    <li>• WiFi 5 router</li>
                    <li>• 32GB SD card storage</li>
                  </ul>
                  <p className="text-xs text-primary mt-3 font-semibold">~$150 total cost</p>
                </div>

                <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/20">
                  <div className="flex items-center mb-3">
                    <Home className="w-5 h-5 text-secondary mr-2" />
                    <h3 className="text-lg font-semibold text-secondary">Standard Home</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Full-featured setup for comprehensive home automation
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Mini PC or NUC (8GB RAM)</li>
                    <li>• 15-20 smart devices</li>
                    <li>• WiFi 6 mesh system</li>
                    <li>• 256GB SSD storage</li>
                  </ul>
                  <p className="text-xs text-secondary mt-3 font-semibold">~$500 total cost</p>
                </div>

                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <div className="flex items-center mb-3">
                    <Shield className="w-5 h-5 text-accent mr-2" />
                    <h3 className="text-lg font-semibold text-accent">Enterprise</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Commercial-grade setup with enhanced security and performance
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Server-grade hardware</li>
                    <li>• 50+ device management</li>
                    <li>• Enterprise security stack</li>
                    <li>• Redundant storage (1TB+)</li>
                  </ul>
                  <p className="text-xs text-accent mt-3 font-semibold">~$2000+ total cost</p>
                </div>
              </div>
            </section>

            {/* Next Steps */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Implementation Guide</h2>
              <div className="space-y-6">
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">Phase 1: Core Setup</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Install CMA Neural OS on your hub device and configure basic IoT connectivity.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs/quickstart">
                      Setup Guide
                    </Link>
                  </Button>
                </div>

                <div className="bg-secondary/10 p-6 rounded-lg border border-secondary/20">
                  <h3 className="text-lg font-semibold text-secondary mb-3">Phase 2: Device Integration</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect your smart devices and configure the IoT and Security kernels.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs/api">
                      IoT API Reference
                    </Link>
                  </Button>
                </div>

                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <h3 className="text-lg font-semibold text-accent mb-3">Phase 3: Intelligence Training</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Allow the system to learn your patterns and preferences over 2-4 weeks.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/examples/collaboration">
                      Multi-Agent Examples
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
                      Build cognitive AI assistants that understand context and preferences
                    </p>
                    <Badge variant="outline">Cognitive AI</Badge>
                  </div>
                </Link>

                <Link to="/examples/collaboration" className="group">
                  <div className="bg-muted/20 p-6 rounded-lg border hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">
                      Collaborative Development
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Multi-agent systems for enhanced development productivity
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

export default SmartHomePage;