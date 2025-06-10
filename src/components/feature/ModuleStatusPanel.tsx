
import React from 'react';

interface ModuleStatusPanelProps {
  moduleStatuses: Record<string, boolean>;
  onRefresh: () => void;
}

const ModuleStatusPanel: React.FC<ModuleStatusPanelProps> = ({ moduleStatuses, onRefresh }) => {
  const totalModules = Object.keys(moduleStatuses).length;
  const loadedModules = Object.values(moduleStatuses).filter(Boolean).length;
  const successRate = totalModules > 0 ? (loadedModules / totalModules) * 100 : 0;

  return (
    <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">🎯 Module Status Overview</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{loadedModules}</div>
          <div className="text-sm text-blue-800">Modules Loaded</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{totalModules}</div>
          <div className="text-sm text-gray-800">Total Modules</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{successRate.toFixed(0)}%</div>
          <div className="text-sm text-green-800">Success Rate</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-gray-700 mb-3">Module Details</h3>
        {Object.entries(moduleStatuses).map(([moduleId, status]) => (
          <div key={moduleId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">{moduleId.replace(/_/g, ' ').toUpperCase()}</span>
            </div>
            <span className={`text-sm px-2 py-1 rounded ${status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {status ? 'READY' : 'FAILED'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleStatusPanel;
