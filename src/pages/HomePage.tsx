import React from 'react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const features = [
    "Neural Architecture - Cognitive modular design with emergent intelligence capabilities",
    "Immutable Ethics - Built-in ethical safeguards that cannot be bypassed or modified", 
    "Hardware Integration - Native WASM support for high-performance cognitive computing",
    "Self-Healing - Automatic recovery and adaptation to system failures",
    "Intent-Driven UI - Interface that adapts to user intentions and cognitive patterns",
    "Open Source - MIT licensed with full transparency and community contributions",
    "Modular Runtime - Modules can be added or removed during runtime without cascade system failure",
    "Distributed Intelligence - More users online = stronger, smarter system through swarm collective intelligence",
    "Swarm of Swarms Architecture - AI chatbots communicate with each other creating AGI effects",
    "Chip Agnostic - Works on Raspberry Pi, ESP32, Neuromorphic, Photonic, and Quantum chips ($20 to enterprise)",
    "Privacy First - Each user is a mesh network node with local data storage and optional cloud backup",
    "Rust WASM Compilation - Maximum computational power with optimized data footprint vs competitors' multi-GB models",
    "Chipped Modules - Each module is an operating system within an operating system",
    "Ultra-Lightweight AI - Compact AI agents (MB not GB) vs competitors' multi-GB models, optimized for low-resource regions",
    "Collective Intelligence - Distributed users create emergent intelligence through agent communication networks",
    "Asymmetrical Architecture - Small distributed nodes can outperform massive centralized systems",
    "Decentralized Power - Distributed architecture following decentralized principles"
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            GoodyMorgan
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-semibold mb-8 text-foreground">
            CMA Swarm of Swarms Neural AI Operating System
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-16">
            Founders: Holy Trinity: Arthur Wing-Kay Leung, Lovable, Deepseek
          </p>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-foreground">Revolutionary Features</h3>
            <ul className="text-left space-y-4">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-lg text-muted-foreground flex items-start"
                >
                  <span className="text-primary mr-3">•</span>
                  {feature}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Regional Use Cases Section */}
          <div className="max-w-3xl mx-auto mt-16">
            <h3 className="text-2xl font-bold mb-8 text-foreground">Empowering Resource-Limited Regions</h3>
            <div className="text-left space-y-6">
              <p className="text-lg text-muted-foreground mb-6">
                Designed specifically for regions with limited internet, infrastructure, and capital resources:
              </p>
              
              <div className="space-y-4">
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">🌍 Sub-Saharan Africa (Kenya, Nigeria, Ghana, Tanzania)</h4>
                  <p className="text-sm text-muted-foreground">Low-cost smartphones, intermittent internet, local AI processing for agriculture, healthcare, and education</p>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">🇮🇳 Rural India & Southeast Asia</h4>
                  <p className="text-sm text-muted-foreground">Village-level distributed computing, local language processing, agricultural optimization, micro-finance</p>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">🌎 Rural Latin America (Bolivia, Peru, Guatemala)</h4>
                  <p className="text-sm text-muted-foreground">Indigenous language support, remote healthcare diagnostics, agricultural planning, disaster response</p>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">🏝️ Island Nations & Remote Communities</h4>
                  <p className="text-sm text-muted-foreground">Pacific Islands, Caribbean, Arctic communities - mesh networks for isolated populations</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">💡 Real-World Impact</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• $100 smartphones running full AI capabilities locally</li>
                  <li>• Offline-first design with mesh networking for connectivity</li>
                  <li>• Local data privacy - no need to send sensitive information to distant servers</li>
                  <li>• Collective intelligence grows stronger as more local users join</li>
                  <li>• Solar-powered ESP32 nodes for rural deployment</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <span className="font-medium">License:</span> Check License of Use
            </p>
            <p>
              <span className="font-medium">Contact:</span>{' '}
              <a 
                href="mailto:arthur@aurixlabs.ai" 
                className="text-primary hover:underline"
              >
                arthur@aurixlabs.ai
              </a>{' '}
              for commercial licensing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;