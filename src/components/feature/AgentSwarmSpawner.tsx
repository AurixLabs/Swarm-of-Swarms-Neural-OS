
import React, { useState, useCallback } from 'react';
import { TinyLlamaAgent } from '../../core/agents/TinyLlamaAgent';
import { AGENT_PERSONALITIES, formatResponseWithPersonality, getRandomPersonality } from '../../core/agents/AgentPersonalities';

interface SpawnedAgent {
  id: string;
  agent: TinyLlamaAgent;
  personality: any;
  status: 'initializing' | 'ready' | 'busy' | 'error';
  responseCount: number;
  lastResponse: string;
  spawnTime: number;
}

interface SwarmStats {
  totalSpawned: number;
  activeAgents: number;
  totalResponses: number;
  averageResponseTime: number;
  memoryUsage: number;
  hardwareFunctions: number;
  softwareFunctions: number;
}

const AgentSwarmSpawner = () => {
  const [spawnedAgents, setSpawnedAgents] = useState<SpawnedAgent[]>([]);
  const [isSpawning, setIsSpawning] = useState(false);
  const [spawnCount, setSpawnCount] = useState(10);
  const [testMessage, setTestMessage] = useState("What's the meaning of life, the universe, and debugging?");
  const [swarmStats, setSwarmStats] = useState<SwarmStats>({
    totalSpawned: 0,
    activeAgents: 0,
    totalResponses: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    hardwareFunctions: 15, // ESP32 hardware functions
    softwareFunctions: 5385 // CMA software functions
  });

  const spawnAgentSwarm = async () => {
    setIsSpawning(true);
    console.log(`🚀 Spawning ${spawnCount} PhD comedian agents!`);
    
    const newAgents: SpawnedAgent[] = [];
    
    for (let i = 0; i < spawnCount; i++) {
      const personality = getRandomPersonality();
      const agentId = `comedy_agent_${Date.now()}_${i}`;
      
      console.log(`🎭 Spawning ${personality.name}...`);
      
      const agent = new TinyLlamaAgent(agentId, ['reasoning_engine', 'neuromorphic']);
      
      const spawnedAgent: SpawnedAgent = {
        id: agentId,
        agent,
        personality,
        status: 'initializing',
        responseCount: 0,
        lastResponse: '',
        spawnTime: Date.now()
      };
      
      newAgents.push(spawnedAgent);
      
      // Initialize agent
      try {
        await agent.initialize();
        spawnedAgent.status = 'ready';
        console.log(`✅ ${personality.name} is ready for comedy!`);
      } catch (error) {
        spawnedAgent.status = 'error';
        console.error(`❌ ${personality.name} failed to initialize:`, error);
      }
      
      // Add small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setSpawnedAgents(prev => [...prev, ...newAgents]);
    
    // Update stats
    setSwarmStats(prev => ({
      ...prev,
      totalSpawned: prev.totalSpawned + newAgents.length,
      activeAgents: prev.activeAgents + newAgents.filter(a => a.status === 'ready').length,
      memoryUsage: (prev.totalSpawned + newAgents.length) * 2048 // 2KB per agent estimate
    }));
    
    setIsSpawning(false);
    console.log(`🎉 Swarm spawning complete! ${newAgents.length} agents ready for PhD comedy!`);
  };

  const testAllAgents = async () => {
    console.log('🧪 Testing all agents with comedy prompt...');
    
    const activeAgents = spawnedAgents.filter(a => a.status === 'ready');
    let totalResponseTime = 0;
    let completedResponses = 0;
    
    for (const spawnedAgent of activeAgents) {
      spawnedAgent.status = 'busy';
      
      try {
        const startTime = Date.now();
        const response = await spawnedAgent.agent.processRequest(testMessage);
        const responseTime = Date.now() - startTime;
        
        // Format with personality
        const personalityResponse = formatResponseWithPersonality(
          spawnedAgent.personality,
          response.text,
          testMessage
        );
        
        spawnedAgent.lastResponse = personalityResponse;
        spawnedAgent.responseCount++;
        spawnedAgent.status = 'ready';
        
        totalResponseTime += responseTime;
        completedResponses++;
        
        console.log(`🎭 ${spawnedAgent.personality.name} responded in ${responseTime}ms`);
        
      } catch (error) {
        console.error(`❌ ${spawnedAgent.personality.name} failed:`, error);
        spawnedAgent.status = 'error';
        spawnedAgent.lastResponse = `ERROR: ${error}`;
      }
    }
    
    // Update stats
    setSwarmStats(prev => ({
      ...prev,
      totalResponses: prev.totalResponses + completedResponses,
      averageResponseTime: completedResponses > 0 ? totalResponseTime / completedResponses : 0
    }));
    
    // Trigger re-render
    setSpawnedAgents([...spawnedAgents]);
  };

  const clearSwarm = () => {
    setSpawnedAgents([]);
    setSwarmStats({
      totalSpawned: 0,
      activeAgents: 0,
      totalResponses: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      hardwareFunctions: 15,
      softwareFunctions: 5385
    });
    console.log('🧹 Swarm cleared!');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-purple-600">
        🎭 PhD COMEDIAN AGENT SWARM SPAWNER! 🎭
      </h2>
      
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <p className="text-gray-700 mb-4">
          <strong>THE EXPERIMENT:</strong> Spawn multiple personality-driven agents with PhD-level humor!
          <br />
          <strong>THE GOAL:</strong> Test how many hilarious genius agents our CMA + ESP32 system can handle!
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mb-4">
          <div className="p-3 bg-blue-100 rounded">
            <div className="text-2xl font-bold text-blue-600">{swarmStats.totalSpawned}</div>
            <div className="text-sm text-blue-800">Total Spawned</div>
          </div>
          <div className="p-3 bg-green-100 rounded">
            <div className="text-2xl font-bold text-green-600">{swarmStats.activeAgents}</div>
            <div className="text-sm text-green-800">Active Agents</div>
          </div>
          <div className="p-3 bg-orange-100 rounded">
            <div className="text-2xl font-bold text-orange-600">{swarmStats.totalResponses}</div>
            <div className="text-sm text-orange-800">Total Responses</div>
          </div>
          <div className="p-3 bg-red-100 rounded">
            <div className="text-2xl font-bold text-red-600">{Math.round(swarmStats.averageResponseTime)}ms</div>
            <div className="text-sm text-red-800">Avg Response Time</div>
          </div>
          <div className="p-3 bg-purple-100 rounded">
            <div className="text-xl font-bold text-purple-600">{(swarmStats.memoryUsage / 1024).toFixed(1)}KB</div>
            <div className="text-sm text-purple-800">Memory Usage</div>
          </div>
        </div>
        
        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            type="number"
            value={spawnCount}
            onChange={(e) => setSpawnCount(parseInt(e.target.value) || 1)}
            min="1"
            max="100"
            className="px-3 py-2 border rounded w-24"
            placeholder="Count"
          />
          
          <button
            onClick={spawnAgentSwarm}
            disabled={isSpawning}
            className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 font-bold"
          >
            {isSpawning ? '🚀 SPAWNING...' : '🎭 SPAWN COMEDY AGENTS!'}
          </button>
          
          <button
            onClick={testAllAgents}
            disabled={spawnedAgents.length === 0}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            🧪 TEST ALL AGENTS
          </button>
          
          <button
            onClick={clearSwarm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🧹 Clear Swarm
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Test Message:</label>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Ask something hilarious..."
          />
        </div>
      </div>

      {/* Available Personalities */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold mb-3">🎯 Available PhD Comedian Personalities:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AGENT_PERSONALITIES.map((personality) => (
            <div key={personality.id} className="p-3 bg-white rounded border">
              <div className="font-bold text-sm">{personality.name}</div>
              <div className="text-xs text-gray-600">{personality.description}</div>
              <div className="text-xs text-purple-600">Style: {personality.comedyStyle}</div>
              <div className="text-xs italic mt-1">"{personality.catchPhrase}"</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Agents */}
      {spawnedAgents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">🤖 Active Comedy Agents ({spawnedAgents.length}):</h3>
          
          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
            {spawnedAgents.map((spawnedAgent) => (
              <div key={spawnedAgent.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">{spawnedAgent.personality.name}</h4>
                  <div className={`px-2 py-1 rounded text-xs ${
                    spawnedAgent.status === 'ready' ? 'bg-green-100 text-green-800' :
                    spawnedAgent.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                    spawnedAgent.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {spawnedAgent.status} ({spawnedAgent.responseCount} responses)
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {spawnedAgent.personality.description} | {spawnedAgent.personality.academicField}
                </div>
                
                {spawnedAgent.lastResponse && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">🎭 Latest Comedy Response</summary>
                    <div className="mt-2 max-h-32 overflow-y-auto text-xs bg-white p-2 rounded border">
                      <pre className="whitespace-pre-wrap">{spawnedAgent.lastResponse}</pre>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <h4 className="font-bold mb-2">🔥 CMA SWARM INTEGRATION STATUS:</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <div>• <strong>Hardware Functions:</strong> {swarmStats.hardwareFunctions} ESP32 functions available</div>
          <div>• <strong>Software Functions:</strong> {swarmStats.softwareFunctions} CMA reasoning functions</div>
          <div>• <strong>Agent Spawning:</strong> Unlimited PhD comedians ready for deployment!</div>
          <div>• <strong>Memory Efficiency:</strong> {(swarmStats.memoryUsage / 1024).toFixed(1)}KB total for {swarmStats.totalSpawned} agents</div>
          <div>• <strong>Comedy Level:</strong> Maximum academic hilarity achieved! 🎭</div>
        </div>
      </div>
    </div>
  );
};

export default AgentSwarmSpawner;
