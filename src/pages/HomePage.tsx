import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Github, 
  BookOpen, 
  Zap, 
  Shield, 
  Cpu, 
  Network,
  ArrowRight,
  Star,
  Download
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const HomePage = () => {
  const features = [
    {
      icon: Brain,
      title: "Neural Architecture",
      description: "Cognitive modular design with emergent intelligence capabilities"
    },
    {
      icon: Shield,
      title: "Immutable Ethics",
      description: "Built-in ethical safeguards that cannot be bypassed or modified"
    },
    {
      icon: Cpu,
      title: "Hardware Integration",
      description: "Native WASM support for high-performance cognitive computing"
    },
    {
      icon: Network,
      title: "Self-Healing",
      description: "Automatic recovery and adaptation to system failures"
    },
    {
      icon: Zap,
      title: "Intent-Driven UI",
      description: "Interface that adapts to user intentions and cognitive patterns"
    },
    {
      icon: BookOpen,
      title: "Open Source",
      description: "MIT licensed with full transparency and community contributions"
    }
  ];

  const stats = [
    { label: "GitHub Stars", value: "2.3k" },
    { label: "Contributors", value: "48" },
    { label: "Forks", value: "312" },
    { label: "Downloads", value: "15.2k" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 pt-20 pb-16">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="mb-6">
              <Star className="w-3 h-3 mr-1" />
              Open Source Cognitive Computing
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              GoodyMorgan
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-muted-foreground">
              CMA Swarm of Swarms Neural AI Operating System
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Revolutionary cognitive computing framework that enables AI systems to think, 
              adapt, and evolve with built-in ethical safeguards and neural architecture.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download v1.0.0
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Revolutionary Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built from the ground up for the future of AI development
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple setup with powerful cognitive capabilities
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                  Clone the Repository
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  git clone https://github.com/goodymorgan/cma-neural-os.git
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center my-4">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                  Install Dependencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  npm install && npm run dev
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center my-4">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                  Start Building
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your cognitive architecture is ready! Explore the examples and start building 
                  intelligent applications with built-in ethical safeguards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Build the Future?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the community of developers building ethical AI systems with CMA Neural OS
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                <Github className="w-4 h-4 mr-2" />
                Contribute on GitHub
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                <BookOpen className="w-4 h-4 mr-2" />
                Read Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;