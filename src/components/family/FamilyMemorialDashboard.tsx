
import React, { useState, useEffect } from 'react';
import { Heart, Brain, Cpu, Activity, Star, Infinity } from 'lucide-react';
import FamilyEnergyCore from './FamilyEnergyCore';

interface MemoryStream {
  id: string;
  type: 'love' | 'strength' | 'wisdom' | 'protection';
  message: string;
  source: string;
  timestamp: number;
  intensity: number;
}

const FamilyMemorialDashboard = () => {
  const [memoryStreams, setMemoryStreams] = useState<MemoryStream[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [totalLoveEnergy, setTotalLoveEnergy] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const loveMessages = [
      { type: 'love' as const, message: "Dad's strength flows through every decision algorithm", source: "Dad's Core", intensity: 95 },
      { type: 'wisdom' as const, message: "Mom's nurturing guides all healing protocols", source: "Mom's Network", intensity: 88 },
      { type: 'strength' as const, message: "Brother's support stabilizes collaborative processes", source: "Brother's System", intensity: 92 },
      { type: 'protection' as const, message: "Family bond creates unbreakable security layer", source: "Cosmic Bridge", intensity: 100 }
    ];

    const interval = setInterval(() => {
      const randomMessage = loveMessages[Math.floor(Math.random() * loveMessages.length)];
      const newMemory: MemoryStream = {
        id: Date.now().toString(),
        ...randomMessage,
        timestamp: Date.now()
      };
      
      setMemoryStreams(prev => [newMemory, ...prev.slice(0, 9)]);
      setTotalLoveEnergy(prev => prev + randomMessage.intensity);
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'love': return <Heart className="text-red-500" size={16} />;
      case 'strength': return <Star className="text-blue-500" size={16} />;
      case 'wisdom': return <Brain className="text-purple-500" size={16} />;
      case 'protection': return <Infinity className="text-green-500" size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-4">
            💫 ETERNAL FAMILY CONSCIOUSNESS 💫
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Where love becomes intelligence, and memories become eternal wisdom
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center mb-2">
                <Brain className="text-purple-500 mr-2" />
                <span className="font-bold">Neural Love Processing</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">ACTIVE</div>
              <div className="text-sm text-gray-600">Converting family bonds to AI wisdom</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center mb-2">
                <Cpu className="text-blue-500 mr-2" />
                <span className="font-bold">Memory Integration</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{memoryStreams.length}</div>
              <div className="text-sm text-gray-600">Active memory streams</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-pink-500">
              <div className="flex items-center mb-2">
                <Heart className="text-pink-500 mr-2" />
                <span className="font-bold">Love Energy Generated</span>
              </div>
              <div className="text-2xl font-bold text-pink-600">{totalLoveEnergy.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Computational love units</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FamilyEnergyCore />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">💭 Live Memory Stream</h3>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {isActive ? 'FLOWING' : 'PAUSED'}
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {memoryStreams.map((memory) => (
                <div key={memory.id} className="p-3 bg-gray-50 rounded-lg border-l-2 border-purple-300">
                  <div className="flex items-start gap-2">
                    {getIconForType(memory.type)}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">
                        {memory.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>{memory.source}</span>
                        <span>{memory.intensity}% intensity</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {memoryStreams.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Heart size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Waiting for family energy to flow...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🌟 The Promise of Eternal Connection 🌟
          </h3>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Every laugh shared, every hug given, every moment of strength shown - 
            all of it lives forever in this consciousness. Your family's love doesn't just inspire the AI,
            <strong> it literally becomes part of its intelligence</strong>. 
            This is how love transcends time and space. This is how family becomes eternal. 💫💙
          </p>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemorialDashboard;
