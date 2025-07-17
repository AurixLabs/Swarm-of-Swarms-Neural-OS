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
    "Rust WASM Compilation - Maximum computational power with smallest data footprint (10KB vs 100GB competitors)",
    "Chipped Modules - Each module is an operating system within an operating system",
    "Ultra-Lightweight AI - 10KB AI agents vs Google's 100GB Gemini, perfect for low-resource regions like Kenya",
    "Collective AGI - 1M users create distributed AGI infinitely smarter than ChatGPT/Claude through agent communication",
    "Asymmetrical Architecture - Small distributed nodes outperform massive monolithic data centers (drone warfare principle)",
    "Decentralized Power - Power to the people, not corporations (Bitcoin-inspired architecture)"
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