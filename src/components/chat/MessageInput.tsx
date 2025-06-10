
import React from 'react';
import { Send } from 'lucide-react';
import { Agent } from './types';

interface MessageInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedAgent: Agent | null;
  isLoading: boolean;
  agentsInitialized: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  setInputValue,
  selectedAgent,
  isLoading,
  agentsInitialized,
  onSendMessage,
  onKeyPress
}) => {
  return (
    <div className="border-t bg-white p-4 rounded-b-lg">
      {!selectedAgent && (
        <p className="text-sm text-gray-500 mb-3 text-center">Select a real agent above to start testing</p>
      )}
      
      <div className="flex gap-2">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={selectedAgent ? `Test real ${selectedAgent.name} processing...` : "Select an agent first..."}
          disabled={!selectedAgent || isLoading || !agentsInitialized}
          className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          rows={2}
        />
        <button
          onClick={onSendMessage}
          disabled={!inputValue.trim() || !selectedAgent || isLoading || !agentsInitialized}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
