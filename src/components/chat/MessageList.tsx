
import React from 'react';
import { Bot, User, Activity, Brain, AlertTriangle } from 'lucide-react';
import { Message } from './types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  return (
    <>
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Select a real agent above to test actual AI processing!</p>
          <p className="text-sm text-red-600 mt-2">No simulations - agents will fail if not properly loaded</p>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : message.sender === 'error'
                ? 'bg-red-100 border-red-300 text-red-800'
                : 'bg-white border text-gray-800'
            }`}
          >
            {message.sender !== 'user' && (
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                {message.sender === 'error' ? (
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                ) : (
                  <Bot className="w-3 h-3" />
                )}
                <span className="font-medium">{message.agentType}</span>
                {message.confidence && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {(message.confidence * 100).toFixed(0)}% confidence
                  </span>
                )}
              </div>
            )}
            
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            
            {/* Real Neural Activity Display */}
            {message.spikingActivity && message.spikingActivity.length > 0 && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-3 h-3" />
                  <span className="font-medium">Real Neural Activity</span>
                </div>
                <div className="flex gap-1">
                  {message.spikingActivity.slice(0, 12).map((activity, i) => (
                    <div
                      key={i}
                      className="w-2 bg-blue-200 rounded-sm"
                      style={{ 
                        backgroundColor: `rgba(59, 130, 246, ${Math.abs(activity)})`,
                        height: `${8 + Math.abs(activity) * 8}px`
                      }}
                      title={`Neuron ${i}: ${activity.toFixed(3)}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Real Reasoning Steps */}
            {message.reasoningSteps && message.reasoningSteps.length > 0 && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-3 h-3" />
                  <span className="font-medium">Real Reasoning Steps</span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {message.reasoningSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className={`text-xs mt-2 ${
              message.sender === 'user' ? 'text-blue-100' : 
              message.sender === 'error' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white border rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Brain className="w-4 h-4 animate-pulse" />
              <span>Processing through real neural pathways...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageList;
