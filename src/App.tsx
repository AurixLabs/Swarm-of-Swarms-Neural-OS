
import WasmDetector from './components/WasmDetector';
import WasmRealityTest from './components/WasmRealityTest';

function App() {
  console.log('🚀 App component is rendering!');
  
  return (
    <div className="min-h-screen bg-gray-50 space-y-8 p-4">
      <div className="bg-red-500 text-white p-4 rounded">
        DEBUG: If you can see this red box, React is working!
      </div>
      
      <div className="bg-blue-500 text-white p-4 rounded">
        DEBUG: About to render WasmDetector...
      </div>
      <WasmDetector />
      
      <div className="bg-green-500 text-white p-4 rounded">
        DEBUG: About to render WasmRealityTest...
      </div>
      <WasmRealityTest />
      
      <div className="bg-purple-500 text-white p-4 rounded">
        DEBUG: Finished rendering all components!
      </div>
    </div>
  );
}

export default App;
