
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReasoningTestPage from './pages/ReasoningTestPage';
import ModuleIntegrationPage from './pages/ModuleIntegrationPage';
import WasmInspectionPage from './pages/WasmInspectionPage';
import HttpProxyTestPage from './pages/HttpProxyTestPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reasoning-test" element={<ReasoningTestPage />} />
        <Route path="/module-integration" element={<ModuleIntegrationPage />} />
        <Route path="/wasm-inspection" element={<WasmInspectionPage />} />
        <Route path="/http-proxy-test" element={<HttpProxyTestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
